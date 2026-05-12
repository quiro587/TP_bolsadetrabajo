package com.tuempresa.proyecto.service;

import com.tuempresa.proyecto.entity.Ciudadano;
import com.tuempresa.proyecto.repository.CiudadanoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CiudadanoService {

    @Autowired
    private CiudadanoRepository ciudadanoRepository;

    public Ciudadano guardarCiudadano(Ciudadano ciudadano) throws Exception {
        if (ciudadanoRepository.findByDni(ciudadano.getDni()).isPresent()) {
            throw new Exception("Ya existe un ciudadano registrado con ese DNI.");
        }
        if (ciudadanoRepository.findByCuil(ciudadano.getCuil()).isPresent()) {
            throw new Exception("Ya existe un ciudadano registrado con ese CUIL.");
        }
        return ciudadanoRepository.save(ciudadano);
    }
}