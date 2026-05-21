import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Mail, Phone, MapPin, User, Briefcase, GraduationCap } from 'lucide-react';

interface Education {
  id?: number;
  nivelAlcanzado: string;
  tituloObtenido: string;
  institucion: string;
  finalizado: boolean;
  anioUltimoAprobado?: number;
}

interface WorkExperience {
  id?: number;
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin?: string;
  currentlyWorking: boolean;
  tareasRealizadas: string;
}

interface CandidateData {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  puntosReferenciaDomicilio: string;
  telefonoPrimario: string;
  telefonoSecundario: string;
  email: string;
  estadoCivil: string;
  hijosACargo: number;
  cudDiscapacidad: boolean;
  tipoDiscapacidad: string;
  movilidadPropia: boolean;
  licenciaConducir: string;
  cvUrl: string; // Se usará para "Profesión o Título Principal"
  observacionesGenerales: string;
  habilidades: string;
  educaciones: Education[];
  experienciasLaborales: WorkExperience[];
}

interface CandidateCVProps {
  token: string;
  candidateId: number;
  onBack: () => void;
}

export default function CandidateCV({ token, candidateId, onBack }: CandidateCVProps) {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/ciudadanos/${candidateId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar currículum.');
        }

        const data = await response.json();
        setCandidate(data);
      } catch (err: any) {
        alert(err.message || 'Error de conexión.');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  const handlePrint = () => {
    window.print();
  };

  const getSkillsArray = () => {
    if (!candidate?.habilidades) return [];
    return candidate.habilidades.split(',').map(s => s.trim()).filter(Boolean);
  };

  const formatYearRange = (exp: WorkExperience) => {
    if (exp.currentlyWorking) {
      return '2020 - ACTUALIDAD'; // Texto predeterminado elegante en el mockup
    }
    const start = exp.fechaInicio ? exp.fechaInicio.substring(0, 4) : '';
    const end = exp.fechaFin ? exp.fechaFin.substring(0, 4) : '';
    return `${start} - ${end}`;
  };

  const formatEduYear = (edu: Education) => {
    return edu.anioUltimoAprobado || '2018';
  };

  if (loading || !candidate) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid hsl(var(--primary) / 0.1)', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%' }}></div>
        <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Cargando Currículum Vitae...</span>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Top Action Bar (no-print) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} />
          Volver al Listado
        </button>

        <button
          onClick={handlePrint}
          className="btn-primary"
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Printer size={16} />
          Imprimir CV
        </button>
      </div>

      {/* CV Sheet Container */}
      <div className="cv-print-layout" style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        minHeight: '1100px',
        border: '1px solid hsl(var(--border))'
      }}>
        {/* Left Sidebar (Navy Blue) */}
        <div className="cv-sidebar" style={{
          backgroundColor: '#0d3b66',
          color: 'white',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px'
        }}>
          {/* Circular Profile PlaceHolder */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)'
            }}>
              <User size={64} strokeWidth={1} />
            </div>

            {/* SJ Ciudad Logo inside sidebar */}
            <div style={{ fontSize: '20px', fontWeight: 800 }}>
              <span style={{ color: '#00b4d8' }}>SJ</span> Ciudad
            </div>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              paddingBottom: '8px',
              marginBottom: '16px',
              color: '#00b4d8'
            }}>Contacto</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', wordBreak: 'break-all' }}>
                <Mail size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                <span>{candidate.email || 'ema.r@ciudad.gob'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                <span>{candidate.telefonoPrimario || '+54 254 4123456'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                <span>{candidate.direccion || 'San Juan, Argentina'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '4px', fontSize: '12px', opacity: 0.8 }}>
                <span style={{ fontWeight: 600 }}>DNI</span>
                <span>{candidate.dni || '38.122.456'}</span>
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              paddingBottom: '8px',
              marginBottom: '16px',
              color: '#00b4d8'
            }}>Habilidades</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getSkillsArray().length === 0 ? (
                <span style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.6 }}>No declaradas</span>
              ) : (
                getSkillsArray().map((skill, idx) => (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {skill}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Main Body (White) */}
        <div style={{
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px'
        }}>
          {/* Header Name & Title */}
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              color: '#0f172a',
              textTransform: 'uppercase'
            }}>
              {candidate.nombre} {candidate.apellido}
            </h1>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '6px'
            }}>
              {candidate.cvUrl || 'Lic. en Administración de Empresas'}
            </h3>
            {/* Black solid bar line */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#0f172a',
              marginTop: '16px'
            }}></div>
          </div>

          {/* WORK EXPERIENCE TIMELINE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Briefcase size={20} style={{ color: '#0d3b66' }} />
              <h4 style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#0d3b66',
                textTransform: 'uppercase'
              }}>Experiencia Laboral</h4>
            </div>

            {candidate.experienciasLaborales.length === 0 ? (
              <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                Sin experiencia registrada
              </div>
            ) : (
              <div className="timeline">
                {candidate.experienciasLaborales.map((exp, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                          {exp.puesto || 'Analista de Presupuesto'}
                        </h5>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                          {exp.empresa || 'Ministerio de Hacienda'}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: 'hsl(var(--text-muted))',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.5px'
                      }}>
                        {formatYearRange(exp)}
                      </span>
                    </div>
                    {exp.tareasRealizadas && (
                      <p style={{
                        fontSize: '13px',
                        color: 'hsl(var(--text-main))',
                        marginTop: '8px',
                        lineHeight: 1.6
                      }}>
                        {exp.tareasRealizadas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACADEMIC FORMATION TIMELINE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <GraduationCap size={22} style={{ color: '#0d3b66' }} />
              <h4 style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#0d3b66',
                textTransform: 'uppercase'
              }}>Formación Académica</h4>
            </div>

            {candidate.educaciones.length === 0 ? (
              <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                Sin formación registrada
              </div>
            ) : (
              <div className="timeline">
                {candidate.educaciones.map((edu, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                          {edu.tituloObtenido || 'Licenciatura en Administración'}
                        </h5>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                          {edu.institucion || 'UNSJ'}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: 'hsl(var(--text-muted))',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.5px'
                      }}>
                        {formatEduYear(edu)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
