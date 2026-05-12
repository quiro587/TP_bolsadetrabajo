package com.tuempresa.proyecto.repository;

import com.tuempresa.proyecto.entity.Ciudadano;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CiudadanoRepository extends JpaRepository<Ciudadano, Integer> {
    Optional<Ciudadano> findByDni(String dni);
    Optional<Ciudadano> findByCuil(String cuil);
}