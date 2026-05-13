# BolsaTrabajo_BE - Oficina de Empleo San José 🏢

Este proyecto constituye el **Trabajo Final** para la **Tecnicatura Universitaria en Programación (TUP)** de la **Facultad Regional Concepción del Uruguay - Universidad Tecnológica Nacional (FRCU UTN)**. 

Se trata de un sistema integral diseñado para la gestión de la Oficina de Empleo d<dela Municioalidad de la ciudad de San José, permitiendo administrar postulantes, empresas, vacantes y el seguimiento de capacitaciones profesionales.

## 👥 Integrantes - Grupo
* **Alvarez, Fabricio**
* **Quiroga, Agustin**
* **Ramirez, Emanuel**

## 🚀 Características Principales
* **Gestión de Ciudadanos:** Registro de postulantes con historial educativo, experiencia laboral y datos de discapacidad (CUD).
* **Portal de Empresas:** Administración de razones sociales y publicación de vacantes por rubro.
* **Matching y Derivaciones:** Vinculación entre ciudadanos y vacantes con seguimiento del estado de contratación.
* **Capacitaciones:** Control de cursos, instituciones y asistencia de los ciudadanos.
* **Seguridad:** Autenticación basada en roles (SuperAdmin, Entrevistador, Administrativo) mediante JWT.
* **Auditoría:** Registro de eventos (logs) para trazabilidad de acciones en el sistema.

## 🛠️ Tecnologías Utilizadas
El proyecto utiliza un stack tecnológico moderno basado en Java:
* **Java 21**
* **Spring Boot 3.4.5**
* **Spring Data JPA / Hibernate**
* **Spring Security & JWT (jjwt 0.11.5)**
* **MySQL** (Motor de base de datos)
* **Maven** (Gestión de dependencias)

## ⚙️ Configuración del Proyecto

1. **Base de Datos:** * Ejecutar el script `BD_oficinadeempleo.sql` para crear la base de datos `oficina_empleo_sanjose` y sus tablas correspondientes.
2. **Propiedades de Aplicación:**
   * Configurar las credenciales de MySQL en el archivo `src/main/resources/application.properties`.
3. **Ejecución:**
   * Utilizar el Maven Wrapper incluido para iniciar la aplicación:
     * Windows: `mvnw.cmd spring-boot:run`
     * Linux/Mac: `./mvnw spring-boot:run`

## 🗄️ Estructura de Datos
El diseño relacional incluye módulos de:
* **Tablas Maestras:** Barrios, rubros y cursos.
* **Gestión Laboral:** Empresas, vacantes y derivaciones.
* **Seguimiento:** Entrevistas y capacitaciones.
* **Control:** Auditoría y logs de sistema.

*(Nota: El sistema implementa Soft Delete en entidades críticas como ciudadanos y empresas para preservar la integridad histórica de los datos).*
