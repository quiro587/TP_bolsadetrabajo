package com.tuempresa.proyecto.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StatsService {

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Total
        Long total = (Long) entityManager.createQuery("SELECT COUNT(c) FROM Ciudadano c WHERE c.activo = true").getSingleResult();
        stats.put("total", total);

        // 2. Última semana
        java.time.LocalDateTime unaSemanaAtras = java.time.LocalDateTime.now().minusDays(7);
        Long lastWeek = (Long) entityManager.createQuery("SELECT COUNT(c) FROM Ciudadano c WHERE c.activo = true AND c.fechaRegistro >= :fecha")
                .setParameter("fecha", unaSemanaAtras)
                .getSingleResult();
        stats.put("lastWeek", lastWeek);

        // 3. Último mes
        java.time.LocalDateTime unMesAtras = java.time.LocalDateTime.now().minusDays(30);
        Long lastMonth = (Long) entityManager.createQuery("SELECT COUNT(c) FROM Ciudadano c WHERE c.activo = true AND c.fechaRegistro >= :fecha")
                .setParameter("fecha", unMesAtras)
                .getSingleResult();
        stats.put("lastMonth", lastMonth);

        // 4. Por Entrevistador (Trazabilidad a través de la tabla entrevistas)
        List<Object[]> queryInterviewer = entityManager.createNativeQuery(
                "SELECT p.nombre_completo, COUNT(e.id_ciudadano) as cant " +
                "FROM personal p " +
                "JOIN entrevistas e ON p.id = e.id_personal " +
                "JOIN ciudadanos c ON e.id_ciudadano = c.id " +
                "WHERE c.activo = true AND e.activo = true " +
                "GROUP BY p.id, p.nombre_completo " +
                "ORDER BY cant DESC"
        ).getResultList();
        
        List<Map<String, Object>> byInterviewer = new ArrayList<>();
        for (Object[] row : queryInterviewer) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] != null ? row[0].toString() : "Desconocido");
            map.put("count", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            byInterviewer.add(map);
        }
        stats.put("byInterviewer", byInterviewer);

        // 5. Por Estado Laboral
        List<Object[]> queryEstado = entityManager.createQuery(
                "SELECT c.estadoLaboral, COUNT(c) FROM Ciudadano c WHERE c.activo = true GROUP BY c.estadoLaboral"
        ).getResultList();
        Map<String, Long> byEstadoLaboral = new HashMap<>();
        for (Object[] row : queryEstado) {
            String key = row[0] != null ? row[0].toString() : "SIN_ESPECIFICAR";
            byEstadoLaboral.put(key, (Long) row[1]);
        }
        stats.put("byEstadoLaboral", byEstadoLaboral);

        // 6. Por Género
        List<Object[]> queryGenero = entityManager.createQuery(
                "SELECT c.genero, COUNT(c) FROM Ciudadano c WHERE c.activo = true GROUP BY c.genero"
        ).getResultList();
        Map<String, Long> byGenero = new HashMap<>();
        for (Object[] row : queryGenero) {
            String key = row[0] != null ? row[0].toString() : "SIN_ESPECIFICAR";
            byGenero.put(key, (Long) row[1]);
        }
        stats.put("byGenero", byGenero);

        // 7. Top 5 Barrios
        List<Object[]> queryBarrios = entityManager.createNativeQuery(
                "SELECT b.nombre, COUNT(c.id) as cant " +
                "FROM ciudadanos c " +
                "JOIN barrios b ON c.id_barrio = b.id " +
                "WHERE c.activo = true " +
                "GROUP BY b.id, b.nombre " +
                "ORDER BY cant DESC " +
                "LIMIT 5"
        ).getResultList();
        List<Map<String, Object>> byBarrio = new ArrayList<>();
        for (Object[] row : queryBarrios) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] != null ? row[0].toString() : "Desconocido");
            map.put("count", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            byBarrio.add(map);
        }
        stats.put("byBarrio", byBarrio);

        // 8. Por Nivel Educativo
        List<Object[]> queryEdu = entityManager.createNativeQuery(
                "SELECT ed.nivel_alcanzado, COUNT(DISTINCT ed.id_ciudadano) as cant " +
                "FROM educacion ed " +
                "JOIN ciudadanos c ON ed.id_ciudadano = c.id " +
                "WHERE c.activo = true AND ed.activo = true " +
                "GROUP BY ed.nivel_alcanzado " +
                "ORDER BY cant DESC"
        ).getResultList();
        List<Map<String, Object>> byNivelEducativo = new ArrayList<>();
        for (Object[] row : queryEdu) {
            Map<String, Object> map = new HashMap<>();
            map.put("level", row[0] != null ? row[0].toString() : "Sin Nivel");
            map.put("count", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            byNivelEducativo.add(map);
        }
        stats.put("byNivelEducativo", byNivelEducativo);

        return stats;
    }
}
