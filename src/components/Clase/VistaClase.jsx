import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import Storage from '../../utils/storage';
import MaterialesList from './MaterialesList';

function VistaClase({ clase, currentUser, userType, setCurrentPage }) {
  const [materiales, setMateriales] = useState([]);
  const [nuevoMaterial, setNuevoMaterial] = useState({
    titulo: '',
    contenido: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarMateriales();
  }, [clase]);

  const cargarMateriales = async () => {
    try {
      const result = await Storage.get('clases');
      const clases = result ? JSON.parse(result.value) : [];
      const claseActual = clases.find(c => c.id === clase.id);
      setMateriales(claseActual?.materiales || []);
    } catch (err) {
      console.error('Error cargando materiales:', err);
    }
  };

  const subirMaterial = async () => {
    if (!nuevoMaterial.titulo || !nuevoMaterial.contenido) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const result = await Storage.get('clases');
      const clases = result ? JSON.parse(result.value) : [];
      const claseIndex = clases.findIndex(c => c.id === clase.id);

      if (claseIndex !== -1) {
        const material = {
          id: Date.now().toString(),
          titulo: nuevoMaterial.titulo,
          contenido: nuevoMaterial.contenido,
          fechaSubida: new Date().toISOString()
        };

        if (!clases[claseIndex].materiales) {
          clases[claseIndex].materiales = [];
        }

        clases[claseIndex].materiales.push(material);
        await Storage.set('clases', JSON.stringify(clases));

        setMateriales(clases[claseIndex].materiales);
        setNuevoMaterial({ titulo: '', contenido: '' });
        setMostrarFormulario(false);
      }
    } catch (err) {
      console.error('Error subiendo material:', err);
      alert('Error al subir el material');
    }
  };

  const volver = () => {
    setCurrentPage(userType === 'profesor' ? 'profesor-dashboard' : 'alumno-dashboard');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={volver}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {clase.nombre}
              </h1>
              <p className="text-gray-600 mt-2">
                Profesor: {clase.profesorNombre}
              </p>
            </div>
            {userType === 'profesor' && (
              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                <Upload className="w-5 h-5" />
                <span>Subir Material</span>
              </button>
            )}
          </div>

          {/* Formulario para subir material (solo profesor) */}
          {userType === 'profesor' && mostrarFormulario && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Nuevo Material
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={nuevoMaterial.titulo}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, titulo: e.target.value})}
                  placeholder="Título del material"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={nuevoMaterial.contenido}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, contenido: e.target.value})}
                  placeholder="Contenido del material"
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={subirMaterial}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de materiales */}
        {materiales.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay materiales disponibles
            </h3>
            <p className="text-gray-500">
              {userType === 'profesor' 
                ? 'Sube el primer material para tus alumnos'
                : 'Tu profesor subirá materiales pronto'}
            </p>
          </div>
        ) : (
          <MaterialesList 
            materiales={materiales}
            currentUser={currentUser}
            userType={userType}
          />
        )}
      </div>
    </div>
  );
}

export default VistaClase;