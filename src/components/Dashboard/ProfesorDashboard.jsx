import React, { useState, useEffect } from 'react';
import { LogOut, Plus, BookOpen, Users } from 'lucide-react';
import Storage from '../../utils/storage';

function ProfesorDashboard({ currentUser, setCurrentPage, handleLogout, setSelectedClase }) {
  const [clases, setClases] = useState([]);

  useEffect(() => {
    cargarClases();
  }, [currentUser]);

  const cargarClases = async () => {
    try {
      const result = await Storage.get('clases');
      const todasClases = result ? JSON.parse(result.value) : [];
      const misClases = todasClases.filter(c => c.profesorId === currentUser.id);
      setClases(misClases);
    } catch (err) {
      console.error('Error cargando clases:', err);
    }
  };

  const abrirClase = (clase) => {
    setSelectedClase(clase);
    setCurrentPage('vista-clase');
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-indigo-600 text-white p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">EduAdapt</h2>
          <p className="text-indigo-200 text-sm mt-1">Panel Profesor</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setCurrentPage('crear-clase')}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Nueva Clase</span>
          </button>

          <button
            className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-500 rounded-lg"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mis Clases</span>
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-indigo-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-indigo-200">Profesor</p>
            <p className="font-medium">{currentUser?.nombre}</p>
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
            Gestiona tus clases y estudiantes
          </p>
        </div>

        {clases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tienes clases creadas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza creando tu primera clase
            </p>
            <button
              onClick={() => setCurrentPage('crear-clase')}
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Clase</span>
            </button>
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
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{clase.alumnos?.length || 0} alumnos</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Creada el {new Date(clase.fechaCreacion).toLocaleDateString()}
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

export default ProfesorDashboard;