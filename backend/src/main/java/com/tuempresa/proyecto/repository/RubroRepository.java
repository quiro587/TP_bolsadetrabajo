package com.tuempresa.proyecto.repository;

import com.tuempresa.proyecto.entity.Rubro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RubroRepository extends JpaRepository<Rubro, Integer> {
    List<Rubro> findByActivoTrue();
}
