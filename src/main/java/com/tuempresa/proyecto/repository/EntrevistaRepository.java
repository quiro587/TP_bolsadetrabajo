package com.tuempresa.proyecto.repository;

import com.tuempresa.proyecto.entity.Entrevista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntrevistaRepository extends JpaRepository<Entrevista, Integer> {
}
