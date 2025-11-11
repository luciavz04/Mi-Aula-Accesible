import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Storage from '../../utils/storage';

function CrearClase({ currentUser, setCurrentPage }) {
  const [nombreClase, setNombreClase] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Opciones de necesidades
  const necesidadesOpciones = [
    { id: 'dislexia', label: 'Dislexia' },
    { id: 'tdah', label: 'TDAH' },
    { id: 'visual', label: 'Discapacidad Visual' },
    { id: 'auditiva', label: 'Discapacidad Auditiva' },
    { id: 'comprension', label: 'Dificultad de Comprensión' },
    { id: 'ninguna', label: 'Ninguna' },
  ];

  // Agregar alumno
  const agregarAlumno = () => {
    setAlumnos([
      ...alumnos,
      {
        nombre: '',
        usuario: '',
        password: '',
        necesidades: [],
      },
    ]);
  };

  // Eliminar alumno
  const eliminarAlumno = (index) => {
    const nuevos = [...alumnos];
    nuevos.splice(index, 1);
    setAlumnos(nuevos);
  };

  // Actualizar campo de alumno
  const actualizarAlumno = (index, campo, valor) => {
    const nuevos = [...alumnos];
    nuevos[index][campo] = valor;
    setAlumnos(nuevos);
  };

  // Toggle de necesidad
  const toggleNecesidad = (index, necesidadId) => {
    const nuevos = [...alumnos];
    const necesidades = nuevos[index].necesidades;

    if (necesidadId === 'ninguna') {
      nuevos[index].necesidades = necesidades.includes('ninguna') ? [] : ['ninguna'];
    } else {
      const nuevas = necesidades.includes(necesidadId)
        ? necesidades.filter((n) => n !== necesidadId)
        : [...necesidades.filter((n) => n !== 'ninguna'), necesidadId];
      nuevos[index].necesidades = nuevas;
    }

    setAlumnos(nuevos);
  };

  // Guardar clase
  const guardarClase = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombreClase.trim()) {
      setError('Ingresa el nombre de la clase');
      return;
    }

    if (alumnos.length === 0) {
      setError('Agrega al menos un alumno');
      return;
    }

    for (let alumno of alumnos) {
      if (!alumno.nombre || !alumno.usuario || !alumno.password) {
        setError('Completa todos los campos de los alumnos');
        return;
      }
    }

    setLoading(true);
    try {
      const resultClases = await Storage.get('clases');
      const clases = resultClases ? JSON.parse(resultClases.value) : [];

      const nuevaClase = {
        id: Date.now().toString(),
        nombre: nombreClase,
        profesorId: currentUser.id,
        profesorNombre: currentUser.nombre,
        alumnos: alumnos,
        materiales: [],
        fechaCreacion: new Date().toISOString(),
      };

      clases.push(nuevaClase);
      await Storage.set('clases', JSON.stringify(clases));

      const resultAlumnos = await Storage.get('alumnos');
      const todosAlumnos = resultAlumnos ? JSON.parse(resultAlumnos.value) : [];

      const alumnosConClase = alumnos.map((alumno) => ({
        ...alumno,
        claseId: nuevaClase.id,
      }));

      todosAlumnos.push(...alumnosConClase);
      await Storage.set('alumnos', JSON.stringify(todosAlumnos));

      setSuccess(true);
      setTimeout(() => {
        setCurrentPage('profesor-dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la clase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Volver */}
        <button
          onClick={() => setCurrentPage('profesor-dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </button>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Clase</h1>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              ¡Clase creada exitosamente!
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={guardarClase}>
            {/* Nombre de la clase */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la clase
              </label>
              <input
                type="text"
                value={nombreClase}
                onChange={(e) => setNombreClase(e.target.value)}
                placeholder="Ej: 3º A Matemáticas"
                required
                disabled={loading}
              />
            </div>

            {/* Alumnos */}
            <div className="scroll-container">
              {alumnos.map((alumno, index) => (
                <div key={index} className="alumno-container">
                  <div className="alumno-header">
                    <h4>Alumno {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => eliminarAlumno(index)}
                      disabled={loading}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="input-grid">
                    <input
                      type="text"
                      value={alumno.nombre}
                      onChange={(e) => actualizarAlumno(index, 'nombre', e.target.value)}
                      placeholder="Nombre completo"
                      required
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={alumno.usuario}
                      onChange={(e) => actualizarAlumno(index, 'usuario', e.target.value)}
                      placeholder="Usuario"
                      required
                      disabled={loading}
                    />
                    <input
                      type="password"
                      value={alumno.password}
                      onChange={(e) => actualizarAlumno(index, 'password', e.target.value)}
                      placeholder="Contraseña"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <span className="necesidades-label">Necesidades educativas:</span>
                    <div className="necesidades-grid">
                      {necesidadesOpciones.map((necesidad) => (
                        <label key={necesidad.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={alumno.necesidades.includes(necesidad.id)}
                            onChange={() => toggleNecesidad(index, necesidad.id)}
                            disabled={loading}
                          />
                          <span>{necesidad.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {alumnos.length === 0 && (
              <div className="empty-state">
                No hay alumnos agregados. Haz clic en "Agregar alumno" para empezar.
              </div>
            )}

            {/* Botones de acción */}
            <div className="action-buttons mt-6">
              <button
                type="button"
                onClick={agregarAlumno}
                disabled={loading}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Agregar alumno
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Creando clase...' : 'Crear clase'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearClase;
