import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, MapPin, User } from 'lucide-react';

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

interface Rubro {
  id: number;
  nombre: string;
  activo?: boolean;
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
  rubros?: Rubro[];
  tipoEmpleoBuscado?: string;
  situacionMonotributo?: boolean;
  situacionResponsableInscripto?: boolean;
  situacionAter?: boolean;
  situacionHabilitacionMunicipal?: boolean;
  situacionRegistroEspecifico?: string;
  tieneObraSocial?: boolean;
  planSocialActivo?: string;
  foto?: string;
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
        minHeight: '1100px',
        border: '1px solid hsl(var(--border))',
        padding: '56px 48px',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* SJ Ciudad Logo Top Right */}
        <div style={{ position: 'absolute', top: '48px', right: '48px', fontSize: '18px', fontWeight: 800 }}>
          <span style={{ color: '#00b4d8' }}>SJ</span> Ciudad
        </div>

        {/* HEADER SECTION (Centered Name & Photo) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
          {/* Profile Photo */}
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#e2e8f0',
            border: '2px solid #cbd5e1',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            {candidate.foto ? (
              <img src={candidate.foto} alt={`${candidate.nombre} ${candidate.apellido}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={56} style={{ color: '#94a3b8' }} />
            )}
          </div>

          {/* Full Name */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            {candidate.nombre} {candidate.apellido}
          </h1>

          {/* Subtitle Details */}
          <div style={{
            fontSize: '13px',
            color: '#64748b',
            fontWeight: 600,
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span>{candidate.cvUrl || 'Postulante'}</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              {candidate.direccion || 'San José, Entre Ríos'}
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>{candidate.telefonoPrimario}</span>
          </div>
        </div>

        {/* TWO-COLUMN GRID LAYOUT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '40px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '32px'
        }}>
          {/* LEFT Narrow Column (Details & Competencies) */}
          <div style={{
            borderRight: '1px solid #e2e8f0',
            paddingRight: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px'
          }}>
            {/* DETALLES */}
            <div>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#334155',
                textAlign: 'center',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>o</span> DETALLES <span style={{ fontSize: '10px', color: '#94a3b8' }}>o</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#475569' }}>
                {candidate.email && (
                  <div style={{ textAlign: 'center', wordBreak: 'break-all' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                    <span>{candidate.email}</span>
                  </div>
                )}
                {candidate.telefonoSecundario && (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teléfono Secundario</span>
                    <span>{candidate.telefonoSecundario}</span>
                  </div>
                )}
                {candidate.puntosReferenciaDomicilio && (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ref. Dirección</span>
                    <span>{candidate.puntosReferenciaDomicilio}</span>
                  </div>
                )}
                {candidate.fechaNacimiento && (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha de Nacimiento</span>
                    <span>{candidate.fechaNacimiento.substring(0, 10).split('-').reverse().join('/')}</span>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documentos</span>
                  <span>DNI: {candidate.dni}</span>
                  {candidate.cuil && <span style={{ display: 'block', fontSize: '12px' }}>CUIL: {candidate.cuil}</span>}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Datos Personales</span>
                  <span>Género: {candidate.genero}</span>
                  <span style={{ display: 'block' }}>E. Civil: {candidate.estadoCivil || 'No especificado'}</span>
                  <span style={{ display: 'block' }}>Hijos a cargo: {candidate.hijosACargo || 0}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Licencia y Movilidad</span>
                  <span>Movilidad propia: {candidate.movilidadPropia ? 'Sí' : 'No'}</span>
                  <span style={{ display: 'block' }}>
                    Licencia: {
                      !candidate.licenciaConducir || candidate.licenciaConducir === 'NO_POSEE'
                        ? 'No posee'
                        : candidate.licenciaConducir
                    }
                  </span>
                </div>
                {(candidate.tieneObraSocial || candidate.planSocialActivo) && (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seguridad Social</span>
                    <span>Obra social: {candidate.tieneObraSocial ? 'Sí posee' : 'No posee'}</span>
                    {candidate.planSocialActivo && <span style={{ display: 'block' }}>Plan: {candidate.planSocialActivo}</span>}
                  </div>
                )}
                {(candidate.situacionMonotributo || candidate.situacionResponsableInscripto || candidate.situacionAter || candidate.situacionHabilitacionMunicipal || candidate.situacionRegistroEspecifico) && (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habilitaciones</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', fontSize: '11px' }}>
                      {candidate.situacionMonotributo && <span>• Monotributista</span>}
                      {candidate.situacionResponsableInscripto && <span>• Responsable Inscripto</span>}
                      {candidate.situacionAter && <span>• Registro ATER</span>}
                      {candidate.situacionHabilitacionMunicipal && <span>• Habilitación Municipal</span>}
                      {candidate.situacionRegistroEspecifico && <span>• {candidate.situacionRegistroEspecifico}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COMPETENCIAS */}
            {getSkillsArray().length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#334155',
                  textAlign: 'center',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>o</span> COMPETENCIAS <span style={{ fontSize: '10px', color: '#94a3b8' }}>o</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getSkillsArray().map((skill, idx) => (
                    <div
                      key={idx}
                      style={{
                        textAlign: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #1e293b',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'capitalize'
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RUBROS DE INTERÉS */}
            {candidate.rubros && candidate.rubros.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#334155',
                  textAlign: 'center',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>o</span> INTERESES <span style={{ fontSize: '10px', color: '#94a3b8' }}>o</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {candidate.rubros.map((rubro) => (
                    <div
                      key={rubro.id}
                      style={{
                        textAlign: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#64748b'
                      }}
                    >
                      {rubro.nombre}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT Wide Column (Profile & Timelines) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '36px'
          }}>
            {/* PERFIL */}
            {candidate.observacionesGenerales && candidate.observacionesGenerales.trim() && (
              <div>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}>
                  PERFIL
                </h4>
                <div style={{
                  borderLeft: '2px solid #cbd5e1',
                  paddingLeft: '16px',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: 1.6,
                  textAlign: 'justify'
                }}>
                  {candidate.observacionesGenerales.replace(/^Perfil original Excel:\s*/gi, '')}
                </div>
              </div>
            )}

            {/* EXPERIENCIA LABORAL */}
            <div>
              <h4 style={{
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: '#0f172a',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                EXPERIENCIA LABORAL
              </h4>

              {candidate.experienciasLaborales.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginLeft: '12px' }}>Sin experiencia laboral previa registrada.</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  borderLeft: '2px solid #e2e8f0',
                  paddingLeft: '24px',
                  marginLeft: '8px'
                }}>
                  {candidate.experienciasLaborales.map((exp, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      {/* Circle Timeline Bullet */}
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '2px solid #475569',
                        boxShadow: '0 0 0 4px white'
                      }}></div>

                      {/* Header details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
                          {exp.puesto}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          {formatYearRange(exp)}
                        </span>
                      </div>

                      {/* Subtitle details */}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                        {exp.empresa}
                      </div>

                      {/* Job tasks / description */}
                      {exp.tareasRealizadas && (
                        <p style={{
                          fontSize: '13px',
                          color: '#64748b',
                          marginTop: '8px',
                          lineHeight: 1.6,
                          textAlign: 'justify',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {exp.tareasRealizadas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EDUCACIÓN */}
            <div>
              <h4 style={{
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: '#0f172a',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                EDUCACIÓN
              </h4>

              {candidate.educaciones.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginLeft: '12px' }}>Sin registros de formación académica.</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  borderLeft: '2px solid #e2e8f0',
                  paddingLeft: '24px',
                  marginLeft: '8px'
                }}>
                  {candidate.educaciones.map((edu, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      {/* Circle Timeline Bullet */}
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '2px solid #475569',
                        boxShadow: '0 0 0 4px white'
                      }}></div>

                      {/* Header details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
                          {edu.tituloObtenido || edu.nivelAlcanzado}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                          {formatEduYear(edu)}
                        </span>
                      </div>

                      {/* Subtitle details */}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                        {edu.institucion} {edu.finalizado ? '' : '(Cursando)'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
