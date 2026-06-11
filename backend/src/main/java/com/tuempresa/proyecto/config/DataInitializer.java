package com.tuempresa.proyecto.config;

import com.tuempresa.proyecto.entity.User;
import com.tuempresa.proyecto.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("superadmin").isEmpty()) {
            User superAdmin = new User();
            superAdmin.setUsername("superadmin");
            superAdmin.setPassword(passwordEncoder.encode("admin"));
            superAdmin.setRole("ROLE_SuperAdmin");
            superAdmin.setNombreCompleto("Super Administrador");
            superAdmin.setActivo(true);
            userRepository.save(superAdmin);
            System.out.println(">>>>> [DataInitializer] Usuario superadmin creado con éxito.");
        }
    }
}
