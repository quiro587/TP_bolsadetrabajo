package com.tuempresa.proyecto.repository;

import com.tuempresa.proyecto.entity.Ciudadano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CiudadanoRepository extends JpaRepository<Ciudadano, Integer> {
    Optional<Ciudadano> findByDni(String dni);
    Optional<Ciudadano> findByCuil(String cuil);

    List<Ciudadano> findByActivoTrue();

    @Query("SELECT c FROM Ciudadano c WHERE c.activo = true AND " +
           "(LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.apellido) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " c.dni LIKE CONCAT('%', :search, '%'))")
    List<Ciudadano> buscarCiudadanosActivos(@Param("search") String search);
}