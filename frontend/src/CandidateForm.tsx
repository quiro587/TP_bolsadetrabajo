import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, X } from 'lucide-react';

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
  id?: number;
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
  cudVencimiento?: string;
  movilidadPropia: boolean;
  licenciaConducir: string;
  cvUrl: string; // Se usará para "Profesión o Título Principal"
  observacionesGenerales: string;
  habilidades: string; // Comma separated list
  estadoLaboral: string;
  educaciones: Education[];
  experienciasLaborales: WorkExperience[];
  rubros?: Rubro[];
  tipoEmpleoBuscado: string;
  situacionMonotributo: boolean;
  situacionResponsableInscripto: boolean;
  situacionAter: boolean;
  situacionHabilitacionMunicipal: boolean;
  situacionRegistroEspecifico?: string;
  tieneObraSocial: boolean;
  planSocialActivo?: string;
}

interface CandidateFormProps {
  token: string;
  candidateId?: number | null;
  onBack: () => void;
  onSaveSuccess: () => void;
}

const emptyForm: CandidateData = {
  nombre: '',
  apellido: '',
  dni: '',
  cuil: '',
  fechaNacimiento: '',
  genero: 'Prefiero no decirlo',
  direccion: '',
  puntosReferenciaDomicilio: '',
  telefonoPrimario: '',
  telefonoSecundario: '',
  email: '',
  estadoCivil: 'Soltero/a',
  hijosACargo: 0,
  cudDiscapacidad: false,
  tipoDiscapacidad: '',
  movilidadPropia: false,
  licenciaConducir: 'NO_POSEE',
  cvUrl: '',
  observacionesGenerales: '',
  habilidades: '',
  estadoLaboral: 'EN_BUSQUEDA_ACTIVA',
  educaciones: [],
  experienciasLaborales: [],
  rubros: [],
  tipoEmpleoBuscado: 'Cualquiera',
  situacionMonotributo: false,
  situacionResponsableInscripto: false,
  situacionAter: false,
  situacionHabilitacionMunicipal: false,
  situacionRegistroEspecifico: '',
  tieneObraSocial: false,
  planSocialActivo: ''
};

export default function CandidateForm({ token, candidateId, onBack, onSaveSuccess }: CandidateFormProps) {
  const [formData, setFormData] = useState<CandidateData>(emptyForm);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [availableRubros, setAvailableRubros] = useState<Rubro[]>([]);

  // Fetch rubros
  useEffect(() => {
    const fetchRubros = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/rubros', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableRubros(data);
        }
      } catch (err) {
        console.error('Error fetching rubros:', err);
      }
    };
    fetchRubros();
  }, [token]);

  // Fetch candidate data if in edit mode
  useEffect(() => {
    if (candidateId) {
      const fetchCandidate = async () => {
        setFetching(true);
        try {
          const response = await fetch(`http://localhost:8080/api/ciudadanos/${candidateId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Error al cargar datos del postulante.');
          }

          const data = await response.json();
          
          // Formatear fechas para los inputs tipo date
          const formatted = {
            ...data,
            fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.substring(0, 10) : '',
            cudVencimiento: data.cudVencimiento ? data.cudVencimiento.substring(0, 10) : '',
            educaciones: data.educaciones || [],
            rubros: data.rubros || [],
            experienciasLaborales: (data.experienciasLaborales || []).map((exp: any) => ({
              ...exp,
              fechaInicio: exp.fechaInicio ? exp.fechaInicio.substring(0, 10) : '',
              fechaFin: exp.fechaFin ? exp.fechaFin.substring(0, 10) : ''
            }))
          };

          setFormData(formatted);
          if (data.habilidades) {
            setSkills(data.habilidades.split(',').map((s: string) => s.trim()).filter(Boolean));
          }
        } catch (err: any) {
          alert(err.message || 'Error de conexión.');
          onBack();
        } finally {
          setFetching(false);
        }
      };

      fetchCandidate();
    } else {
      setFormData(emptyForm);
      setSkills([]);
    }
  }, [candidateId]);

  // Sincronizar habilidades array con el campo de texto habilidades en el objeto formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      habilidades: skills.join(', ')
    }));
  }, [skills]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Dynamic Education Actions
  const handleAddEducation = () => {
    const newEdu: Education = {
      nivelAlcanzado: 'Secundario',
      tituloObtenido: '',
      institucion: '',
      finalizado: true
    };
    setFormData(prev => ({
      ...prev,
      educaciones: [...prev.educaciones, newEdu]
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    setFormData(prev => {
      const updated = [...prev.educaciones];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educaciones: updated };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      educaciones: prev.educaciones.filter((_, idx) => idx !== index)
    }));
  };

  // Dynamic Work Experience Actions
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      empresa: '',
      puesto: '',
      fechaInicio: '',
      currentlyWorking: false,
      tareasRealizadas: ''
    };
    setFormData(prev => ({
      ...prev,
      experienciasLaborales: [...prev.experienciasLaborales, newExp]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    setFormData(prev => {
      const updated = [...prev.experienciasLaborales];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experienciasLaborales: updated };
    });
  };

  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experienciasLaborales: prev.experienciasLaborales.filter((_, idx) => idx !== index)
    }));
  };

  // Skill Tags management
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!skills.includes(newSkill)) {
        setSkills(prev => [...prev, newSkill]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tagToRemove: string) => {
    setSkills(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleToggleRubro = (rubro: Rubro) => {
    const currentRubros = formData.rubros || [];
    const exists = currentRubros.some(r => r.id === rubro.id);
    let updated: Rubro[];
    if (exists) {
      updated = currentRubros.filter(r => r.id !== rubro.id);
    } else {
      updated = [...currentRubros, rubro];
    }
    setFormData(prev => ({
      ...prev,
      rubros: updated
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.cuil || !formData.fechaNacimiento || !formData.telefonoPrimario) {
      alert('Por favor, completa los campos requeridos (*).');
      return;
    }

    setLoading(true);

    try {
      // Ajustar fechaFin si está marcado como actualmente trabajando
      const adjustedForm = {
        ...formData,
        experienciasLaborales: formData.experienciasLaborales.map(exp => ({
          ...exp,
          fechaFin: exp.currentlyWorking ? undefined : exp.fechaFin
        }))
      };

      const response = await fetch('http://localhost:8080/api/ciudadanos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adjustedForm)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar el perfil del postulante.');
      }

      alert('Perfil guardado con éxito.');
      onSaveSuccess();
    } catch (err: any) {
      alert(err.message || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid hsl(var(--primary) / 0.1)', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%' }}></div>
        <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Cargando datos del postulante...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Top Header Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onBack}
            style={{ padding: '10px', borderRadius: '12px' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
              {candidateId ? 'Editar Perfil del Postulante' : 'Alta de Nuevo Postulante'}
            </h2>
            <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
              Completa la información laboral y académica de tu perfil.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600
          }}
          disabled={loading}
        >
          <Save size={18} />
          {loading ? 'Guardando...' : 'Guardar Perfil Completo'}
        </button>
      </div>

      {/* SECTION 1: DATOS PERSONALES */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow)',
        padding: '32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #3b82f6, #00b4d8)'
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '8px', height: '24px', borderRadius: '4px', backgroundColor: 'hsl(var(--primary))' }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Datos Personales</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Form grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>DNI *</label>
              <input
                type="text"
                name="dni"
                placeholder="00.000.000"
                value={formData.dni}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>CUIL *</label>
              <input
                type="text"
                name="cuil"
                placeholder="00-00000000-0"
                value={formData.cuil}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="text"
                name="telefonoPrimario"
                placeholder="+54 264 ..."
                value={formData.telefonoPrimario}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                placeholder="usuario@correo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Profesión o Título Principal</label>
              <input
                type="text"
                name="cvUrl"
                placeholder="Ej: Lic. en Recursos Humanos"
                value={formData.cvUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No Binario">No Binario</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado Civil</label>
              <select name="estadoCivil" value={formData.estadoCivil} onChange={handleChange}>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado Laboral</label>
              <select name="estadoLaboral" value={formData.estadoLaboral} onChange={handleChange}>
                <option value="EN_BUSQUEDA_ACTIVA">Entrevista</option>
                <option value="EMPLEADO">Contratado</option>
                <option value="PROGRAMA_SOCIAL">Recibido</option>
                <option value="DESEMPLEADO">Rechazado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Licencia de Conducir</label>
              <input
                type="text"
                name="licenciaConducir"
                placeholder="Ej: B1 o NO_POSEE"
                value={formData.licenciaConducir}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                placeholder="Calle y altura"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Puntos de Referencia Domicilio</label>
              <input
                type="text"
                name="puntosReferenciaDomicilio"
                placeholder="Ej: Frente a plaza principal"
                value={formData.puntosReferenciaDomicilio}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* CUD Discapacidad Toggle */}
        <div style={{
          marginTop: '24px',
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))'
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                name="cudDiscapacidad"
                checked={formData.cudDiscapacidad}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Posee Certificado de Discapacidad (CUD)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <input
                type="checkbox"
                name="movilidadPropia"
                checked={formData.movilidadPropia}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Movilidad Propia
            </label>
          </div>

          {formData.cudDiscapacidad && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed hsl(var(--border))',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div className="form-group">
                <label>Tipo de Discapacidad</label>
                <input
                  type="text"
                  name="tipoDiscapacidad"
                  placeholder="Ej: Motriz, Auditiva"
                  value={formData.tipoDiscapacidad}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Vencimiento CUD</label>
                <input
                  type="date"
                  name="cudVencimiento"
                  value={formData.cudVencimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

  {/* SECTION 1.5: RUBROS DE BÚSQUEDA */}
  <div style={{
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid hsl(var(--border))',
    boxShadow: 'var(--shadow)',
    padding: '32px',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: 'linear-gradient(90deg, #10b981, #059669)'
    }}></div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <div style={{ width: '8px', height: '24px', borderRadius: '4px', backgroundColor: '#10b981' }}></div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rubros de Búsqueda</h3>
    </div>

    <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
      Selecciona las categorías laborales o rubros de interés para este postulante. Puedes seleccionar múltiples rubros.
    </p>

    {availableRubros.length === 0 ? (
      <div style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic', fontSize: '14px' }}>
        No hay rubros de búsqueda cargados en el sistema. Puedes agregarlos desde el listado principal.
      </div>
    ) : (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {availableRubros.map((rubro) => {
          const isSelected = (formData.rubros || []).some(r => r.id === rubro.id);
          return (
            <button
              key={rubro.id}
              type="button"
              onClick={() => handleToggleRubro(rubro)}
              style={{
                padding: '10px 18px',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#ecfdf5' : 'white',
                color: isSelected ? '#047857' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isSelected ? '0 2px 4px rgba(16, 185, 129, 0.1)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <Plus size={14} style={{
                transform: isSelected ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.2s ease',
                color: isSelected ? '#10b981' : '#94a3b8'
              }} />
              {rubro.nombre}
            </button>
          );
        })}
      </div>
    )}
  </div>

      {/* SECTION 2: EXPERIENCIA LABORAL */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow)',
        padding: '32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #f59e0b, #d97706)'
        }}></div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '24px', borderRadius: '4px', backgroundColor: '#f59e0b' }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experiencia Laboral</h3>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddExperience}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#d97706',
              borderColor: '#f59e0b / 0.5',
              borderRadius: '8px'
            }}
          >
            <Plus size={16} />
            AGREGAR EMPLEO
          </button>
        </div>

        {formData.experienciasLaborales.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'hsl(var(--text-muted))',
            fontSize: '14px',
            fontStyle: 'italic',
            border: '2px dashed hsl(var(--border))',
            borderRadius: '12px'
          }}>
            Haz clic en "Agregar Empleo" para cargar tu trayectoria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {formData.experienciasLaborales.map((exp, idx) => (
              <div 
                key={idx} 
                className="fade-in"
                style={{
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#fafbfc',
                  position: 'relative'
                }}
              >
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--text-muted))',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRemoveExperience(idx)}
                >
                  <Trash2 size={16} />
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginRight: '32px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Empresa</label>
                    <input
                      type="text"
                      placeholder="Nombre de la empresa"
                      value={exp.empresa}
                      onChange={(e) => handleExperienceChange(idx, 'empresa', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Puesto</label>
                    <input
                      type="text"
                      placeholder="Puesto ocupado"
                      value={exp.puesto}
                      onChange={(e) => handleExperienceChange(idx, 'puesto', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      value={exp.fechaInicio}
                      onChange={(e) => handleExperienceChange(idx, 'fechaInicio', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Fecha de Fin</label>
                    <input
                      type="date"
                      value={exp.fechaFin || ''}
                      onChange={(e) => handleExperienceChange(idx, 'fechaFin', e.target.value)}
                      disabled={exp.currentlyWorking}
                      required={!exp.currentlyWorking}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) => handleExperienceChange(idx, 'currentlyWorking', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Actualmente trabajando aquí
                  </label>
                </div>

                <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                  <label>Tareas Realizadas</label>
                  <textarea
                    placeholder="Describe brevemente tus funciones..."
                    value={exp.tareasRealizadas}
                    onChange={(e) => handleExperienceChange(idx, 'tareasRealizadas', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: FORMACIÓN ACADÉMICA */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow)',
        padding: '32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #10b981, #059669)'
        }}></div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '24px', borderRadius: '4px', backgroundColor: '#10b981' }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Formación Académica</h3>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddEducation}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#059669',
              borderColor: '#10b981 / 0.5',
              borderRadius: '8px'
            }}
          >
            <Plus size={16} />
            AGREGAR ESTUDIO
          </button>
        </div>

        {formData.educaciones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'hsl(var(--text-muted))',
            fontSize: '14px',
            fontStyle: 'italic',
            border: '2px dashed hsl(var(--border))',
            borderRadius: '12px'
          }}>
            Haz clic en "Agregar Estudio" para registrar tu formación.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {formData.educaciones.map((edu, idx) => (
              <div 
                key={idx} 
                className="fade-in"
                style={{
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#fafbfc',
                  position: 'relative'
                }}
              >
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--text-muted))',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRemoveEducation(idx)}
                >
                  <Trash2 size={16} />
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginRight: '32px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nivel Alcanzado</label>
                    <select
                      value={edu.nivelAlcanzado}
                      onChange={(e) => handleEducationChange(idx, 'nivelAlcanzado', e.target.value)}
                    >
                      <option value="Primario Completo">Primario Completo</option>
                      <option value="Secundario">Secundario</option>
                      <option value="Terciario">Terciario</option>
                      <option value="Universitario">Universitario</option>
                      <option value="Posgrado">Posgrado</option>
                      <option value="Curso / Capacitación">Curso / Capacitación</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Título Obtenido</label>
                    <input
                      type="text"
                      placeholder="Ej: Lic. en Administración de Empresas"
                      value={edu.tituloObtenido}
                      onChange={(e) => handleEducationChange(idx, 'tituloObtenido', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Institución</label>
                    <input
                      type="text"
                      placeholder="Ej: Universidad Tecnológica Nacional"
                      value={edu.institucion}
                      onChange={(e) => handleEducationChange(idx, 'institucion', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Año Último Aprobado / Finalización</label>
                    <input
                      type="number"
                      placeholder="Ej: 2018"
                      value={edu.anioUltimoAprobado || ''}
                      onChange={(e) => handleEducationChange(idx, 'anioUltimoAprobado', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={edu.finalizado}
                      onChange={(e) => handleEducationChange(idx, 'finalizado', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Estudio Finalizado
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: HABILIDADES Y LICENCIAS */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow)',
        padding: '32px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)'
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '8px', height: '24px', borderRadius: '4px', backgroundColor: '#8b5cf6' }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habilidades y Licencias</h3>
        </div>

        <div className="form-group">
          <label>Ingresa Habilidades (Presiona Enter)</label>
          <input
            type="text"
            placeholder="Ej: Excel Avanzado, SAP, Liderazgo, Carpintería"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
          />
        </div>

        {/* Skill tags container */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '16px'
        }}>
          {skills.length === 0 ? (
            <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
              No se han agregado habilidades aún.
            </span>
          ) : (
            skills.map((tag, idx) => (
              <span 
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'hsl(var(--primary) / 0.08)',
                  color: 'hsl(var(--primary))',
                  border: '1px solid hsl(var(--primary) / 0.15)',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                {tag}
                <X 
                  size={14} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveSkill(tag)}
                />
              </span>
            ))
          )}
        </div>
      </div>

      {/* SECTION 5: SITUACIÓN FISCAL, SOCIAL Y PREFERENCIA LABORAL */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow)',
        padding: '32px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #10b981, #059669)'
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '8px', height: '24px', borderRadius: '4px', backgroundColor: '#10b981' }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Situación Fiscal, Social y Preferencia Laboral
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="form-group">
            <label>Tipo de Empleo Buscado</label>
            <select 
              name="tipoEmpleoBuscado" 
              value={formData.tipoEmpleoBuscado} 
              onChange={handleChange}
            >
              <option value="Cualquiera">Cualquiera / Indiferente</option>
              <option value="Full-time">Tiempo Completo (Full-time)</option>
              <option value="Part-time">Medio Tiempo (Part-time)</option>
              <option value="Temporal">Temporal / Por temporada</option>
              <option value="Profesional independiente">Profesional Independiente (Freelance)</option>
            </select>
          </div>

          <div className="form-group">
            <label>¿Cuenta con Obra Social / Cobertura Médica?</label>
            <select 
              name="tieneObraSocial" 
              value={formData.tieneObraSocial ? "true" : "false"} 
              onChange={(e) => {
                const val = e.target.value === "true";
                setFormData(prev => ({ ...prev, tieneObraSocial: val }));
              }}
            >
              <option value="false">No posee cobertura</option>
              <option value="true">Sí posee Obra Social</option>
            </select>
          </div>

          <div className="form-group">
            <label>Plan Social Activo (Si percibe alguno)</label>
            <input 
              type="text" 
              name="planSocialActivo" 
              placeholder="Ej: Potenciar Trabajo, Tarjeta Alimentar, Ninguno"
              value={formData.planSocialActivo || ''} 
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{
          borderTop: '1px solid hsl(var(--border))',
          paddingTop: '24px',
          marginTop: '24px'
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '16px' }}>
            Situación Fiscal y Habilitaciones (Útil para Emprendedores y Autónomos)
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
              <input 
                type="checkbox" 
                name="situacionMonotributo" 
                checked={formData.situacionMonotributo} 
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              ¿Monotributista?
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
              <input 
                type="checkbox" 
                name="situacionResponsableInscripto" 
                checked={formData.situacionResponsableInscripto} 
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              ¿Responsable Inscripto?
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
              <input 
                type="checkbox" 
                name="situacionAter" 
                checked={formData.situacionAter} 
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              ¿Inscripto en ATER?
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
              <input 
                type="checkbox" 
                name="situacionHabilitacionMunicipal" 
                checked={formData.situacionHabilitacionMunicipal} 
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              ¿Tiene Habilitación Municipal?
            </label>
          </div>

          <div className="form-group" style={{ maxWidth: '500px', marginTop: '16px' }}>
            <label>Registro / Habilitación Específica (Si aplica)</label>
            <input 
              type="text" 
              name="situacionRegistroEspecifico" 
              placeholder="Ej: Carnet manipulador de alimentos, Registro de conducir profesional..."
              value={formData.situacionRegistroEspecifico || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
