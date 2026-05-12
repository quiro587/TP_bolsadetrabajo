package com.tuempresa.proyecto.controller;

import com.tuempresa.proyecto.entity.Ciudadano;
import com.tuempresa.proyecto.service.CiudadanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ciudadanos")
public class CiudadanoController {

    @Autowired
    private CiudadanoService ciudadanoService;

    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Ciudadano ciudadano) {
        try {
            Ciudadano nuevo = ciudadanoService.guardarCiudadano(ciudadano);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}