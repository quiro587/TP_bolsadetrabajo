package com.tuempresa.proyecto.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "personal")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario")
    private String usuario;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "rol")
    private String rol;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "ultimo_acceso")
    private String ultimoAcceso;

    // Getters y Setters normales
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getUltimoAcceso() { return ultimoAcceso; }
    public void setUltimoAcceso(String ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }

    // Métodos alias para compatibilidad con Spring Security y el controller
    public String getUsername() { return usuario; }
    public void setUsername(String username) { this.usuario = username; }

    public String getPassword() { return passwordHash; }
    public void setPassword(String password) { this.passwordHash = password; }

    public String getRole() { return rol; }
    public void setRole(String role) { this.rol = role; }
}