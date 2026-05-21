import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import CandidateForm from './CandidateForm';
import CandidateCV from './CandidateCV';
import { LogOut, Users, FileText, UserPlus, Loader2, AlertCircle } from 'lucide-react';

type ViewState = 'dashboard' | 'create-candidate' | 'edit-candidate' | 'view-cv';
type TabState = 'postulantes' | 'informes';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [view, setView] = useState<ViewState>('dashboard');
  const [activeTab, setActiveTab] = useState<TabState>('postulantes');
  const [activeCandidateId, setActiveCandidateId] = useState<number | null>(null);

  const [stats, setStats] = useState<{ total: number; lastWeek: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Fetch statistics when entering the Reports tab
  useEffect(() => {
    if (activeTab === 'informes' && token) {
      setLoadingStats(true);
      setStatsError('');
      fetch('http://localhost:8080/api/ciudadanos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al cargar estadísticas.');
        }
        return res.json();
      })
      .then((data: any[]) => {
        const total = data.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const lastWeek = data.filter(c => {
          if (!c.fechaRegistro) return false;
          const regDate = new Date(c.fechaRegistro);
          return regDate >= oneWeekAgo;
        }).length;
        setStats({ total, lastWeek });
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
    setView('dashboard');
    setActiveTab('postulantes');
    setActiveCandidateId(null);
  };

  // Si no está autenticado, forzar pantalla de login
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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

          <button
            onClick={() => setActiveTab('informes')}
            className={`sidebar-item ${activeTab === 'informes' ? 'active' : ''}`}
          >
            <FileText size={18} />
            Informes
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header (no-print) */}
        <header className="top-header no-print">
          <div className="header-user">
            <span className="user-name">admin</span>
            <div className="user-avatar">AD</div>
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
            <div className="fade-in" style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>Generador de Informes</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Visualiza estadísticas en tiempo real y descarga reportes personalizados.</p>
              </div>

              {/* Statistics Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Postulantes Registrados</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                  </div>
                  {loadingStats ? (
                    <Loader2 className="animate-spin" size={24} style={{ color: '#3b82f6' }} />
                  ) : statsError ? (
                    <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 500 }}>Error</span>
                  ) : (
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                      {stats ? stats.total.toLocaleString('es-AR') : '0'}
                    </h2>
                  )}
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Total de CVs cargados en el padrón</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agregados Última Semana</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={20} />
                    </div>
                  </div>
                  {loadingStats ? (
                    <Loader2 className="animate-spin" size={24} style={{ color: '#10b981' }} />
                  ) : statsError ? (
                    <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 500 }}>Error</span>
                  ) : (
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                      {stats ? stats.lastWeek : '0'}
                    </h2>
                  )}
                  <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '8px' }}>Nuevos perfiles registrados</p>
                </div>
              </div>

              {statsError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#991b1b' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{statsError}. Intenta refrescar navegando entre pestañas.</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
