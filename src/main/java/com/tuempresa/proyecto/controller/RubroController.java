package com.tuempresa.proyecto.controller;

import com.tuempresa.proyecto.entity.Rubro;
import com.tuempresa.proyecto.repository.RubroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rubros")
@CrossOrigin(origins = "*")
public class RubroController {

    @Autowired
    private RubroRepository rubroRepository;

    @GetMapping
    public ResponseEntity<List<Rubro>> listarActivos() {
        List<Rubro> rubros = rubroRepository.findByActivoTrue();
        return ResponseEntity.ok(rubros);
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Rubro rubro) {
        if (rubro.getNombre() == null || rubro.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del rubro no puede estar vacío.");
        }
        rubro.setNombre(rubro.getNombre().trim());
        Rubro guardado = rubroRepository.save(rubro);
        return ResponseEntity.ok(guardado);
    }
}
