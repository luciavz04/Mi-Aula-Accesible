import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, GraduationCap } from 'lucide-react';
import Storage from '../../utils/storage';

function AlumnoDashboard({ currentUser, setCurrentPage, handleLogout, setSelectedClase }) {
  const [clases, setClases] = useState([]);

  useEffect(() => {
    cargarClases();
  }, [currentUser]);

  const cargarClases = async () => {
    try {
      const result = await Storage.get('clases');
      const todasClases = result ? JSON.parse(result.value) : [];
      
      // Filtrar clases donde el alumno está inscrito
      const misClases = todasClases.filter(clase => 
        clase.alumnos?.some(alumno => alumno.id === currentUser.id)
      );
      
      setClases(misClases);
    } catch (err) {
      console.error('Error cargando clases:', err);
    }
  };

  const abrirClase = (clase) => {
    setSelectedClase(clase);
    setCurrentPage('vista-clase');
  };

  const getNecesidadesBadges = () => {
    if (!currentUser.necesidades || currentUser.necesidades.length === 0) {
      return null;
    }

    const colores = {
      'Dislexia': 'bg-purple-100 text-purple-700',
      'TDAH': 'bg-blue-100 text-blue-700',
      'Discapacidad Visual': 'bg-orange-100 text-orange-700',
      'Discapacidad Auditiva': 'bg-green-100 text-green-700',
      'Dificultad de Comprensión': 'bg-pink-100 text-pink-700'
    };

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {currentUser.necesidades.map((necesidad, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-full text-xs font-medium ${colores[necesidad] || 'bg-gray-100 text-gray-700'}`}
          >
            {necesidad}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-blue-600 text-white p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">EduAdapt</h2>
          <p className="text-blue-200 text-sm mt-1">Panel Alumno</p>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500 rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span>Mis Clases</span>
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-blue-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-200">Alumno</p>
            <p className="font-medium">{currentUser?.nombre}</p>
            {getNecesidadesBadges()}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mis Clases
          </h1>
          <p className="text-gray-600">
            Accede a tus materiales de estudio
          </p>
        </div>

        {clases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No estás inscrito en ninguna clase
            </h3>
            <p className="text-gray-500">
              Tu profesor te inscribirá en las clases correspondientes
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.map((clase) => (
              <div
                key={clase.id}
                onClick={() => abrirClase(clase)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {clase.nombre}
                  </h3>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Profesor:</span> {clase.profesorNombre}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {clase.materiales?.length || 0} materiales disponibles
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlumnoDashboard;