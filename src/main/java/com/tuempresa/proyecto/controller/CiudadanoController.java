package com.tuempresa.proyecto.controller;

import com.tuempresa.proyecto.entity.Ciudadano;
import com.tuempresa.proyecto.service.CiudadanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ciudadanos")
@CrossOrigin(origins = "*")
public class CiudadanoController {

    @Autowired
    private CiudadanoService ciudadanoService;

    @GetMapping
    public ResponseEntity<List<Ciudadano>> listarActivos(@RequestParam(value = "buscar", required = false) String buscar) {
        List<Ciudadano> ciudadanos = ciudadanoService.buscarActivos(buscar);
        return ResponseEntity.ok(ciudadanos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        return ciudadanoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Ciudadano ciudadano) {
        try {
            Ciudadano guardado = ciudadanoService.guardarCiudadano(ciudadano);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            ciudadanoService.bajaLogica(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}