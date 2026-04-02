CREATE DATABASE IF NOT EXISTS sistema_entrevistas;
USE sistema_entrevistas;
-- 1. Desactivamos revisión de llaves para evitar errores de orden
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Creamos las tablas independientes primero
CREATE TABLE IF NOT EXISTS users (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS administrators (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS administradores (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  rol ENUM ('SuperAdmin', 'Entrevistador') NOT NULL
);

CREATE TABLE IF NOT EXISTS barrios (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS rubros (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL
);

-- 3. Tablas que dependen de las anteriores
CREATE TABLE IF NOT EXISTS entrevistados (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  dni_cuil VARCHAR(50) NOT NULL UNIQUE,
  genero ENUM ('F', 'M', 'LGBTQ+', 'Prefiere no decirlo') NOT NULL,
  fecha_nacimiento DATE NULL,
  hijos INTEGER NULL,
  direccion VARCHAR(255) NULL,
  id_barrio INTEGER NULL,
  telefono VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  FOREIGN KEY (id_barrio) REFERENCES barrios (id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  administrator_id INTEGER NOT NULL,
  interview_datetime DATETIME NOT NULL,
  location VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (administrator_id) REFERENCES administrators (id)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  highest_education_level ENUM ('no_formal', 'primary', 'secondary', 'tertiary', 'postgraduate') NOT NULL,
  occupation VARCHAR(255) NULL,
  skills TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS entrevistas_registro (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_admin INTEGER NOT NULL,
  id_entrevistado INTEGER NOT NULL,
  fecha_entrevista DATETIME NOT NULL,
  solucion_brindada VARCHAR(255) NULL,
  prioridad INTEGER NULL,
  observaciones TEXT NULL,
  FOREIGN KEY (id_entrevistado) REFERENCES entrevistados (id),
  FOREIGN KEY (id_admin) REFERENCES administradores (id)
);

CREATE TABLE IF NOT EXISTS habilitaciones_social (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_entrevistado INTEGER NOT NULL,
  monotributo BOOLEAN NULL,
  responsable_inscripto BOOLEAN NULL,
  obra_social BOOLEAN NULL,
  plan_social BOOLEAN NULL,
  movilidad_propia BOOLEAN NULL,
  FOREIGN KEY (id_entrevistado) REFERENCES entrevistados (id)
);

CREATE TABLE IF NOT EXISTS educacion_laboral (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_entrevistado INTEGER NOT NULL,
  perfil_tipo ENUM ('Trabajador', 'Profesional', 'Empleador') NOT NULL,
  nivel_educativo ENUM ('Primario', 'Secundario', 'Terciario', 'Univ.') NOT NULL,
  ultimo_aprobado BOOLEAN NULL,
  cursos_recientes TEXT NULL,
  experiencia_laboral TEXT NULL,
  id_rubro_principal INTEGER NULL,
  INDEX (id_rubro_principal), -- Importante para la relación posterior
  FOREIGN KEY (id_entrevistado) REFERENCES entrevistados (id)
);

CREATE TABLE IF NOT EXISTS rubro_educacion_laboral (
  rubro_id INTEGER NOT NULL,
  educacion_laboral_id_rubro_principal INTEGER NOT NULL,
  PRIMARY KEY (rubro_id, educacion_laboral_id_rubro_principal),
  FOREIGN KEY (rubro_id) REFERENCES rubros (id) ON DELETE CASCADE,
  FOREIGN KEY (educacion_laboral_id_rubro_principal) REFERENCES educacion_laboral (id_rubro_principal) ON DELETE CASCADE
);

-- 4. Reactivamos la revisión
SET FOREIGN_KEY_CHECKS = 1;