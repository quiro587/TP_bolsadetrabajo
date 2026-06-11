import { useState } from 'react';
import { 
  BookOpen, Users, Settings, ShieldCheck, 
  BarChart3, Database, Search, RefreshCw, ChevronRight
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function UserManual() {
  const [activeSection, setActiveSection] = useState('intro');

  const sections: ManualSection[] = [
    {
      id: 'intro',
      title: 'Introducción',
      icon: <BookOpen size={18} />,
      content: (
        <div>
          <h2 style={styles.sectionTitle}>Introducción al Sistema</h2>
          <p style={styles.paragraph}>
            Bienvenido al <strong>Sistema de Gestión de Bolsa de Trabajo</strong> de la Oficina de Empleo Municipal. 
            Esta plataforma Full-Stack ha sido diseñada para optimizar, centralizar y digitalizar el registro, 
            seguimiento e inserción laboral de los ciudadanos del municipio.
          </p>
          <p style={styles.paragraph}>
            El sistema reemplaza las antiguas planillas de cálculo manuales por una solución web moderna, 
            segura y robusta, capaz de procesar cientos de registros históricos con tiempos de carga instantáneos 
            y herramientas avanzadas de análisis estadístico.
          </p>
          <div style={styles.cardInfo}>
            <h4 style={styles.cardInfoTitle}>🎯 Propósito Principal</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>
              Facilitar el nexo entre la oferta y la demanda laboral del municipio, brindando a los operarios 
              de la oficina una herramienta ágil para perfilar candidatos y a los administradores un panel demográfico 
              en tiempo real para planificar capacitaciones y políticas de empleo.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'roles',
      title: 'Roles y Permisos',
      icon: <ShieldCheck size={18} />,
      content: (
        <div>
          <h2 style={styles.sectionTitle}>Control de Acceso (RBAC)</h2>
          <p style={styles.paragraph}>
            El acceso al sistema está resguardado mediante tokens JWT y se divide en dos perfiles o roles clave:
          </p>

          <div style={styles.grid}>
            <div style={styles.roleCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <Users size={20} />
                </div>
                <h3 style={styles.roleTitle}>Entrevistador</h3>
              </div>
              <ul style={styles.bulletList}>
                <li>Registro completo de postulantes nuevos en la base de datos.</li>
                <li>Búsqueda y filtrado rápido por texto o por rubro comercial.</li>
                <li>Visualización y edición del CV de los candidatos.</li>
                <li>Asociación de entrevistas de seguimiento.</li>
                <li>Gestión de rubros comerciales.</li>
              </ul>
            </div>

            <div style={styles.roleCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#7c3aed' }}>
                  <Settings size={20} />
                </div>
                <h3 style={styles.roleTitle}>Super Administrador</h3>
              </div>
              <p style={{ ...styles.paragraph, fontSize: '13px', fontWeight: 600, color: '#6d28d9', margin: '0 0 8px 0' }}>
                Posee todos los permisos de Entrevistador, sumando:
              </p>
              <ul style={styles.bulletList}>
                <li>Acceso exclusivo al panel de <strong>Informes</strong> estadísticos.</li>
                <li>Permiso de **eliminación física y lógica** de postulantes.</li>
                <li>Gestión completa de usuarios (Alta de entrevistadores, cambio de contraseñas y bajas del sistema).</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'postulantes',
      title: 'Gestión de Postulantes',
      icon: <Search size={18} />,
      content: (
        <div>
          <h2 style={styles.sectionTitle}>Búsqueda y Registro</h2>
          
          <h3 style={styles.subSectionTitle}>1. Búsqueda y Paginación Eficiente</h3>
          <p style={styles.paragraph}>
            En la pantalla principal, el sistema utiliza **paginación en servidor (20 elementos por página)**. 
            Esto permite realizar búsquedas instantáneas en la base de datos de más de 680 postulantes históricos.
            Puedes escribir el **nombre, apellido o DNI** en la barra de búsqueda superior y seleccionar 
            un rubro específico para refinar los resultados.
          </p>

          <h3 style={styles.subSectionTitle}>2. Registro de un Candidato</h3>
          <p style={styles.paragraph}>
            Al hacer clic en **"Nuevo Postulante"**, se abrirá un formulario dinámico dividido en secciones:
          </p>
          <div style={styles.listSteps}>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>1</span>
              <div>
                <strong>Datos Personales y de Contacto:</strong> Nombre, apellido, DNI, CUIL, teléfonos y dirección. 
                Los campos marcados con (*) son obligatorios.
              </div>
            </div>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>2</span>
              <div>
                <strong>Situación Social y de Salud:</strong> Información sobre Discapacidad (CUD), posesión de movilidad, 
                licencia de conducir y planes sociales activos.
              </div>
            </div>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>3</span>
              <div>
                <strong>Historial Académico y Experiencia:</strong> Sección interactiva para añadir múltiples estudios realizados 
                y experiencias laborales previas, permitiendo indicar si el postulante trabaja actualmente allí.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reactivacion',
      title: 'Reactivación Automática',
      icon: <RefreshCw size={18} />,
      content: (
        <div>
          <h2 style={styles.sectionTitle}>Mecanismo de Reactivación Inteligente</h2>
          <p style={styles.paragraph}>
            Para resguardar el historial (auditorías, visitas anteriores del ciudadano y derivaciones), el sistema no realiza 
            borrados físicos de postulantes por defecto, sino que aplica una **baja lógica** (`activo = false`).
          </p>
          <p style={styles.paragraph}>
            Si intentas registrar un postulante que ya existía pero que fue eliminado previamente, el sistema ejecutará 
            la **Reactivación Automática**:
          </p>

          <div style={styles.flowCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <RefreshCw size={24} style={{ color: '#059669', animation: 'spin 4s linear infinite' }} />
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#065f46' }}>¿Cómo opera el algoritmo?</h4>
            </div>
            <ol style={{ ...styles.bulletList, paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>El backend detecta si el DNI o CUIL ingresado pertenece a un ciudadano inactivo.</li>
              <li style={{ marginBottom: '8px' }}>En vez de arrojar error por duplicado, restaura el registro cambiando su estado a activo (`deletedAt = null`, `activo = true`).</li>
              <li style={{ marginBottom: '8px' }}>Sobrescribe la información personal vieja con los nuevos datos completados en el formulario.</li>
              <li style={{ marginBottom: '8px' }}>Limpia e inyecta la nueva lista de estudios y experiencias laborales.</li>
              <li style={{ marginBottom: '0' }}>Registra de forma automática una nueva **Entrevista de Registro Inicial** en la base de datos para auditar quién realizó la reactivación.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'informes',
      title: 'Módulo de Informes',
      icon: <BarChart3 size={18} />,
      content: (
        <div>
          <h2 style={styles.sectionTitle}>Análisis Demográfico e Indicadores</h2>
          <p style={styles.paragraph}>
            El módulo de <strong>Informes</strong> (exclusivo para `SuperAdmin`) consolida la información 
            geográfica, social y laboral del municipio. Las métricas principales incluyen:
          </p>

          <div style={styles.grid}>
            <div style={styles.metricItem}>
              <h4 style={styles.metricTitle}>📊 Estado Laboral</h4>
              <p style={styles.metricDesc}>Muestra el porcentaje en tiempo real de ciudadanos activos que se encuentran desempleados, empleados o en programas sociales.</p>
            </div>
            <div style={styles.metricItem}>
              <h4 style={styles.metricTitle}>📍 Top de Barrios</h4>
              <p style={styles.metricDesc}>Identifica las zonas geográficas con mayor concentración de postulantes registrados, ideal para planificar ferias de empleo.</p>
            </div>
            <div style={styles.metricItem}>
              <h4 style={styles.metricTitle}>🎓 Nivel Educativo y Género</h4>
              <p style={styles.metricDesc}>Agrupa a los postulantes según su nivel académico finalizado y presenta desgloses de género de los perfiles.</p>
            </div>
            <div style={styles.metricItem}>
              <h4 style={styles.metricTitle}>⚡ Rendimiento del Personal</h4>
              <p style={styles.metricDesc}>Audita y lista de forma descendente el total de postulantes que han registrado y entrevistado cada uno de los operadores del sistema.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'personal',
      title: 'Administración de Personal',
      icon: <Database size={18} />,
      content: (
        <div>
          <h2 style={styles.sectionTitle}>Gestión de Cuentas de Operadores</h2>
          <p style={styles.paragraph}>
            El administrador principal del sistema (`SuperAdmin`) dispone de la pestaña de **Personal** 
            para coordinar el equipo de trabajo de la oficina:
          </p>
          <div style={styles.listSteps}>
            <div style={styles.stepItem}>
              <span style={{ ...styles.stepNumber, backgroundColor: '#7c3aed' }}>1</span>
              <div>
                <strong>Crear Nuevos Usuarios:</strong> Permite registrar operadores ingresando su nombre, nombre de usuario, contraseña inicial y rol asignado.
              </div>
            </div>
            <div style={styles.stepItem}>
              <span style={{ ...styles.stepNumber, backgroundColor: '#7c3aed' }}>2</span>
              <div>
                <strong>Cambiar Contraseñas:</strong> En caso de olvido o renovación de seguridad, el administrador puede modificar la clave de acceso de cualquier entrevistador.
              </div>
            </div>
            <div style={styles.stepItem}>
              <span style={{ ...styles.stepNumber, backgroundColor: '#7c3aed' }}>3</span>
              <div>
                <strong>Bajas del Sistema (Soft-Delete):</strong> Permite inhabilitar la cuenta del personal de forma lógica. El operador eliminado ya no podrá iniciar sesión en el sistema, pero todo su historial de entrevistas guardadas se preservará de manera consistente.
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <BookOpen size={28} style={{ color: '#3b82f6' }} />
        <div>
          <h1 style={styles.title}>Manual de Usuario</h1>
          <p style={styles.subtitle}>Aprende a navegar y utilizar las herramientas del Sistema de Bolsa de Trabajo.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Navigation Sidebar */}
        <div style={styles.sidebar}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                ...styles.navItem,
                backgroundColor: activeSection === section.id ? '#f1f5f9' : 'transparent',
                color: activeSection === section.id ? '#1e293b' : '#64748b',
                fontWeight: activeSection === section.id ? 600 : 500,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {section.icon}
                {section.title}
              </span>
              <ChevronRight size={16} style={{ opacity: activeSection === section.id ? 1 : 0, transition: 'var(--transition)' }} />
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div style={styles.contentArea}>
          {sections.find(s => s.id === activeSection)?.content}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    marginTop: '4px',
    margin: 0,
    fontSize: '14px',
  },
  layout: {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '12px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.006)',
    minHeight: '480px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    marginTop: 0,
    marginBottom: '16px',
  },
  subSectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#334155',
    marginTop: '24px',
    marginBottom: '10px',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#475569',
    marginBottom: '16px',
  },
  cardInfo: {
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  cardInfoTitle: {
    margin: '0 0 6px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e3a8a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '24px',
  },
  roleCard: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
  },
  roleTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  bulletList: {
    margin: '12px 0 0 0',
    paddingLeft: '16px',
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.6',
  },
  listSteps: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginTop: '20px',
  },
  stepItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  flowCard: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #d1fae5',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '20px',
  },
  metricItem: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #f1f5f9',
  },
  metricTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  metricDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  }
};
