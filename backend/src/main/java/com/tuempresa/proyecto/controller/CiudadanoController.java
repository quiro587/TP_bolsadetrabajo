package com.tuempresa.proyecto.controller;

import com.tuempresa.proyecto.entity.Ciudadano;
import com.tuempresa.proyecto.service.CiudadanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<?> listarActivos(
            @RequestParam(value = "buscar", required = false) String buscar,
            @RequestParam(value = "rubroId", required = false) Integer rubroId,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        if (page == null && size == null) {
            List<Ciudadano> ciudadanos = ciudadanoService.buscarActivosConFiltro(buscar, rubroId);
            return ResponseEntity.ok(ciudadanos);
        } else {
            int p = page != null ? page : 0;
            int s = size != null ? size : 20;
            Page<Ciudadano> ciudadanos = ciudadanoService.buscarActivosConFiltroYPagina(buscar, rubroId, p, s);
            return ResponseEntity.ok(ciudadanos);
        }
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

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estadoLaboral");
            if (nuevoEstado == null) {
                return ResponseEntity.badRequest().body("El estado laboral es requerido.");
            }
            java.util.Optional<Ciudadano> opt = ciudadanoService.obtenerPorId(id);
            if (opt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Ciudadano c = opt.get();
            c.setEstadoLaboral(nuevoEstado.toUpperCase());
            Ciudadano guardado = ciudadanoService.guardarCiudadano(c);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}