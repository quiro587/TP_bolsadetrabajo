package com.tuempresa.proyecto.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "personal")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "rol")
    private String role;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "ultimo_acceso")
    private String ultimoAcceso;

    public Long getId() { return id; } 
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; } 
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; } 
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; } 
    public void setRole(String role) { this.role = role; }

    public String getNombreCompleto() { return nombreCompleto; } 
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public Boolean getActivo() { return activo; } 
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getUltimoAcceso() { return ultimoAcceso; } 
    public void setUltimoAcceso(String ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }
}