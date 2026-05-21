import { useEffect, useState } from 'react';
import { Search, Eye, Edit2, Trash2, Loader2, AlertCircle, User } from 'lucide-react';

interface Candidate {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  estadoLaboral: string;
  fechaRegistro: string;
}

interface DashboardProps {
  token: string;
  onNewCandidate: () => void;
  onEditCandidate: (id: number) => void;
  onViewCV: (id: number) => void;
}

export default function Dashboard({ token, onNewCandidate, onEditCandidate, onViewCV }: DashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCandidates = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const url = query 
        ? `http://localhost:8080/api/ciudadanos?buscar=${encodeURIComponent(query)}` 
        : 'http://localhost:8080/api/ciudadanos';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        }
        throw new Error('Error al obtener la lista de postulantes.');
      }

      const data = await response.json();
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(search);
  }, [search]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja al postulante ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/ciudadanos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar al postulante.');
      }

      setCandidates(prev => prev.filter(c => c.id !== id));
      alert('Postulante dado de baja con éxito.');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar postulante.');
    }
  };

  const getBadgeClass = (status: string) => {
    const s = status ? status.toUpperCase() : 'DESEMPLEADO';
    switch (s) {
      case 'EN_BUSQUEDA_ACTIVA':
      case 'ENTREVISTA':
        return 'badge-entrevista';
      case 'EMPLEADO':
      case 'CONTRATADO':
        return 'badge-contratado';
      case 'PROGRAMA_SOCIAL':
      case 'RECIBIDO':
        return 'badge-recibido';
      case 'DESEMPLEADO':
      case 'RECHAZADO':
        return 'badge-rechazado';
      default:
        return 'badge-recibido';
    }
  };

  const formatStatusText = (status: string) => {
    const s = status ? status.toUpperCase() : 'DESEMPLEADO';
    switch (s) {
      case 'EN_BUSQUEDA_ACTIVA': return 'EN BÚSQUEDA ACTIVA';
      case 'EMPLEADO': return 'EMPLEADO';
      case 'PROGRAMA_SOCIAL': return 'PROGRAMA SOCIAL';
      case 'DESEMPLEADO': return 'DESEMPLEADO';
      default: return s;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '12/05/2024'; // Valor por defecto
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return '12/05/2024';
    }
  };

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* Search and Action Bar (Mockup Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        marginBottom: '32px',
        backgroundColor: 'white',
        padding: '12px 24px',
        borderRadius: '16px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '44px',
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                width: '100%',
                fontSize: '14px',
                color: '#1e293b'
              }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>

          <select
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              color: '#64748b',
              cursor: 'pointer',
              width: 'auto',
              paddingRight: '24px'
            }}
            defaultValue="all"
          >
            <option value="all">Todas las categorías</option>
            <option value="desempleado">Desempleado</option>
            <option value="entrevista">Entrevista</option>
            <option value="contratado">Contratado</option>
            <option value="recibido">Recibido</option>
          </select>
        </div>

        <button 
          onClick={onNewCandidate}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Nuevo
        </button>
      </div>

      {/* Main Card Container */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden'
      }}>
        {loading && candidates.length === 0 ? (
          <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Cargando postulantes...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'hsl(var(--color-rechazado))' }}>
            <AlertCircle size={36} />
            <span style={{ fontWeight: 500 }}>{error}</span>
            <button className="btn-secondary" onClick={() => fetchCandidates(search)}>Reintentar</button>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <AlertCircle size={36} style={{ color: 'hsl(var(--text-muted))' }} />
            <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>No se encontraron postulantes.</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#fafbfc', 
                  borderBottom: '1px solid hsl(var(--border))'
                }}>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Postulante</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Fecha</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>CV</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, idx) => (
                  <tr 
                    key={candidate.id} 
                    style={{ 
                      borderBottom: idx === candidates.length - 1 ? 'none' : '1px solid hsl(var(--border) / 0.7)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* User Profile column (Mockup avatar user icon) */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#eff6ff',
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>
                            {candidate.nombre} {candidate.apellido}
                          </div>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                            {candidate.email || 'correo@sin-email.com'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Estado Badge column */}
                    <td style={{ padding: '20px 24px' }}>
                      <span className={`badge ${getBadgeClass(candidate.estadoLaboral)}`}>
                        {formatStatusText(candidate.estadoLaboral)}
                      </span>
                    </td>

                    {/* Fecha column */}
                    <td style={{ padding: '20px 24px', color: 'hsl(var(--text-muted))', fontSize: '14px' }}>
                      {formatDate(candidate.fechaRegistro)}
                    </td>

                    {/* Ver CV column (Bordered Black Style) */}
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <button 
                        onClick={() => onViewCV(candidate.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          backgroundColor: 'transparent',
                          border: '1px solid #1e293b',
                          color: '#1e293b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye size={14} />
                        Ver CV
                      </button>
                    </td>

                    {/* Actions column (With borders and hover animations) */}
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => onEditCandidate(candidate.id)}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#64748b',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#64748b';
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(candidate.id, `${candidate.nombre} ${candidate.apellido}`)}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#64748b',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#64748b';
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
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
  );
}
