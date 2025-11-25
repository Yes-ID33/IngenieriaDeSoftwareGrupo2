import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const MAX = {
  NOMBRE_PERFIL: 60,
  DESCRIPCION: 255,
  HABIL_ITEM: 60,
  EXPERIENCIA: 255,
  EDUCACION: 200
};

const parseHabilidades = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean);
    } catch { /* not JSON */ }
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const Hojas = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre_perfil: '',
    descripcion: '',
    habilidades: '',
    experiencia: '',
    educacion: '',
    es_principal: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const generarPdfDoc = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    let y = 40;
    doc.setFontSize(20);
    doc.text(form.nombre_perfil || 'Hoja de Vida', 40, y);
    y += 28;

    const writeSection = (title, text) => {
      doc.setFont(undefined, 'bold');
      doc.text(title, 40, y);
      doc.setFont(undefined, 'normal');
      y += 14;
      const lines = doc.splitTextToSize(text || '-', 500);
      doc.text(lines, 40, y);
      y += (lines.length * 14) + 18;
      if (y > 720) { doc.addPage(); y = 40; }
    };

    writeSection('Descripción', form.descripcion);
    writeSection('Habilidades', parseHabilidades(form.habilidades).join(', '));
    writeSection('Experiencia', form.experiencia);
    writeSection('Educación', form.educacion);
    return doc;
  };

  const generarPdfBlob = () => generarPdfDoc().output('blob');

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const validateLengths = ({ nombre_perfil, descripcion, experiencia, educacion, habilidadesArr }) => {
    const problems = [];
    if (!nombre_perfil || !nombre_perfil.trim()) problems.push('Nombre del perfil obligatorio.');
    if (nombre_perfil && nombre_perfil.length > MAX.NOMBRE_PERFIL) problems.push(`Nombre muy largo (max ${MAX.NOMBRE_PERFIL} caracteres).`);
    if (descripcion && descripcion.length > MAX.DESCRIPCION) problems.push(`Descripción muy larga (max ${MAX.DESCRIPCION}).`);
    if (experiencia && experiencia.length > MAX.EXPERIENCIA) problems.push(`Experiencia muy larga (max ${MAX.EXPERIENCIA}).`);
    if (educacion && educacion.length > MAX.EDUCACION) problems.push(`Educación muy larga (max ${MAX.EDUCACION}).`);
    habilidadesArr.forEach(h => { if (h.length > MAX.HABIL_ITEM) problems.push(`Habilidad "${h}" demasiado larga (max ${MAX.HABIL_ITEM}).`); });
    return problems;
  };

  // Generar PDF, descargar y guardar datos en servidor (sin URL)
  const handleGenerateAndSave = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);

    const habilidadesArr = parseHabilidades(form.habilidades);
    const problems = validateLengths({
      nombre_perfil: form.nombre_perfil,
      descripcion: form.descripcion,
      experiencia: form.experiencia,
      educacion: form.educacion,
      habilidadesArr
    });

    if (problems.length) {
      setLoading(false);
      setError(problems.join(' '));
      return;
    }

    try {
      // 1) Generar y descargar PDF localmente
      const blob = generarPdfBlob();
      const filename = (form.nombre_perfil || 'hoja-de-vida').replace(/\s+/g, '-') + '.pdf';
      triggerDownload(blob, filename);

      // 2) Guardar metadatos en el servidor (sin archivo ni URL)
      const payload = {
        nombre_perfil: form.nombre_perfil,
        descripcion: form.descripcion,
        habilidades: habilidadesArr,
        experiencia: form.experiencia,
        educacion: form.educacion,
        es_principal: form.es_principal
      };

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No autenticado. Inicia sesión para guardar en el servidor.');
        setLoading(false);
        return;
      }

      const apiBase = process.env.REACT_APP_API_URL ?? 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/estudiantes/hojas-vida`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        // mostrar mensaje de servidor pero no revertir la descarga
        setError(data?.message || 'Error guardando en servidor');
        setLoading(false);
        return;
      }

      // éxito
      setLoading(false);
      alert('Hoja generada y guardada en el servidor correctamente.');
      navigate('/mis-hojas'); // opcional, ajustar ruta
    } catch (err) {
      setError(err.message || 'Error generando/guardando');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: 12 }}>
      <h2>Crear Hoja de Vida</h2>

      <form onSubmit={handleGenerateAndSave}>
        <div>
          <label>Nombre del perfil *</label><br />
          <input
            name="nombre_perfil"
            value={form.nombre_perfil}
            onChange={handleChange}
            maxLength={MAX.NOMBRE_PERFIL}
            style={{ width: 360 }}
            required
          />
        </div>

        <div>
          <label>Descripción</label><br />
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            maxLength={MAX.DESCRIPCION}
            rows={3}
            style={{ width: 520 }}
          />
        </div>

        <div>
          <label>Habilidades (coma-separadas)</label><br />
          <input
            name="habilidades"
            value={form.habilidades}
            onChange={handleChange}
            placeholder="ej: React,Node,SQL"
            style={{ width: 520 }}
          />
        </div>

        <div>
          <label>Experiencia</label><br />
          <textarea
            name="experiencia"
            value={form.experiencia}
            onChange={handleChange}
            maxLength={MAX.EXPERIENCIA}
            rows={3}
            style={{ width: 520 }}
          />
        </div>

        <div>
          <label>Educación</label><br />
          <textarea
            name="educacion"
            value={form.educacion}
            onChange={handleChange}
            maxLength={MAX.EDUCACION}
            rows={2}
            style={{ width: 520 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>
            <input type="checkbox" name="es_principal" checked={form.es_principal} onChange={handleChange} />
            Establecer como hoja principal
          </label>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Generando y guardando...' : 'Generar (descargar) y guardar'}
          </button>
          <button
            type="button"
            style={{ marginLeft: 8 }}
            onClick={() => {
              try {
                const blob = generarPdfBlob();
                const filename = (form.nombre_perfil || 'hoja-de-vida').replace(/\s+/g, '-') + '.pdf';
                triggerDownload(blob, filename);
              } catch {
                setError('Error generando PDF');
              }
            }}
          >
            Descargar solo PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default Hojas;