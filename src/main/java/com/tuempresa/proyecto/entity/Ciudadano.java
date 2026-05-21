package com.tuempresa.proyecto.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ciudadanos")
public class Ciudadano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 15)
    private String dni;

    @Column(unique = true, nullable = false, length = 15)
    private String cuil;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(length = 50)
    private String genero;

    @Column(length = 255)
    private String direccion;

    @Column(name = "puntos_referencia_domicilio", columnDefinition = "TEXT")
    private String puntosReferenciaDomicilio;

    @Column(name = "telefono_primario", nullable = false, length = 50)
    private String telefonoPrimario;

    @Column(name = "telefono_secundario", length = 50)
    private String telefonoSecundario;

    @Column(length = 150)
    private String email;

    @Column(name = "estado_civil", length = 50)
    private String estadoCivil;

    @Column(name = "hijos_a_cargo")
    private Integer hijosACargo = 0;

    @Column(name = "cud_discapacidad")
    private Boolean cudDiscapacidad = false;

    @Column(name = "tipo_discapacidad", length = 100)
    private String tipoDiscapacidad;

    @Column(name = "cud_vencimiento")
    private LocalDate cudVencimiento;

    @Column(name = "movilidad_propia")
    private Boolean movilidadPropia = false;

    @Column(name = "licencia_conducir", length = 50)
    private String licenciaConducir = "NO_POSEE";

    @Column(name = "cv_url", length = 255)
    private String cvUrl;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(length = 500)
    private String habilidades;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "estado_laboral", length = 50)
    private String estadoLaboral = "DESEMPLEADO";

    private Boolean activo = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "ciudadano", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Educacion> educaciones = new ArrayList<>();

    @OneToMany(mappedBy = "ciudadano", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExperienciaLaboral> experienciasLaborales = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "ciudadano_rubros",
        joinColumns = @JoinColumn(name = "id_ciudadano"),
        inverseJoinColumns = @JoinColumn(name = "id_rubro")
    )
    private List<Rubro> rubros = new ArrayList<>();

    // --- CONSTRUCTORES ---
    public Ciudadano() {}

    // --- MÉTODOS DE AYUDA PARA RELACIONES ---
    public void addEducacion(Educacion edu) {
        educaciones.add(edu);
        edu.setCiudadano(this);
    }

    public void removeEducacion(Educacion edu) {
        educaciones.remove(edu);
        edu.setCiudadano(null);
    }

    public void addExperienciaLaboral(ExperienciaLaboral exp) {
        experienciasLaborales.add(exp);
        exp.setCiudadano(this);
    }

    public void removeExperienciaLaboral(ExperienciaLaboral exp) {
        experienciasLaborales.remove(exp);
        exp.setCiudadano(null);
    }

    // --- GETTERS Y SETTERS ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getCuil() { return cuil; }
    public void setCuil(String cuil) { this.cuil = cuil; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getPuntosReferenciaDomicilio() { return puntosReferenciaDomicilio; }
    public void setPuntosReferenciaDomicilio(String puntosReferenciaDomicilio) { this.puntosReferenciaDomicilio = puntosReferenciaDomicilio; }

    public String getTelefonoPrimario() { return telefonoPrimario; }
    public void setTelefonoPrimario(String telefonoPrimario) { this.telefonoPrimario = telefonoPrimario; }

    public String getTelefonoSecundario() { return telefonoSecundario; }
    public void setTelefonoSecundario(String telefonoSecundario) { this.telefonoSecundario = telefonoSecundario; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEstadoCivil() { return estadoCivil; }
    public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }

    public Integer getHijosACargo() { return hijosACargo; }
    public void setHijosACargo(Integer hijosACargo) { this.hijosACargo = hijosACargo; }

    public Boolean getCudDiscapacidad() { return cudDiscapacidad; }
    public void setCudDiscapacidad(Boolean cudDiscapacidad) { this.cudDiscapacidad = cudDiscapacidad; }

    public String getTipoDiscapacidad() { return tipoDiscapacidad; }
    public void setTipoDiscapacidad(String tipoDiscapacidad) { this.tipoDiscapacidad = tipoDiscapacidad; }

    public LocalDate getCudVencimiento() { return cudVencimiento; }
    public void setCudVencimiento(LocalDate cudVencimiento) { this.cudVencimiento = cudVencimiento; }

    public Boolean getMovilidadPropia() { return movilidadPropia; }
    public void setMovilidadPropia(Boolean movilidadPropia) { this.movilidadPropia = movilidadPropia; }

    public String getLicenciaConducir() { return licenciaConducir; }
    public void setLicenciaConducir(String licenciaConducir) { this.licenciaConducir = licenciaConducir; }

    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }

    public String getObservacionesGenerales() { return observacionesGenerales; }
    public void setObservacionesGenerales(String observacionesGenerales) { this.observacionesGenerales = observacionesGenerales; }

    public String getHabilidades() { return habilidades; }
    public void setHabilidades(String habilidades) { this.habilidades = habilidades; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getEstadoLaboral() { return estadoLaboral; }
    public void setEstadoLaboral(String estadoLaboral) { this.estadoLaboral = estadoLaboral; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public List<Educacion> getEducaciones() { return educaciones; }
    public void setEducaciones(List<Educacion> educaciones) { this.educaciones = educaciones; }

    public List<ExperienciaLaboral> getExperienciasLaborales() { return experienciasLaborales; }
    public void setExperienciasLaborales(List<ExperienciaLaboral> experienciasLaborales) { this.experienciasLaborales = experienciasLaborales; }

    public List<Rubro> getRubros() { return rubros; }
    public void setRubros(List<Rubro> rubros) { this.rubros = rubros; }
}