package com.tuempresa.proyecto.controller;

import com.tuempresa.proyecto.entity.Barrio;
import com.tuempresa.proyecto.repository.BarrioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barrios")
@CrossOrigin(origins = "*")
public class BarrioController {

    @Autowired
    private BarrioRepository barrioRepository;

    @GetMapping
    public ResponseEntity<List<Barrio>> listarActivos() {
        List<Barrio> barrios = barrioRepository.findByActivoTrueOrderByNombreAsc();
        return ResponseEntity.ok(barrios);
    }
}
