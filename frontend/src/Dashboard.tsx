import { useEffect, useState } from 'react';
import { Search, Eye, Edit2, Trash2, Loader2, AlertCircle, User, X, Briefcase, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface Rubro {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Candidate {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  estadoLaboral: string;
  fechaRegistro: string;
  rubros?: Rubro[];
  telefonoPrimario?: string;
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

  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [selectedRubroId, setSelectedRubroId] = useState<number | null>(null);
  const [showRubroModal, setShowRubroModal] = useState(false);
  const [newRubroName, setNewRubroName] = useState('');
  const [creatingRubro, setCreatingRubro] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [editingRubroId, setEditingRubroId] = useState<number | null>(null);
  const [editingRubroName, setEditingRubroName] = useState('');

  const fetchRubros = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/rubros', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRubros(data);
      }
    } catch (err) {
      console.error('Error fetching rubros:', err);
    }
  };

  const fetchCandidates = async (query = '', rubroId: number | null = null, pageNum = 0) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append('buscar', query.trim());
      }
      if (rubroId !== null) {
        params.append('rubroId', rubroId.toString());
      }
      params.append('page', pageNum.toString());
      params.append('size', '20');
      
      const url = `http://localhost:8080/api/ciudadanos?${params.toString()}`;

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
      setCandidates(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRubro = async () => {
    if (!newRubroName.trim()) return;
    setCreatingRubro(true);
    try {
      const response = await fetch('http://localhost:8080/api/rubros', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: newRubroName.trim() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar el rubro.');
      }

      setNewRubroName('');
      await fetchRubros();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el rubro.');
    } finally {
      setCreatingRubro(false);
    }
  };

  const handleUpdateRubro = async (id: number) => {
    if (!editingRubroName.trim()) return;
    try {
      const response = await fetch(`http://localhost:8080/api/rubros/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: editingRubroName.trim() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el rubro.');
      }

      setEditingRubroId(null);
      setEditingRubroName('');
      await fetchRubros();
      fetchCandidates(search, selectedRubroId, page);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el rubro.');
    }
  };

  const handleDeleteRubro = async (id: number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja el rubro "${name}"? No se eliminarán los postulantes vinculados, pero este rubro ya no aparecerá como opción.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/rubros/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al dar de baja el rubro.');
      }

      await fetchRubros();
      if (selectedRubroId === id) {
        setSelectedRubroId(null);
        setPage(0);
      } else {
        fetchCandidates(search, selectedRubroId, page);
      }
    } catch (err: any) {
      alert(err.message || 'Error al dar de baja el rubro.');
    }
  };

  useEffect(() => {
    fetchRubros();
  }, []);

  useEffect(() => {
    fetchCandidates(search, selectedRubroId, page);
  }, [search, selectedRubroId, page]);

  useEffect(() => {
    if (showRubroModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showRubroModal]);

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

  const toggleCandidateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'EMPLEADO' ? 'EN_BUSQUEDA_ACTIVA' : 'EMPLEADO';
    try {
      const response = await fetch(`http://localhost:8080/api/ciudadanos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estadoLaboral: nextStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el estado.');
      }

      // Actualizar el estado localmente
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, estadoLaboral: nextStatus } : c));
    } catch (err: any) {
      alert(err.message || 'Error de conexión al actualizar el estado.');
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
    <>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={selectedRubroId || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRubroId(val === 'all' ? null : Number(val));
                setPage(0);
              }}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: '#64748b',
                cursor: 'pointer',
                width: 'auto',
                paddingRight: '24px',
                outline: 'none'
              }}
            >
              <option value="all">Todos los rubros</option>
              {rubros.map((rubro) => (
                <option key={rubro.id} value={rubro.id}>
                  {rubro.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowRubroModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              title="Administrar Rubros de Búsqueda"
            >
              <Briefcase size={14} />
              Rubros
            </button>
          </div>
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
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#fafbfc', 
                    borderBottom: '1px solid hsl(var(--border))'
                  }}>
                    <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Postulante</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Rubro</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Fecha</th>
                    <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</th>
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
                      {/* Postulante Column */}
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
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              <span style={{ fontWeight: 500 }}>Tel:</span> {candidate.telefonoPrimario || 'Sin teléfono'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rubro Column */}
                      <td style={{ padding: '20px 24px' }}>
                        {candidate.rubros && candidate.rubros.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {candidate.rubros.map((rubro) => (
                              <span
                                key={rubro.id}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: 'hsl(var(--primary) / 0.08)',
                                  color: 'hsl(var(--primary))',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.2px'
                                }}
                              >
                                {rubro.nombre}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Sin rubro</span>
                        )}
                      </td>

                      {/* Fecha Column */}
                      <td style={{ padding: '20px 24px', color: 'hsl(var(--text-muted))', fontSize: '14px' }}>
                        {formatDate(candidate.fechaRegistro)}
                      </td>

                      {/* Estado Badge column (Clickable & Interactive) */}
                      <td style={{ padding: '20px 24px' }}>
                        <button
                          onClick={() => toggleCandidateStatus(candidate.id, candidate.estadoLaboral)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'inline-flex',
                            outline: 'none',
                            transition: 'transform 0.2s ease, opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.opacity = '1';
                          }}
                          title="Haga clic para cambiar el estado laboral"
                        >
                          <span className={`badge ${getBadgeClass(candidate.estadoLaboral)}`}>
                            {formatStatusText(candidate.estadoLaboral)}
                          </span>
                        </button>
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

            {/* Pagination Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid hsl(var(--border) / 0.7)',
              backgroundColor: '#fafbfc',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                Mostrando <span style={{ fontWeight: 600, color: '#0f172a' }}>{candidates.length}</span> de <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalElements}</span> postulantes
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: page === 0 ? '#f1f5f9' : 'white',
                    color: page === 0 ? '#94a3b8' : '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: page === 0 ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (page > 0) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page > 0) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>

                <div style={{
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 600,
                  padding: '0 8px'
                }}>
                  Página <span style={{ color: '#0f172a' }}>{page + 1}</span> de <span style={{ color: '#0f172a' }}>{totalPages || 1}</span>
                </div>

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: page >= totalPages - 1 ? '#f1f5f9' : 'white',
                    color: page >= totalPages - 1 ? '#94a3b8' : '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (page < totalPages - 1) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page < totalPages - 1) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

      {/* Sleek Admin Rubros Modal */}
      {showRubroModal && (
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
            maxWidth: '480px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowRubroModal(false);
                setNewRubroName('');
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Administrar Rubros de Búsqueda</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Agrega nuevos rubros o visualiza las categorías laborales actualmente activas en el sistema.
              </p>
            </div>

            {/* List of existing Rubros */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Rubros Existentes ({rubros.length})
              </label>
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px',
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {rubros.length === 0 ? (
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '8px' }}>
                    No hay rubros creados.
                  </span>
                ) : (
                  rubros.map(r => {
                    const isEditing = editingRubroId === r.id;
                    return (
                      <div
                        key={r.id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingRubroName}
                            onChange={(e) => setEditingRubroName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                await handleUpdateRubro(r.id);
                              } else if (e.key === 'Escape') {
                                setEditingRubroId(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span style={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.nombre}
                          </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdateRubro(r.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#10b981',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Guardar cambios"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingRubroId(null)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingRubroId(r.id);
                                  setEditingRubroName(r.nombre);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Editar rubro"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteRubro(r.id, r.nombre)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Dar de baja rubro"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Form to add a new Rubro */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nuevo Rubro de Búsqueda
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Ej: Sistemas, Administrativo..."
                  value={newRubroName}
                  onChange={(e) => setNewRubroName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      await handleCreateRubro();
                    }
                  }}
                />
                <button
                  onClick={handleCreateRubro}
                  disabled={creatingRubro || !newRubroName.trim()}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: newRubroName.trim() ? '#3b82f6' : '#94a3b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: newRubroName.trim() ? 'pointer' : 'default',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => { if (newRubroName.trim()) e.currentTarget.style.backgroundColor = '#2563eb' }}
                  onMouseLeave={(e) => { if (newRubroName.trim()) e.currentTarget.style.backgroundColor = '#3b82f6' }}
                >
                  {creatingRubro ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
