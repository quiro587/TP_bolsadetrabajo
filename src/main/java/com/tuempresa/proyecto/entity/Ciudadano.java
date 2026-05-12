package com.tuempresa.proyecto.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(name = "telefono_primario", nullable = false, length = 50)
    private String telefonoPrimario;

    @Column(length = 150)
    private String email;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    private Boolean activo = true;

    // --- CONSTRUCTORES ---
    public Ciudadano() {}

    // --- GETTERS Y SETTERS MANUALES ---
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

    public String getTelefonoPrimario() { return telefonoPrimario; }
    public void setTelefonoPrimario(String telefonoPrimario) { this.telefonoPrimario = telefonoPrimario; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}