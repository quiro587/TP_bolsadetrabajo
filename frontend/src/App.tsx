import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import CandidateForm from './CandidateForm';
import CandidateCV from './CandidateCV';
import { 
  LogOut, Users, FileText, UserPlus, Loader2, AlertCircle, 
  Briefcase, MapPin, GraduationCap, UserCheck, Calendar, Clock, BarChart3,
  Key, Plus, X, Trash2
} from 'lucide-react';

type ViewState = 'dashboard' | 'create-candidate' | 'edit-candidate' | 'view-cv';
type TabState = 'postulantes' | 'informes' | 'personal';

interface DecodedToken {
  sub: string;
  role: string;
  nombreCompleto: string;
  userId: number;
  exp: number;
}

function parseJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  const [view, setView] = useState<ViewState>('dashboard');
  const [activeTab, setActiveTab] = useState<TabState>('postulantes');
  const [activeCandidateId, setActiveCandidateId] = useState<number | null>(null);

  const [stats, setStats] = useState<any | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // States for user management (SuperAdmin only)
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any | null>(null);

  // New user form states
  const [newUsername, setNewUsername] = useState('');
  const [newNombreCompleto, setNewNombreCompleto] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Entrevistador');
  const [creatingUser, setCreatingUser] = useState(false);

  // Change password form states
  const [changePasswordField, setChangePasswordField] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchUsers = () => {
    setLoadingUsers(true);
    setUsersError('');
    fetch('http://localhost:8080/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Error al cargar la lista de personal.');
      }
      return res.json();
    })
    .then((data: any) => {
      setUsers(data);
    })
    .catch(err => {
      setUsersError(err.message || 'Error de conexión.');
    })
    .finally(() => {
      setLoadingUsers(false);
    });
  };

  // Fetch users when entering the Personal tab
  useEffect(() => {
    if (activeTab === 'personal' && token) {
      fetchUsers();
    }
  }, [activeTab, token]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newNombreCompleto.trim()) {
      alert('Por favor completa todos los campos.');
      return;
    }
    setCreatingUser(true);
    fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: newUsername.trim(),
        password: newPassword.trim(),
        nombreCompleto: newNombreCompleto.trim(),
        role: newRole
      })
    })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al crear el usuario.');
      }
      return res.json();
    })
    .then(() => {
      alert('Usuario creado con éxito.');
      setShowCreateUserModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewNombreCompleto('');
      setNewRole('Entrevistador');
      fetchUsers();
    })
    .catch(err => {
      alert(err.message || 'Ocurrió un error.');
    })
    .finally(() => {
      setCreatingUser(false);
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !changePasswordField.trim()) {
      alert('Por favor ingresa la nueva contraseña.');
      return;
    }
    setChangingPassword(true);
    fetch(`http://localhost:8080/api/users/${selectedUserForPassword.id}/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: changePasswordField.trim()
      })
    })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al cambiar la contraseña.');
      }
      return res.json();
    })
    .then(() => {
      alert('Contraseña actualizada con éxito.');
      setShowChangePasswordModal(false);
      setSelectedUserForPassword(null);
      setChangePasswordField('');
    })
    .catch(err => {
      alert(err.message || 'Ocurrió un error.');
    })
    .finally(() => {
      setChangingPassword(false);
    });
  };

  const handleToggleUserStatus = (userId: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    fetch(`http://localhost:8080/api/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activo: nextStatus
      })
    })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al cambiar el estado de la cuenta.');
      }
      return res.json();
    })
    .then(() => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, activo: nextStatus } : u));
    })
    .catch(err => {
      alert(err.message || 'Ocurrió un error.');
    });
  };

  const handleDeleteUser = (userId: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario de personal "${name}"?`)) {
      fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Error al eliminar el usuario.');
        }
        return res.json();
      })
      .then(() => {
        alert('Usuario de personal eliminado con éxito.');
        setUsers(prev => prev.filter(u => u.id !== userId));
      })
      .catch(err => {
        alert(err.message || 'Ocurrió un error.');
      });
    }
  };

  // Decode JWT on load or change
  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        const normalizedRole = decoded.role ? decoded.role.replace('ROLE_', '') : null;
        setUserRole(normalizedRole);
        setUserDisplayName(decoded.nombreCompleto);
      } else {
        handleLogout();
      }
    } else {
      setUserRole(null);
      setUserDisplayName(null);
    }
  }, [token]);

  // Fetch statistics when entering the Reports tab
  useEffect(() => {
    if (activeTab === 'informes' && token) {
      setLoadingStats(true);
      setStatsError('');
      fetch('http://localhost:8080/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al cargar estadísticas avanzadas.');
        }
        return res.json();
      })
      .then((data: any) => {
        setStats(data);
      })
      .catch(err => {
        setStatsError(err.message || 'Error de conexión.');
      })
      .finally(() => {
        setLoadingStats(false);
      });
    }
  }, [activeTab, token]);

  // Sincronizar token en LocalStorage
  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setView('dashboard');
    setActiveTab('postulantes');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserRole(null);
    setUserDisplayName(null);
    setView('dashboard');
    setActiveTab('postulantes');
    setActiveCandidateId(null);
  };

  // Si no está autenticado, forzar pantalla de login
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="app-container">
      {/* Left Sidebar (no-print) */}
      <aside className="sidebar no-print">
        <div className="sidebar-brand">
          <span className="logo-sj">SJ</span>
          <span className="logo-ciudad">Ciudad</span>
        </div>

        <nav className="sidebar-menu">
          <button
            onClick={() => {
              setActiveTab('postulantes');
              setView('dashboard');
            }}
            className={`sidebar-item ${activeTab === 'postulantes' ? 'active' : ''}`}
          >
            <Users size={18} />
            Postulantes
          </button>

          {userRole === 'SuperAdmin' && (
            <>
              <button
                onClick={() => setActiveTab('informes')}
                className={`sidebar-item ${activeTab === 'informes' ? 'active' : ''}`}
              >
                <FileText size={18} />
                Informes
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`sidebar-item ${activeTab === 'personal' ? 'active' : ''}`}
              >
                <UserCheck size={18} />
                Personal
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header (no-print) */}
        <header className="top-header no-print">
          <div className="header-user">
            <span className="user-name">{userDisplayName || 'Usuario'}</span>
            <div className="user-avatar">{getInitials(userDisplayName || 'U')}</div>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic View Dispatcher */}
        <main style={{ flex: 1, padding: activeTab === 'postulantes' ? '0' : '40px', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'postulantes' && (
            <>
              {view === 'dashboard' && (
                <Dashboard
                  token={token}
                  userRole={userRole || undefined}
                  onNewCandidate={() => {
                    setActiveCandidateId(null);
                    setView('create-candidate');
                  }}
                  onEditCandidate={(id) => {
                    setActiveCandidateId(id);
                    setView('edit-candidate');
                  }}
                  onViewCV={(id) => {
                    setActiveCandidateId(id);
                    setView('view-cv');
                  }}
                />
              )}

              {(view === 'create-candidate' || view === 'edit-candidate') && (
                <CandidateForm
                  token={token}
                  candidateId={activeCandidateId}
                  onBack={() => setView('dashboard')}
                  onSaveSuccess={() => setView('dashboard')}
                />
              )}

              {view === 'view-cv' && activeCandidateId !== null && (
                <CandidateCV
                  token={token}
                  candidateId={activeCandidateId}
                  onBack={() => setView('dashboard')}
                />
              )}
            </>
          )}

          {activeTab === 'informes' && (
            <div className="fade-in" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
              <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>Panel de Control de Estadísticas</h1>
                  <p style={{ color: '#64748b', marginTop: '4px' }}>Métricas analíticas en tiempo real y trazabilidad del personal.</p>
                </div>
                <button 
                  onClick={() => {
                    setLoadingStats(true);
                    // Force stats fetch by fetching stats directly
                    fetch('http://localhost:8080/api/stats', {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    })
                    .then(res => {
                      if (!res.ok) throw new Error('Error al cargar.');
                      return res.json();
                    })
                    .then(data => setStats(data))
                    .catch(err => setStatsError(err.message))
                    .finally(() => setLoadingStats(false));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <Clock size={16} />
                  Actualizar Datos
                </button>
              </div>

              {statsError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#991b1b' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{statsError}. Intenta refrescar navegando entre pestañas.</span>
                </div>
              )}

              {/* Statistics Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Card 1: Total */}
                <div className="glass-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total de Postulantes</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                  </div>
                  {loadingStats ? (
                    <Loader2 className="animate-spin" size={24} style={{ color: '#3b82f6' }} />
                  ) : (
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                      {stats ? stats.total.toLocaleString('es-AR') : '0'}
                    </h2>
                  )}
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Total de perfiles activos en la base de datos</p>
                </div>

                {/* Card 2: Last Week */}
                <div className="glass-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agregados Última Semana</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={20} />
                    </div>
                  </div>
                  {loadingStats ? (
                    <Loader2 className="animate-spin" size={24} style={{ color: '#10b981' }} />
                  ) : (
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                      {stats ? stats.lastWeek : '0'}
                    </h2>
                  )}
                  <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '8px' }}>Nuevos perfiles registrados en los últimos 7 días</p>
                </div>

                {/* Card 3: Last Month */}
                <div className="glass-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agregados Último Mes</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#faf5ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={20} />
                    </div>
                  </div>
                  {loadingStats ? (
                    <Loader2 className="animate-spin" size={24} style={{ color: '#8b5cf6' }} />
                  ) : (
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                      {stats ? stats.lastMonth : '0'}
                    </h2>
                  )}
                  <p style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600, marginTop: '8px' }}>Nuevos perfiles en los últimos 30 días</p>
                </div>
              </div>

              {!loadingStats && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                  
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Interviewers performance */}
                    <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                          <UserCheck size={20} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Desempeño de Entrevistadores</h3>
                      </div>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Cantidad de postulantes agregados por cada miembro del personal.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats.byInterviewer && stats.byInterviewer.length > 0 ? (
                          stats.byInterviewer.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>
                                  {getInitials(item.name)}
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{item.name}</span>
                              </div>
                              <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                                {item.count} postulantes
                              </span>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '12px' }}>No hay datos de entrevistas registrados.</p>
                        )}
                      </div>
                    </div>

                    {/* Labor Status distribution */}
                    <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
                          <Briefcase size={20} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Distribución por Estado Laboral</h3>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {Object.entries(stats.byEstadoLaboral || {}).map(([key, val]: any, idx) => {
                          const percentage = stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;
                          let barColor = '#64748b'; // default
                          if (key === 'DESEMPLEADO') barColor = '#ef4444';
                          else if (key === 'EMPLEADO') barColor = '#10b981';
                          else if (key === 'EN_BUSQUEDA_ACTIVA') barColor = '#3b82f6';
                          else if (key === 'PROGRAMA_SOCIAL') barColor = '#f59e0b';

                          return (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                <span>{key.replace(/_/g, ' ')}</span>
                                <span>{val} ({percentage}%)</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: barColor, borderRadius: '4px' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Top 5 Barrios */}
                    <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                          <MapPin size={20} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Top 5 Barrios con más Postulantes</h3>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {stats.byBarrio && stats.byBarrio.length > 0 ? (
                          stats.byBarrio.map((item: any, idx: number) => {
                            const maxVal = stats.byBarrio[0].count;
                            const percentage = maxVal > 0 ? Math.round((item.count / maxVal) * 100) : 0;
                            return (
                              <div key={idx} style={{ position: 'relative', padding: '12px', backgroundColor: '#faf5ff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #f3e8ff' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percentage}%`, backgroundColor: '#f3e8ff', opacity: 0.5, zIndex: 1 }}></div>
                                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#5b21b6' }}>{idx + 1}. {item.name}</span>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#6d28d9' }}>{item.count} postulantes</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>Sin datos de barrios.</p>
                        )}
                      </div>
                    </div>

                    {/* Education levels */}
                    <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ecfeff', color: '#0891b2' }}>
                          <GraduationCap size={20} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Nivel de Educación Alcanzado</h3>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats.byNivelEducativo && stats.byNivelEducativo.length > 0 ? (
                          stats.byNivelEducativo.map((item: any, idx: number) => (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                <span>{item.level}</span>
                                <span style={{ color: '#0e7490' }}>{item.count} pers.</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#ecfeff', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0}%`, height: '100%', backgroundColor: '#06b6d4', borderRadius: '3px' }}></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>Sin datos de educación cargados.</p>
                        )}
                      </div>
                    </div>

                    {/* Gender distribution */}
                    <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '20px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fdf2f8', color: '#db2777' }}>
                          <BarChart3 size={20} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Distribución de Género</h3>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {Object.entries(stats.byGenero || {}).map(([key, val]: any, idx) => (
                          <div key={idx} style={{ flex: '1 1 120px', padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '10px', border: '1px solid #fbcfe8', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#9d174d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#be185d', marginTop: '4px' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="fade-in" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 20px' }}>
              <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>Gestión de Personal</h1>
                  <p style={{ color: '#64748b', marginTop: '4px' }}>Crea entrevistadores, gestiona cuentas y administra accesos del sistema.</p>
                </div>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  <Plus size={16} />
                  Nuevo Entrevistador
                </button>
              </div>

              {usersError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#991b1b' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{usersError}</span>
                </div>
              )}

              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden'
              }}>
                {loadingUsers ? (
                  <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 size={36} className="animate-spin" style={{ color: '#3b82f6' }} />
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Cargando personal...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <AlertCircle size={36} style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#64748b', fontWeight: 500 }}>No hay usuarios de personal registrados.</span>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid hsl(var(--border))' }}>
                          <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre Completo</th>
                          <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Usuario</th>
                          <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Rol</th>
                          <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</th>
                          <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userItem, idx) => (
                          <tr
                            key={userItem.id}
                            style={{
                              borderBottom: idx === users.length - 1 ? 'none' : '1px solid #f1f5f9',
                              transition: 'var(--transition)'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  backgroundColor: userItem.role.includes('SuperAdmin') ? '#faf5ff' : '#eff6ff',
                                  color: userItem.role.includes('SuperAdmin') ? '#8b5cf6' : '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: 700
                                }}>
                                  {getInitials(userItem.nombreCompleto || 'U')}
                                </div>
                                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{userItem.nombreCompleto || 'Sin Nombre'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>{userItem.username}</td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                backgroundColor: userItem.role.includes('SuperAdmin') ? '#f3e8ff' : '#e0f2fe',
                                color: userItem.role.includes('SuperAdmin') ? '#6b21a8' : '#0369a1'
                              }}>
                                {userItem.role.replace('ROLE_', '')}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <button
                                disabled={userItem.username === 'superadmin'}
                                onClick={() => handleToggleUserStatus(userItem.id, userItem.activo !== false)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: userItem.username === 'superadmin' ? 'default' : 'pointer',
                                  display: 'inline-flex',
                                  outline: 'none'
                                }}
                              >
                                <span className={`badge ${userItem.activo !== false ? 'badge-contratado' : 'badge-rechazado'}`} style={{ opacity: userItem.username === 'superadmin' ? 0.8 : 1 }}>
                                  {userItem.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                              </button>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setSelectedUserForPassword(userItem);
                                    setShowChangePasswordModal(true);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #cbd5e1',
                                    color: '#475569',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#94a3b8';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                  }}
                                >
                                  <Key size={14} />
                                  Nueva Contraseña
                                </button>
                                {userItem.username !== 'superadmin' && (
                                  <button
                                    onClick={() => handleDeleteUser(userItem.id, userItem.nombreCompleto)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '6px',
                                      borderRadius: '8px',
                                      backgroundColor: 'transparent',
                                      border: '1px solid #fee2e2',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fef2f2';
                                      e.currentTarget.style.borderColor = '#fca5a5';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.borderColor = '#fee2e2';
                                    }}
                                    title="Eliminar Entrevistador"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      {/* Sleek Create User Modal */}
      {showCreateUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '440px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowCreateUserModal(false);
                setNewUsername('');
                setNewPassword('');
                setNewNombreCompleto('');
                setNewRole('Entrevistador');
              }}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Nuevo Miembro del Personal</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Crea un nuevo usuario de tipo entrevistador o administrador.</p>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas Gomez"
                  value={newNombreCompleto}
                  onChange={(e) => setNewNombreCompleto(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. lucas"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  placeholder="Contraseña del personal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Rol Asignado</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="Entrevistador">Entrevistador</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingUser}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {creatingUser ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sleek Change Password Modal */}
      {showChangePasswordModal && selectedUserForPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowChangePasswordModal(false);
                setSelectedUserForPassword(null);
                setChangePasswordField('');
              }}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Cambiar Contraseña</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Actualiza la contraseña del usuario <strong style={{ color: '#1e293b' }}>{selectedUserForPassword.nombreCompleto}</strong>.
              </p>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="Ingresa la nueva contraseña"
                  value={changePasswordField}
                  onChange={(e) => setChangePasswordField(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {changingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Confirmar Cambio'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
