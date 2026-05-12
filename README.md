# BolsaTrabajo_BE - Oficina de Empleo San José 🏢

[cite_start]Este proyecto constituye el **Trabajo Final** para la **Tecnicatura Universitaria en Programación (TUP)** de la **Facultad Regional Concepción del Uruguay - Universidad Tecnológica Nacional (FRCU UTN)**[cite: 3]. 

[cite_start]Se trata del backend de un sistema integral diseñado para la gestión de la Oficina de Empleo de la ciudad de San José, permitiendo administrar postulantes, empresas, vacantes y el seguimiento de capacitaciones profesionales[cite: 1, 3].

## 👥 Integrantes - Grupo
* [cite_start]**Alvarez, Fabricio** [cite: 3]
* [cite_start]**Quiroga, Agustin** [cite: 3]
* [cite_start]**Ramirez, Emanuel** [cite: 3]

## 🚀 Características Principales
* [cite_start]**Gestión de Ciudadanos:** Registro de postulantes con historial educativo, experiencia laboral y datos de discapacidad (CUD)[cite: 1].
* [cite_start]**Portal de Empresas:** Administración de razones sociales y publicación de vacantes por rubro[cite: 1].
* [cite_start]**Matching y Derivaciones:** Vinculación entre ciudadanos y vacantes con seguimiento del estado de contratación[cite: 1].
* [cite_start]**Capacitaciones:** Control de cursos, instituciones y asistencia de los ciudadanos[cite: 1].
* [cite_start]**Seguridad:** Autenticación basada en roles (SuperAdmin, Entrevistador, Administrativo) mediante JWT[cite: 1, 2].
* [cite_start]**Auditoría:** Registro de eventos (logs) para trazabilidad de acciones en el sistema[cite: 1].

## 🛠️ Tecnologías Utilizadas
[cite_start]El proyecto utiliza un stack tecnológico moderno basado en Java[cite: 2]:
* [cite_start]**Java 21** [cite: 2]
* [cite_start]**Spring Boot 3.4.5** [cite: 2]
* [cite_start]**Spring Data JPA / Hibernate** [cite: 2]
* [cite_start]**Spring Security & JWT (jjwt 0.11.5)** [cite: 2]
* [cite_start]**MySQL** (Motor de base de datos) [cite: 2]
* [cite_start]**Maven** (Gestión de dependencias) [cite: 2]

## ⚙️ Configuración del Proyecto

1.  [cite_start]**Base de Datos:** * Ejecutar el script `BD_oficinadeempleo.sql` para crear la base de datos `oficina_empleo_sanjose` y sus tablas correspondientes[cite: 1].
2.  **Propiedades de Aplicación:**
    * [cite_start]Configurar las credenciales de MySQL en el archivo `src/main/resources/application.properties`[cite: 2].
3.  **Ejecución:**
    * Utilizar el Maven Wrapper incluido para iniciar la aplicación:
        * [cite_start]Windows: `mvnw.cmd spring-boot:run` [cite: 2]
        * [cite_start]Linux/Mac: `./mvnw spring-boot:run` [cite: 2]

## 🗄️ Estructura de Datos
El diseño relacional incluye módulos de:
* [cite_start]**Tablas Maestras:** Barrios, rubros y cursos[cite: 1].
* [cite_start]**Gestión Laboral:** Empresas, vacantes y derivaciones[cite: 1].
* [cite_start]**Seguimiento:** Entrevistas y capacitaciones[cite: 1].
* [cite_start]**Control:** Auditoría y logs de sistema[cite: 1].

[cite_start]*(Nota: El sistema implementa Soft Delete en entidades críticas como ciudadanos y empresas para preservar la integridad histórica de los datos)[cite: 1].*
