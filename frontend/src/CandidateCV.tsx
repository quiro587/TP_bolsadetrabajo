import { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, Printer, MapPin, User, Edit, Save, X, Plus, Trash2, 
  ChevronDown, ChevronUp, Image as ImageIcon, Sparkles, Download
} from 'lucide-react';

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
  const [editData, setEditData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rubrosList, setRubrosList] = useState<Rubro[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');
  const [newSkill, setNewSkill] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch candidate data on load
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
        setEditData(JSON.parse(JSON.stringify(data))); // Deep copy
      } catch (err: any) {
        window.showToast(err.message || 'Error de conexión.', 'error');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  // Fetch rubros list when editing
  useEffect(() => {
    if (isEditing && rubrosList.length === 0) {
      fetch('http://localhost:8080/api/rubros', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setRubrosList(data))
      .catch(err => console.error("Error al cargar rubros:", err));
    }
  }, [isEditing]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.showToast("Sugerencia: Selecciona 'Guardar como PDF' en la ventana de impresión.", "info");
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      // Clean up fields to match backend expectations
      const cleanData = {
        ...editData,
        experienciasLaborales: editData.experienciasLaborales.map(exp => ({
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
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar cambios.');
      }

      const updatedCandidate = await response.json();
      setCandidate(updatedCandidate);
      setEditData(JSON.parse(JSON.stringify(updatedCandidate)));
      setIsEditing(false);
      window.showToast('Currículum actualizado con éxito.', 'success');
    } catch (err: any) {
      window.showToast(err.message || 'Error al guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (candidate) {
      setEditData(JSON.parse(JSON.stringify(candidate)));
    }
    setIsEditing(false);
  };

  const getSkillsArray = (data: CandidateData | null) => {
    if (!data?.habilidades) return [];
    return data.habilidades.split(',').map(s => s.trim()).filter(Boolean);
  };

  const formatYearRange = (exp: WorkExperience) => {
    if (exp.currentlyWorking) {
      return '2020 - ACTUALIDAD';
    }
    const start = exp.fechaInicio ? exp.fechaInicio.substring(0, 4) : '';
    const end = exp.fechaFin ? exp.fechaFin.substring(0, 4) : '';
    return start || end ? `${start} - ${end}` : 'S/F';
  };

  const formatEduYear = (edu: Education) => {
    return edu.anioUltimoAprobado || (edu.finalizado ? 'EGRESADO' : 'CURSANDO');
  };

  // Photo helpers
  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editData) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setEditData({ ...editData, foto: compressedBase64 });
          } else {
            setEditData({ ...editData, foto: event.target?.result as string });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    if (editData) {
      setEditData({ ...editData, foto: '' });
    }
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (!editData) return;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditData({ ...editData, [name]: checked });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (!newSkill.trim() || !editData) return;
    const current = getSkillsArray(editData);
    if (!current.includes(newSkill.trim())) {
      const updated = [...current, newSkill.trim()];
      setEditData({ ...editData, habilidades: updated.join(', ') });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!editData) return;
    const current = getSkillsArray(editData);
    const updated = current.filter(s => s !== skillToRemove);
    setEditData({ ...editData, habilidades: updated.join(', ') });
  };

  // Experience handlers
  const handleAddExperience = () => {
    if (!editData) return;
    const newExp: WorkExperience = {
      empresa: '',
      puesto: '',
      fechaInicio: new Date().getFullYear().toString(),
      fechaFin: '',
      currentlyWorking: false,
      tareasRealizadas: ''
    };
    setEditData({
      ...editData,
      experienciasLaborales: [...editData.experienciasLaborales, newExp]
    });
  };

  const handleRemoveExperience = (index: number) => {
    if (!editData) return;
    const updated = editData.experienciasLaborales.filter((_, i) => i !== index);
    setEditData({ ...editData, experienciasLaborales: updated });
  };

  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    if (!editData) return;
    const updated = editData.experienciasLaborales.map((exp, i) => {
      if (i === index) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    setEditData({ ...editData, experienciasLaborales: updated });
  };

  // Education handlers
  const handleAddEducation = () => {
    if (!editData) return;
    const newEdu: Education = {
      nivelAlcanzado: 'Secundario',
      tituloObtenido: '',
      institucion: '',
      finalizado: true,
      anioUltimoAprobado: new Date().getFullYear()
    };
    setEditData({
      ...editData,
      educaciones: [...editData.educaciones, newEdu]
    });
  };

  const handleRemoveEducation = (index: number) => {
    if (!editData) return;
    const updated = editData.educaciones.filter((_, i) => i !== index);
    setEditData({ ...editData, educaciones: updated });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    if (!editData) return;
    const updated = editData.educaciones.map((edu, i) => {
      if (i === index) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    setEditData({ ...editData, educaciones: updated });
  };

  // Rubros handlers
  const handleRubroToggle = (rubro: Rubro) => {
    if (!editData) return;
    const currentRubros = editData.rubros || [];
    const exists = currentRubros.some(r => r.id === rubro.id);
    let updatedRubros;
    if (exists) {
      updatedRubros = currentRubros.filter(r => r.id !== rubro.id);
    } else {
      updatedRubros = [...currentRubros, rubro];
    }
    setEditData({ ...editData, rubros: updatedRubros });
  };

  // Toggle Accordion section
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading || !candidate) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid hsl(var(--primary) / 0.1)', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%' }}></div>
        <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Cargando Currículum Vitae...</span>
      </div>
    );
  }

  const displayData = isEditing ? (editData || candidate) : candidate;

  // Render CV Sheet layout (reused in both modes)
  const renderCVSheet = () => (
    <div className="cv-print-layout" style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: isEditing ? '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' : 'var(--shadow-lg)',
      overflow: 'hidden',
      minHeight: '1050px',
      border: '1px solid hsl(var(--border))',
      padding: '48px 40px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* SJ Ciudad Logo Top Right */}
      <div style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '16px', fontWeight: 800 }}>
        <span style={{ color: '#00b4d8' }}>SJ</span> Ciudad
      </div>

      {/* HEADER SECTION (Centered Name & Photo) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
        {/* Profile Photo */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
          border: '2px solid #e2e8f0',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          {displayData.foto ? (
            <img src={displayData.foto} alt={`${displayData.nombre} ${displayData.apellido}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={48} style={{ color: '#cbd5e1' }} />
          )}
        </div>

        {/* Full Name */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0f172a',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0
        }}>
          {displayData.nombre} {displayData.apellido}
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
          <span>{displayData.cvUrl || 'Postulante'}</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} />
            {displayData.direccion || 'San José, Entre Ríos'}
          </span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span>{displayData.telefonoPrimario}</span>
        </div>
      </div>

      {/* TWO-COLUMN GRID LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '32px',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '24px'
      }}>
        {/* LEFT Narrow Column (Details & Competencies) */}
        <div style={{
          borderRight: '1px solid #e2e8f0',
          paddingRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}>
          {/* DETALLES */}
          <div>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#475569',
              textAlign: 'center',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>o</span> DETALLES <span style={{ fontSize: '9px', color: '#94a3b8' }}>o</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: '#475569' }}>
              {displayData.email && (
                <div style={{ textAlign: 'center', wordBreak: 'break-all' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                  <span>{displayData.email}</span>
                </div>
              )}
              {displayData.telefonoSecundario && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teléfono Secundario</span>
                  <span>{displayData.telefonoSecundario}</span>
                </div>
              )}
              {displayData.puntosReferenciaDomicilio && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ref. Dirección</span>
                  <span>{displayData.puntosReferenciaDomicilio}</span>
                </div>
              )}
              {displayData.fechaNacimiento && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha de Nacimiento</span>
                  <span>{displayData.fechaNacimiento.substring(0, 10).split('-').reverse().join('/')}</span>
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documentos</span>
                <span>DNI: {displayData.dni}</span>
                {displayData.cuil && <span style={{ display: 'block', fontSize: '11px' }}>CUIL: {displayData.cuil}</span>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Datos Personales</span>
                <span>Género: {displayData.genero}</span>
                <span style={{ display: 'block' }}>E. Civil: {displayData.estadoCivil || 'No especificado'}</span>
                <span style={{ display: 'block' }}>Hijos a cargo: {displayData.hijosACargo || 0}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Licencia y Movilidad</span>
                <span>Movilidad propia: {displayData.movilidadPropia ? 'Sí' : 'No'}</span>
                <span style={{ display: 'block' }}>
                  Licencia: {
                    !displayData.licenciaConducir || displayData.licenciaConducir === 'NO_POSEE'
                      ? 'No posee'
                      : displayData.licenciaConducir
                  }
                </span>
              </div>
              {(displayData.tieneObraSocial || displayData.planSocialActivo) && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seguridad Social</span>
                  <span>Obra social: {displayData.tieneObraSocial ? 'Sí posee' : 'No posee'}</span>
                  {displayData.planSocialActivo && <span style={{ display: 'block' }}>Plan: {displayData.planSocialActivo}</span>}
                </div>
              )}
              {(displayData.situacionMonotributo || displayData.situacionResponsableInscripto || displayData.situacionAter || displayData.situacionHabilitacionMunicipal || displayData.situacionRegistroEspecifico) && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habilitaciones</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', fontSize: '10px' }}>
                    {displayData.situacionMonotributo && <span>• Monotributista</span>}
                    {displayData.situacionResponsableInscripto && <span>• Responsable Inscripto</span>}
                    {displayData.situacionAter && <span>• Registro ATER</span>}
                    {displayData.situacionHabilitacionMunicipal && <span>• Habilitación Municipal</span>}
                    {displayData.situacionRegistroEspecifico && <span>• {displayData.situacionRegistroEspecifico}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COMPETENCIAS */}
          {getSkillsArray(displayData).length > 0 && (
            <div>
              <h4 style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#475569',
                textAlign: 'center',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>o</span> COMPETENCIAS <span style={{ fontSize: '9px', color: '#94a3b8' }}>o</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {getSkillsArray(displayData).map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      textAlign: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#475569',
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
          {displayData.rubros && displayData.rubros.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#475569',
                textAlign: 'center',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>o</span> INTERESES <span style={{ fontSize: '9px', color: '#94a3b8' }}>o</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {displayData.rubros.map((rubro) => (
                  <div
                    key={rubro.id}
                    style={{
                      textAlign: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '12px',
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
          gap: '28px'
        }}>
          {/* PERFIL */}
          {displayData.observacionesGenerales && displayData.observacionesGenerales.trim() && (
            <div>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: '#0f172a',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                PERFIL
              </h4>
              <div style={{
                borderLeft: '2px solid #cbd5e1',
                paddingLeft: '14px',
                fontSize: '13px',
                color: '#475569',
                lineHeight: 1.5,
                textAlign: 'justify'
              }}>
                {displayData.observacionesGenerales.replace(/^Perfil original Excel:\s*/gi, '')}
              </div>
            </div>
          )}

          {/* EXPERIENCIA LABORAL */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: '#0f172a',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              EXPERIENCIA LABORAL
            </h4>

            {displayData.experienciasLaborales.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginLeft: '8px' }}>Sin experiencia laboral previa registrada.</p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderLeft: '2px solid #e2e8f0',
                paddingLeft: '20px',
                marginLeft: '6px'
              }}>
                {displayData.experienciasLaborales.map((exp, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Circle Timeline Bullet */}
                    <div style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: '2px solid #475569',
                      boxShadow: '0 0 0 3px white'
                    }}></div>

                    {/* Header details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
                        {exp.puesto}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        {formatYearRange(exp)}
                      </span>
                    </div>

                    {/* Subtitle details */}
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginTop: '1px' }}>
                      {exp.empresa}
                    </div>

                    {/* Job tasks / description */}
                    {exp.tareasRealizadas && (
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '6px',
                        lineHeight: 1.5,
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
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: '#0f172a',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              EDUCACIÓN
            </h4>

            {displayData.educaciones.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginLeft: '8px' }}>Sin registros de formación académica.</p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderLeft: '2px solid #e2e8f0',
                paddingLeft: '20px',
                marginLeft: '6px'
              }}>
                {displayData.educaciones.map((edu, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Circle Timeline Bullet */}
                    <div style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: '2px solid #475569',
                      boxShadow: '0 0 0 3px white'
                    }}></div>

                    {/* Header details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
                        {edu.tituloObtenido || edu.nivelAlcanzado}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        {formatEduYear(edu)}
                      </span>
                    </div>

                    {/* Subtitle details */}
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginTop: '1px' }}>
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
  );

  // Normal view mode
  if (!isEditing) {
    return (
      <div className="fade-in" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
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
              padding: '10px 20px',
              borderRadius: '10px',
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

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'white',
                border: '1px solid hsl(var(--border))'
              }}
            >
              <Edit size={16} />
              Editar CV
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn-secondary"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'white',
                border: '1px solid hsl(var(--border))'
              }}
            >
              <Download size={16} />
              Descargar PDF
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Printer size={16} />
              Imprimir
            </button>
          </div>
        </div>

        {/* Render A4 CV Paper Sheet */}
        {renderCVSheet()}
      </div>
    );
  }

  // Split Screen Editor mode
  return (
    <div className="fade-in no-print" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 70px)', 
      margin: '-40px', // Counteract App.tsx main padding
      overflow: 'hidden'
    }}>
      {/* Editor Header */}
      <div style={{
        height: '60px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'hsl(var(--primary))' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Editor de Currículum: {candidate.nombre} {candidate.apellido}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCancel}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={14} />
            Cancelar
          </button>

          <button
            onClick={handleDownloadPDF}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0'
            }}
          >
            <Download size={14} />
            Descargar PDF
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0'
            }}
          >
            <Printer size={14} />
            Imprimir
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {saving ? (
              <span className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Editor Body (Split pane) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Pane (Scrollable editor sidebar) */}
        <div style={{
          width: '460px',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flexShrink: 0
        }}>
          {/* ACCORDION SECTIONS */}

          {/* 1. INFORMACIÓN PERSONAL */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('personal')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#334155',
                fontSize: '14px'
              }}
            >
              <span>INFORMACIÓN PERSONAL</span>
              {expandedSection === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === 'personal' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #e2e8f0' }}>
                {/* Photo upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>FOTO DE PERFIL</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                      {editData?.foto ? <img src={editData.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} style={{ color: '#94a3b8' }} />}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={triggerPhotoUpload} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}>
                        Seleccionar Foto
                      </button>
                      {editData?.foto && (
                        <button type="button" onClick={removePhoto} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', color: '#ef4444', borderColor: '#fecaca' }}>
                          Eliminar
                        </button>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>NOMBRE</label>
                    <input type="text" name="nombre" value={editData?.nombre || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>APELLIDO</label>
                    <input type="text" name="apellido" value={editData?.apellido || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>TÍTULO PROFESIONAL / OFICIO</label>
                  <input type="text" name="cvUrl" value={editData?.cvUrl || ''} onChange={handleInputChange} placeholder="Ej: Administrativa / Electricista" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>DNI</label>
                    <input type="text" name="dni" value={editData?.dni || ''} disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc', color: '#64748b' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>CUIL</label>
                    <input type="text" name="cuil" value={editData?.cuil || ''} disabled style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc', color: '#64748b' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>EMAIL</label>
                    <input type="email" name="email" value={editData?.email || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>TELÉFONO PRIMARIO</label>
                    <input type="text" name="telefonoPrimario" value={editData?.telefonoPrimario || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>TELÉFONO SECUNDARIO</label>
                    <input type="text" name="telefonoSecundario" value={editData?.telefonoSecundario || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>DIRECCIÓN</label>
                    <input type="text" name="direccion" value={editData?.direccion || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>FECHA DE NACIMIENTO</label>
                    <input type="date" name="fechaNacimiento" value={editData?.fechaNacimiento ? editData.fechaNacimiento.substring(0, 10) : ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>GÉNERO</label>
                    <select name="genero" value={editData?.genero || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>ESTADO CIVIL</label>
                    <select name="estadoCivil" value={editData?.estadoCivil || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                      <option value="">No especificado</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Unión de hecho">Unión de hecho</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>HIJOS A CARGO</label>
                    <input type="number" name="hijosACargo" value={editData?.hijosACargo || 0} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. PERFIL PROFESIONAL */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('perfil')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#334155',
                fontSize: '14px'
              }}
            >
              <span>PERFIL PROFESIONAL</span>
              {expandedSection === 'perfil' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === 'perfil' && (
              <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>RESUMEN / OBSERVACIONES GENERALES</label>
                <textarea
                  name="observacionesGenerales"
                  rows={6}
                  value={editData?.observacionesGenerales || ''}
                  onChange={handleInputChange}
                  placeholder="Describe tu perfil laboral, fortalezas, y objetivos profesionales..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>
            )}
          </div>

          {/* 3. EXPERIENCIA LABORAL */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('experiencia')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#334155',
                fontSize: '14px'
              }}
            >
              <span>EXPERIENCIA LABORAL ({editData?.experienciasLaborales.length || 0})</span>
              {expandedSection === 'experiencia' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === 'experiencia' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #e2e8f0' }}>
                {editData?.experienciasLaborales.map((exp, idx) => (
                  <div key={idx} style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Eliminar experiencia"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>FORMACIÓN LABORAL #{idx + 1}</span>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>EMPRESA</label>
                      <input type="text" value={exp.empresa} onChange={(e) => handleExperienceChange(idx, 'empresa', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>PUESTO / ROL</label>
                      <input type="text" value={exp.puesto} onChange={(e) => handleExperienceChange(idx, 'puesto', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>AÑO INICIO</label>
                        <input type="text" placeholder="Ej: 2021" value={exp.fechaInicio} onChange={(e) => handleExperienceChange(idx, 'fechaInicio', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>AÑO FIN</label>
                        <input type="text" placeholder="Ej: 2023" value={exp.fechaFin || ''} disabled={exp.currentlyWorking} onChange={(e) => handleExperienceChange(idx, 'fechaFin', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: exp.currentlyWorking ? '1px solid #e2e8f0' : '1px solid #cbd5e1', fontSize: '12px', backgroundColor: exp.currentlyWorking ? '#f1f5f9' : 'white' }} />
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', cursor: 'pointer', marginTop: '2px' }}>
                      <input type="checkbox" checked={exp.currentlyWorking} onChange={(e) => handleExperienceChange(idx, 'currentlyWorking', e.target.checked)} />
                      Actualmente trabajo aquí
                    </label>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>TAREAS REALIZADAS</label>
                      <textarea rows={3} value={exp.tareasRealizadas} onChange={(e) => handleExperienceChange(idx, 'tareasRealizadas', e.target.value)} placeholder="Breve detalle de tareas..." style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', resize: 'vertical' }} />
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={handleAddExperience} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', fontSize: '13px', borderStyle: 'dashed', borderColor: '#3b82f6', color: '#2563eb' }}>
                  <Plus size={16} />
                  Añadir Experiencia
                </button>
              </div>
            )}
          </div>

          {/* 4. FORMACIÓN ACADÉMICA */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('educacion')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#334155',
                fontSize: '14px'
              }}
            >
              <span>FORMACIÓN ACADÉMICA ({editData?.educaciones.length || 0})</span>
              {expandedSection === 'educacion' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === 'educacion' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #e2e8f0' }}>
                {editData?.educaciones.map((edu, idx) => (
                  <div key={idx} style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Eliminar educación"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>FORMACIÓN ACADÉMICA #{idx + 1}</span>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>INSTITUCIÓN</label>
                      <input type="text" value={edu.institucion} onChange={(e) => handleEducationChange(idx, 'institucion', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>TÍTULO / CERTIFICADO</label>
                      <input type="text" value={edu.tituloObtenido} onChange={(e) => handleEducationChange(idx, 'tituloObtenido', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>NIVEL</label>
                        <select value={edu.nivelAlcanzado} onChange={(e) => handleEducationChange(idx, 'nivelAlcanzado', e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: 'white' }}>
                          <option value="Primario">Primario</option>
                          <option value="Secundario">Secundario</option>
                          <option value="Terciario">Terciario</option>
                          <option value="Universitario">Universitario</option>
                          <option value="Posgrado">Posgrado</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>AÑO DE EGRESO</label>
                        <input type="number" placeholder="Ej: 2018" value={edu.anioUltimoAprobado || ''} onChange={(e) => handleEducationChange(idx, 'anioUltimoAprobado', e.target.value ? parseInt(e.target.value) : undefined)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', cursor: 'pointer', marginTop: '2px' }}>
                      <input type="checkbox" checked={edu.finalizado} onChange={(e) => handleEducationChange(idx, 'finalizado', e.target.checked)} />
                      Nivel finalizado completo
                    </label>
                  </div>
                ))}
                
                <button type="button" onClick={handleAddEducation} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', fontSize: '13px', borderStyle: 'dashed', borderColor: '#3b82f6', color: '#2563eb' }}>
                  <Plus size={16} />
                  Añadir Educación
                </button>
              </div>
            )}
          </div>

          {/* 5. HABILIDADES Y COMPETENCIAS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('habilidades')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#334155',
                fontSize: '14px'
              }}
            >
              <span>HABILIDADES Y COMPETENCIAS</span>
              {expandedSection === 'habilidades' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === 'habilidades' && (
              <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Escribe una habilidad (por ejemplo, "Atención al cliente", "Manejo de caja", "Ventas") y pulsa Enter o Añadir.</p>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Escribe y pulsa Enter..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <button type="button" onClick={handleAddSkill} className="btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    Añadir
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {getSkillsArray(editData).map((skill, idx) => (
                    <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ border: 'none', background: 'none', color: '#94a3b8', display: 'inline-flex', cursor: 'pointer', padding: 0 }} title="Remover">
                        <X size={12} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  ))}
                  {getSkillsArray(editData).length === 0 && (
                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>Sin habilidades agregadas aún.</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 6. OTROS DATOS / HABILITACIONES */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleSection('adicionales')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#334155',
                fontSize: '14px'
              }}
            >
              <span>MÁS DATOS E INTERESES</span>
              {expandedSection === 'adicionales' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === 'adicionales' && (
              <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Rubros de Interés */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>RUBROS DE INTERÉS</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    {rubrosList.map(rubro => {
                      const isSelected = editData?.rubros?.some(r => r.id === rubro.id);
                      return (
                        <label key={rubro.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer', padding: '4px 0' }}>
                          <input type="checkbox" checked={!!isSelected} onChange={() => handleRubroToggle(rubro)} />
                          {rubro.nombre}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" name="movilidadPropia" checked={!!editData?.movilidadPropia} onChange={handleInputChange} />
                    Posee movilidad propia
                  </label>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>CATEGORÍA LICENCIA CONDUCIR</label>
                    <input type="text" name="licenciaConducir" value={editData?.licenciaConducir || ''} placeholder="Ej: B1 / NO_POSEE" onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" name="cudDiscapacidad" checked={!!editData?.cudDiscapacidad} onChange={handleInputChange} />
                    Posee Certificado CUD (Discapacidad)
                  </label>

                  {editData?.cudDiscapacidad && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>TIPO DE DISCAPACIDAD</label>
                      <input type="text" name="tipoDiscapacidad" value={editData?.tipoDiscapacidad || ''} onChange={handleInputChange} placeholder="Detalle del CUD..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" name="tieneObraSocial" checked={!!editData?.tieneObraSocial} onChange={handleInputChange} />
                    Posee cobertura de Obra Social
                  </label>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>PLAN SOCIAL ACTIVO (OPCIONAL)</label>
                    <input type="text" name="planSocialActivo" value={editData?.planSocialActivo || ''} onChange={handleInputChange} placeholder="Ej: Tarjeta Alimentar..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>SITUACIÓN IMPOSITIVA / HABILITACIONES</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                      <input type="checkbox" name="situacionMonotributo" checked={!!editData?.situacionMonotributo} onChange={handleInputChange} />
                      Monotributista activo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                      <input type="checkbox" name="situacionResponsableInscripto" checked={!!editData?.situacionResponsableInscripto} onChange={handleInputChange} />
                      Responsable Inscripto
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                      <input type="checkbox" name="situacionAter" checked={!!editData?.situacionAter} onChange={handleInputChange} />
                      Registro ATER
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                      <input type="checkbox" name="situacionHabilitacionMunicipal" checked={!!editData?.situacionHabilitacionMunicipal} onChange={handleInputChange} />
                      Habilitación Municipal
                    </label>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>OTRO REGISTRO ESPECÍFICO</label>
                      <input type="text" name="situacionRegistroEspecifico" value={editData?.situacionRegistroEspecifico || ''} onChange={handleInputChange} placeholder="Ej: Carnet manipulador alimentos..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane (Live preview area) */}
        <div style={{
          flex: 1,
          backgroundColor: '#f1f5f9',
          overflowY: 'auto',
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', display: 'block' }}>
              VISTA PREVIA EN TIEMPO REAL
            </span>
            {renderCVSheet()}
          </div>
        </div>
      </div>
    </div>
  );
}
