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
        // Validar unicidad de DNI y CUIL
        if (ciudadano.getId() == null) {
            if (ciudadanoRepository.findByDni(ciudadano.getDni()).isPresent()) {
                throw new Exception("Ya existe un ciudadano registrado con ese DNI.");
            }
            if (ciudadanoRepository.findByCuil(ciudadano.getCuil()).isPresent()) {
                throw new Exception("Ya existe un ciudadano registrado con ese CUIL.");
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

        boolean isNew = ciudadano.getId() == null;
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