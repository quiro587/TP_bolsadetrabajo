package com.tuempresa.proyecto.controller;

import com.tuempresa.proyecto.entity.User;
import com.tuempresa.proyecto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> listUsers() {
        List<User> users = userRepository.findByDeletedAtIsNull();
        // Ocultar contraseñas hash en la respuesta
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        if (newUser.getUsername() == null || newUser.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de usuario es obligatorio.");
        }
        if (newUser.getPassword() == null || newUser.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña es obligatoria.");
        }
        if (userRepository.findByUsername(newUser.getUsername().trim()).isPresent()) {
            return ResponseEntity.badRequest().body("El nombre de usuario ya existe.");
        }

        User user = new User();
        user.setUsername(newUser.getUsername().trim());
        user.setPassword(passwordEncoder.encode(newUser.getPassword().trim()));
        // Rol por defecto para altas de administración: "Entrevistador"
        user.setRole(newUser.getRole() != null && !newUser.getRole().trim().isEmpty() ? newUser.getRole().trim() : "Entrevistador");
        user.setNombreCompleto(newUser.getNombreCompleto() != null ? newUser.getNombreCompleto().trim() : "Entrevistador");
        user.setActivo(true);

        User saved = userRepository.save(user);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String newPassword = request.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La nueva contraseña no puede estar vacía.");
        }

        Optional<User> optUser = userRepository.findById(id);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optUser.get();
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        return ResponseEntity.ok().body(Map.of("message", "Contraseña actualizada con éxito."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> request) {
        Boolean active = request.get("activo");
        if (active == null) {
            return ResponseEntity.badRequest().body("El estado activo es obligatorio.");
        }

        Optional<User> optUser = userRepository.findById(id);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optUser.get();
        if (user.getUsername().equals("superadmin")) {
            return ResponseEntity.badRequest().body("No se puede desactivar la cuenta principal del superadmin.");
        }

        user.setActivo(active);
        userRepository.save(user);

        return ResponseEntity.ok().body(Map.of("message", "Estado de cuenta actualizado con éxito."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        Optional<User> optUser = userRepository.findById(id);
        if (optUser.isEmpty() || optUser.get().getDeletedAt() != null) {
            return ResponseEntity.notFound().build();
        }

        User user = optUser.get();
        if (user.getUsername().equals("superadmin")) {
            return ResponseEntity.badRequest().body("No se puede eliminar la cuenta principal del superadmin.");
        }

        user.setDeletedAt(java.time.LocalDateTime.now());
        user.setActivo(false);
        userRepository.save(user);

        return ResponseEntity.ok().body(Map.of("message", "Usuario eliminado con éxito."));
    }
}
