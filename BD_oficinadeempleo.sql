CREATE DATABASE IF NOT EXISTS oficina_empleo_sanjose;
USE oficina_empleo_sanjose;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABLAS MAESTRAS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS barrios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rubros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cursos_ofrecidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_curso VARCHAR(255) NOT NULL,
    institucion VARCHAR(255) DEFAULT 'Oficina de Empleo San José',
    estado VARCHAR(50) DEFAULT 'ACTIVO', 
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 2. USUARIOS DEL SISTEMA (Staff)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol ENUM('SuperAdmin', 'Entrevistador', 'Administrativo') NOT NULL,
    ultimo_acceso DATETIME,
    activo BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME DEFAULT NULL 
) ENGINE=InnoDB;

-- 3. CIUDADANOS (Postulantes)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS ciudadanos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    cuil VARCHAR(15) NOT NULL UNIQUE,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('Masculino', 'Femenino', 'No Binario', 'Otro', 'Prefiero no decirlo'), 
    id_barrio INT,
    direccion VARCHAR(255),
    puntos_referencia_domicilio TEXT, -- Recomendación: Útil para zonas rurales o barrios nuevos
    telefono_primario VARCHAR(50) NOT NULL,
    telefono_secundario VARCHAR(50),
    email VARCHAR(150),
    estado_civil VARCHAR(50),
    hijos_a_cargo INT DEFAULT 0,
    cud_discapacidad BOOLEAN DEFAULT FALSE,
    tipo_discapacidad VARCHAR(100),
    cud_vencimiento DATE DEFAULT NULL, -- Recomendación: Para seguimiento de trámites
    movilidad_propia BOOLEAN DEFAULT FALSE,
    licencia_conducir VARCHAR(50) DEFAULT 'NO_POSEE',
    cv_url VARCHAR(255),
    observaciones_generales TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_laboral ENUM('DESEMPLEADO', 'EMPLEADO', 'EN_BUSQUEDA_ACTIVA', 'PROGRAMA_SOCIAL') DEFAULT 'DESEMPLEADO',
    activo BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME DEFAULT NULL, -- Recomendación: Soft delete también en ciudadanos
    FOREIGN KEY (id_barrio) REFERENCES barrios(id),
    INDEX idx_busqueda (apellido, dni)
) ENGINE=InnoDB;

-- 4. FORMACIÓN Y EXPERIENCIA
---------------------------------------------------
CREATE TABLE IF NOT EXISTS educacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ciudadano INT NOT NULL,
    nivel_alcanzado VARCHAR(100) NOT NULL, 
    titulo_obtenido VARCHAR(255),
    institucion VARCHAR(255),
    finalizado BOOLEAN DEFAULT TRUE,
    anio_ultimo_aprobado INT, -- Recomendación: Para universitarios/secundarios incompletos
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS experiencia_laboral (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ciudadano INT NOT NULL,
    empresa VARCHAR(150) NOT NULL,
    puesto VARCHAR(150) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    actualmente_trabajando BOOLEAN DEFAULT FALSE, -- Recomendación: Diferenciar empleos activos
    tareas_realizadas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. RELACIONES Y CAPACITACIONES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS ciudadano_rubros (
    id_ciudadano INT,
    id_rubro INT,
    PRIMARY KEY (id_ciudadano, id_rubro),
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_rubro) REFERENCES rubros(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS capacitaciones_ciudadano (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ciudadano INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_inscripcion DATE DEFAULT NULL,
    fecha_finalizacion DATE,
    estado_asistencia ENUM('INSCRIPTO', 'CURSANDO', 'FINALIZADO', 'DESERTO') DEFAULT 'INSCRIPTO', 
    observaciones_rendimiento VARCHAR(255), 
    certificado_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME DEFAULT NULL,

    CONSTRAINT fk_ciudadano_cap FOREIGN KEY (id_ciudadano) 
        REFERENCES ciudadanos(id) ON DELETE CASCADE,
    CONSTRAINT fk_curso_cap FOREIGN KEY (id_curso) 
        REFERENCES cursos_ofrecidos(id) ON DELETE CASCADE,
    UNIQUE KEY uq_ciudadano_curso (id_ciudadano, id_curso)
) ENGINE=InnoDB;

-- 6. GESTIÓN DE EMPRESAS Y VACANTES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(200) NOT NULL,
    cuit VARCHAR(20) UNIQUE,
    contacto_nombre VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(150),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vacantes_laborales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    puesto_nombre VARCHAR(150) NOT NULL,
    id_rubro INT,
    descripcion_puesto TEXT,
    requisitos_educativos VARCHAR(100),
    rango_etario_min INT,
    rango_etario_max INT,
    estado ENUM('ABIERTA', 'CERRADA', 'PAUSADA', 'CUBIERTA') DEFAULT 'ABIERTA',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id),
    FOREIGN KEY (id_rubro) REFERENCES rubros(id)
) ENGINE=InnoDB;

-- 7. ENTREVISTAS Y VINCULACIONES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS entrevistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ciudadano INT NOT NULL,
    id_personal INT NOT NULL,
    fecha_entrevista DATETIME NOT NULL,
    objetivo_consulta VARCHAR(255),
    observaciones_tecnicas TEXT,
    prioridad_insercion VARCHAR(50) DEFAULT 'MEDIA',
    estado_tramite VARCHAR(50) DEFAULT 'PENDIENTE',
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id),
    FOREIGN KEY (id_personal) REFERENCES personal(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS derivaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ciudadano INT NOT NULL,
    id_vacante INT NOT NULL,
    id_personal_deriva INT, -- Recomendación: Trazabilidad de quién hizo la derivación
    fecha_derivacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    resultado ENUM('EN_PROCESO', 'CONTRATADO', 'RECHAZADO', 'NO_ASISTIO') DEFAULT 'EN_PROCESO',
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_ciudadano) REFERENCES ciudadanos(id),
    FOREIGN KEY (id_vacante) REFERENCES vacantes_laborales(id),
    FOREIGN KEY (id_personal_deriva) REFERENCES personal(id)
) ENGINE=InnoDB;

-- 8. AUDITORÍA
---------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_personal INT,
    tipo_evento ENUM('LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT') NOT NULL, -- Recomendación: Tipado para filtros rápidos
    accion VARCHAR(255),
    tabla_afectada VARCHAR(50),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45),
    FOREIGN KEY (id_personal) REFERENCES personal(id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- 9. DATOS INICIALES MÍNIMOS
---------------------------------------------------
INSERT INTO barrios (nombre) VALUES 
('Centro'), ('El Brillante'), ('El Colorado'), ('Santa Teresita'), 
('Perucho'), ('Pueblo Liebig'), ('San José');

-- Mantengo tu lista completa de rubros intacta
INSERT INTO rubros (nombre) VALUES 
('Industria Avícola: Operario de Planta'), ('Industria Avícola: Despostado / Trozado'), ('Industria Avícola: Carga y Descarga'),
('Industria Cárnica: Frigorífico Vacuno'), ('Industria Cárnica: Chacinados y Embutidos'), ('Agro: Cosecha de Arándanos'),
('Agro: Producción de Nuez Pecán'), ('Agro: Citricultura'), ('Agro: Ganadería y Tambo'),
('Agro: Manejo de Tractores y Maquinaria Agrícola'), ('Agro: Aplicador de Fitosanitarios (Carnet habilitante)'), ('Agro: Apicultura'),
('Construcción: Albañilería y Obra Gruesa'), ('Construcción: Terminaciones / Pintura'), ('Construcción: Durlock / Yesería'),
('Construcción: Techista'), ('Electricidad: Matriculado Domiciliario'), ('Electricidad: Industrial / Alta Tensión'),
('Plomería y Redes de Gas'), ('Carpintería de Madera'), ('Carpintería de Aluminio / PVC'),
('Soldadura: Eléctrica / MIG-MAG'), ('Herrería de Obra y Artística'), ('Refrigeración y Aire Acondicionado'),
('Mecánica Automotriz (Livianos)'), ('Mecánica de Camiones y Maquinaria Pesada'), ('Gomería y Alineación'),
('Mantenimiento Electromecánico Industrial'), ('Tornería y Fresado'), ('Operario de Depósito / Picking'),
('Manejo de Autoelevador (Clark)'), ('Ventas: Salón y Atención al Cliente'), ('Ventas: Preventista / Viajante'),
('Cajero/a de Comercio / Entidad Bancaria'), ('Administración General y Archivo'), ('Contabilidad y Auditoría'),
('Recursos Humanos y Liquidación de Sueldos'), ('Secretariado y Recepción'), ('Seguros y Gestoría'),
('Gastronomía: Cocinero/a'), ('Gastronomía: Ayudante de Cocina / Bachero'), ('Gastronomía: Pastelería y Repostería'),
('Gastronomía: Panadería'), ('Turismo: Guía / Informante'), ('Turismo: Recepción de Hotel'),
('Turismo: Mucama / Valet'), ('Eventos: Mozo / Camarera'), ('Eventos: Organización y Decoración'),
('Transporte: Chofer de Camión (Larga Distancia)'), ('Transporte: Chofer de Reparto (Local)'),
('Transporte: Remis / Taxi / Comisionista'), ('Transporte: Colectivos / Transporte Escolar'),
('Logística: Gestión de Stock y Compras'), ('Salud: Enfermería Profesional'), ('Salud: Auxiliar de Enfermería'),
('Salud: Limpieza de Centros de Salud'), ('Cuidado de Adultos Mayores'), ('Cuidado de Niños y Niñeras'),
('Acompañante Terapéutico'), ('Estética: Peluquería y Barbería'), ('Estética: Manicura y Cosmetología'),
('Limpieza: Doméstica / Casas Particulares'), ('Limpieza: Industrial / Final de Obra'),
('Seguridad: Vigilador Privado (Sin armas)'), ('Seguridad: Vigilador Privado (Con armas)'),
('Mantenimiento de Espacios Verdes / Parquizado'), ('Lavandería Industrial'), ('Docencia: Primaria / Secundaria'),
('Docencia: Capacitación de Oficios'), ('IT: Soporte Técnico y Redes'), ('IT: Programación / Desarrollo Web'),
('IT: Análisis de Datos'), ('Diseño Gráfico y Publicidad'), ('Marketing Digital y Community Manager'),
('Fotografía y Producción Audiovisual');