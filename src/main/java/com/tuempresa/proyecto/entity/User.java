// User.java

package com.tuempresa.proyecto.entity;

import javax.persistence.*;

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

    // Getters and Setters

}