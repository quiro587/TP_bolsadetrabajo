package com.tuempresa.proyecto.service;

import com.tuempresa.proyecto.entity.Ciudadano;
import com.tuempresa.proyecto.entity.Educacion;
import com.tuempresa.proyecto.entity.ExperienciaLaboral;
import com.tuempresa.proyecto.entity.Entrevista;
import com.tuempresa.proyecto.entity.User;
import com.tuempresa.proyecto.repository.CiudadanoRepository;
import com.tuempresa.proyecto.repository.EntrevistaRepository;
import com.tuempresa.proyecto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CiudadanoService {

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntrevistaRepository entrevistaRepository;

    @Transactional
    public Ciudadano guardarCiudadano(Ciudadano ciudadano) throws Exception {
        // Validar obligatoriedad y formato de DNI
        if (ciudadano.getDni() == null || ciudadano.getDni().trim().isEmpty()) {
            throw new Exception("El DNI es obligatorio.");
        }
        String cleanDni = ciudadano.getDni().replaceAll("\\D", "");
        if (cleanDni.length() < 7 || cleanDni.length() > 8) {
            throw new Exception("El DNI debe tener entre 7 y 8 dígitos numéricos.");
        }

        // Validar obligatoriedad y formato de CUIL
        if (ciudadano.getCuil() == null || ciudadano.getCuil().trim().isEmpty()) {
            throw new Exception("El CUIL es obligatorio.");
        }
        String cleanCuil = ciudadano.getCuil().replaceAll("\\D", "");
        if (cleanCuil.length() != 11) {
            throw new Exception("El CUIL debe tener exactamente 11 dígitos numéricos.");
        }

        // Validar correlación entre DNI y CUIL
        if (!cleanCuil.contains(cleanDni)) {
            throw new Exception("El CUIL no es válido para el DNI ingresado (el DNI debe estar contenido en el CUIL).");
        }

        // Validar Fecha de Nacimiento
        if (ciudadano.getFechaNacimiento() == null) {
            throw new Exception("La fecha de nacimiento es obligatoria.");
        }
        if (ciudadano.getFechaNacimiento().isAfter(java.time.LocalDate.now())) {
            throw new Exception("La fecha de nacimiento no puede ser en el futuro.");
        }
        java.time.LocalDate minAge = java.time.LocalDate.now().minusYears(14);
        java.time.LocalDate maxAge = java.time.LocalDate.now().minusYears(100);
        if (ciudadano.getFechaNacimiento().isAfter(minAge)) {
            throw new Exception("El postulante debe ser mayor de 14 años.");
        }
        if (ciudadano.getFechaNacimiento().isBefore(maxAge)) {
            throw new Exception("La fecha de nacimiento no es válida.");
        }

        // Validar obligatoriedad del teléfono primario
        if (ciudadano.getTelefonoPrimario() == null || ciudadano.getTelefonoPrimario().trim().isEmpty()) {
            throw new Exception("El teléfono principal es obligatorio.");
        }

        // Validar Fechas de Experiencia Laboral
        if (ciudadano.getExperienciasLaborales() != null) {
            for (com.tuempresa.proyecto.entity.ExperienciaLaboral exp : ciudadano.getExperienciasLaborales()) {
                if (exp.getEmpresa() == null || exp.getEmpresa().trim().isEmpty()) {
                    throw new Exception("La empresa es obligatoria en todas las experiencias laborales.");
                }
                if (exp.getPuesto() == null || exp.getPuesto().trim().isEmpty()) {
                    throw new Exception("El puesto es obligatorio en todas las experiencias laborales.");
                }
                if (exp.getFechaInicio() != null && exp.getFechaFin() != null && (exp.getCurrentlyWorking() == null || !exp.getCurrentlyWorking())) {
                    if (exp.getFechaInicio().isAfter(exp.getFechaFin())) {
                        throw new Exception("En la experiencia laboral (" + exp.getEmpresa() + "), la fecha de inicio no puede ser posterior a la fecha de fin.");
                    }
                }
            }
        }

        // Validar Educación
        if (ciudadano.getEducaciones() != null) {
            for (com.tuempresa.proyecto.entity.Educacion edu : ciudadano.getEducaciones()) {
                if (edu.getInstitucion() == null || edu.getInstitucion().trim().isEmpty()) {
                    throw new Exception("La institución es obligatoria en todos los estudios.");
                }
                if (edu.getNivelAlcanzado() == null || edu.getNivelAlcanzado().trim().isEmpty()) {
                    throw new Exception("El nivel alcanzado es obligatorio en todos los estudios.");
                }
                if (edu.getAnioUltimoAprobado() != null) {
                    int currentYear = java.time.LocalDate.now().getYear();
                    if (edu.getAnioUltimoAprobado() < 1940 || edu.getAnioUltimoAprobado() > currentYear + 10) {
                        throw new Exception("El año de egreso o último aprobado (" + edu.getAnioUltimoAprobado() + ") no es válido.");
                    }
                }
            }
        }

        boolean isNew = ciudadano.getId() == null;

        // Validar unicidad de DNI y CUIL
        if (isNew) {
            Optional<Ciudadano> existingDni = ciudadanoRepository.findByDni(ciudadano.getDni());
            if (existingDni.isPresent()) {
                Ciudadano exist = existingDni.get();
                if (exist.getActivo()) {
                    throw new Exception("Ya existe un ciudadano registrado con ese DNI.");
                } else {
                    // Validar que el CUIL de la reactivación no esté en uso por otro ciudadano ACTIVO
                    Optional<Ciudadano> existingCuil = ciudadanoRepository.findByCuil(ciudadano.getCuil());
                    if (existingCuil.isPresent() && !existingCuil.get().getId().equals(exist.getId())) {
                        if (existingCuil.get().getActivo()) {
                            throw new Exception("El CUIL ya está en uso por otro ciudadano activo.");
                        } else {
                            throw new Exception("Conflicto de registros inactivos (el DNI y el CUIL coinciden con distintos postulantes eliminados).");
                        }
                    }
                    // Reactivar e integrar el registro inactivo existente
                    reactivarCiudadanoInactivo(exist, ciudadano);
                    ciudadano = exist;
                    isNew = true; // Sigue considerándose alta nueva a efectos de registro de la entrevista
                }
            } else {
                Optional<Ciudadano> existingCuil = ciudadanoRepository.findByCuil(ciudadano.getCuil());
                if (existingCuil.isPresent()) {
                    Ciudadano exist = existingCuil.get();
                    if (exist.getActivo()) {
                        throw new Exception("Ya existe un ciudadano registrado con ese CUIL.");
                    } else {
                        // Reactivar e integrar el registro inactivo existente
                        reactivarCiudadanoInactivo(exist, ciudadano);
                        ciudadano = exist;
                        isNew = true; // Sigue considerándose alta nueva a efectos de registro de la entrevista
                    }
                }
            }
        } else {
            Optional<Ciudadano> cDni = ciudadanoRepository.findByDni(ciudadano.getDni());
            if (cDni.isPresent() && !cDni.get().getId().equals(ciudadano.getId())) {
                throw new Exception("Ya existe otro ciudadano registrado con ese DNI.");
            }
            Optional<Ciudadano> cCuil = ciudadanoRepository.findByCuil(ciudadano.getCuil());
            if (cCuil.isPresent() && !cCuil.get().getId().equals(ciudadano.getId())) {
                throw new Exception("Ya existe otro ciudadano registrado con ese CUIL.");
            }
        }

        // Establecer la relación bidireccional para Educacion
        if (ciudadano.getEducaciones() != null) {
            for (Educacion edu : ciudadano.getEducaciones()) {
                edu.setCiudadano(ciudadano);
            }
        }

        // Establecer la relación bidireccional para ExperienciaLaboral
        if (ciudadano.getExperienciasLaborales() != null) {
            for (ExperienciaLaboral exp : ciudadano.getExperienciasLaborales()) {
                exp.setCiudadano(ciudadano);
            }
        }

        Ciudadano guardado = ciudadanoRepository.save(ciudadano);

        if (isNew) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                    String username = auth.getName();
                    Optional<User> optUser = userRepository.findByUsername(username);
                    if (optUser.isPresent()) {
                        User user = optUser.get();
                        Entrevista entrevista = new Entrevista();
                        entrevista.setCiudadano(guardado);
                        entrevista.setPersonal(user);
                        entrevista.setFechaEntrevista(LocalDateTime.now());
                        entrevista.setObjetivoConsulta("Registro inicial");
                        entrevista.setObservacionesTecnicas("Agregado por sistema");
                        entrevistaRepository.save(entrevista);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error al asociar entrevistador al ciudadano registrado: " + e.getMessage());
            }
        }

        return guardado;
    }

    private void reactivarCiudadanoInactivo(Ciudadano target, Ciudadano source) {
        target.setNombre(source.getNombre());
        target.setApellido(source.getApellido());
        target.setDni(source.getDni());
        target.setCuil(source.getCuil());
        target.setFechaNacimiento(source.getFechaNacimiento());
        target.setGenero(source.getGenero());
        target.setDireccion(source.getDireccion());
        target.setPuntosReferenciaDomicilio(source.getPuntosReferenciaDomicilio());
        target.setTelefonoPrimario(source.getTelefonoPrimario());
        target.setTelefonoSecundario(source.getTelefonoSecundario());
        target.setEmail(source.getEmail());
        target.setEstadoCivil(source.getEstadoCivil());
        target.setHijosACargo(source.getHijosACargo());
        target.setCudDiscapacidad(source.getCudDiscapacidad());
        target.setTipoDiscapacidad(source.getTipoDiscapacidad());
        target.setCudVencimiento(source.getCudVencimiento());
        target.setMovilidadPropia(source.getMovilidadPropia());
        target.setLicenciaConducir(source.getLicenciaConducir());
        target.setCvUrl(source.getCvUrl());
        target.setTipoEmpleoBuscado(source.getTipoEmpleoBuscado());
        target.setSituacionMonotributo(source.getSituacionMonotributo());
        target.setSituacionResponsableInscripto(source.getSituacionResponsableInscripto());
        target.setSituacionAter(source.getSituacionAter());
        target.setSituacionHabilitacionMunicipal(source.getSituacionHabilitacionMunicipal());
        target.setSituacionRegistroEspecifico(source.getSituacionRegistroEspecifico());
        target.setTieneObraSocial(source.getTieneObraSocial());
        target.setPlanSocialActivo(source.getPlanSocialActivo());
        target.setObservacionesGenerales(source.getObservacionesGenerales());
        target.setHabilidades(source.getHabilidades());
        target.setFoto(source.getFoto());
        target.setEstadoLaboral(source.getEstadoLaboral());
        target.setRubros(source.getRubros());
        target.setBarrio(source.getBarrio());

        // Actualizar colecciones limpiando y re-asociando
        target.getEducaciones().clear();
        if (source.getEducaciones() != null) {
            for (Educacion edu : source.getEducaciones()) {
                edu.setCiudadano(target);
                target.getEducaciones().add(edu);
            }
        }

        target.getExperienciasLaborales().clear();
        if (source.getExperienciasLaborales() != null) {
            for (ExperienciaLaboral exp : source.getExperienciasLaborales()) {
                exp.setCiudadano(target);
                target.getExperienciasLaborales().add(exp);
            }
        }

        target.setActivo(true);
        target.setDeletedAt(null);
    }

    public List<Ciudadano> obtenerTodosActivos() {
        return ciudadanoRepository.findByActivoTrue();
    }

    public List<Ciudadano> buscarActivos(String search) {
        if (search == null || search.trim().isEmpty()) {
            return obtenerTodosActivos();
        }
        return ciudadanoRepository.buscarCiudadanosActivos(search.trim());
    }

    public List<Ciudadano> buscarActivosConFiltro(String search, Integer rubroId) {
        List<Ciudadano> lista = buscarActivos(search);
        if (rubroId != null) {
            return lista.stream()
                .filter(c -> c.getRubros() != null && c.getRubros().stream().anyMatch(r -> r.getId().equals(rubroId)))
                .toList();
        }
        return lista;
    }

    public Page<Ciudadano> buscarActivosConFiltroYPagina(String search, Integer rubroId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String cleanSearch = (search == null || search.trim().isEmpty()) ? null : search.trim();
        return ciudadanoRepository.buscarCiudadanosConFiltroYPagina(cleanSearch, rubroId, pageable);
    }

    public Optional<Ciudadano> obtenerPorId(Integer id) {
        return ciudadanoRepository.findById(id).filter(Ciudadano::getActivo);
    }

    @Transactional
    public void bajaLogica(Integer id) throws Exception {
        Ciudadano ciudadano = ciudadanoRepository.findById(id)
                .orElseThrow(() -> new Exception("Ciudadano no encontrado con id: " + id));
        ciudadano.setActivo(false);
        ciudadano.setDeletedAt(LocalDateTime.now());
        ciudadanoRepository.save(ciudadano);
    }
}