import React, { useState, useEffect, useCallback } from "react";
import { LogOut, Plus, BookOpen, Users, UserPlus, Pencil, Trash2 } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

function ProfesorDashboard({
  currentUser,
  setCurrentPage,
  handleLogout,
  setSelectedClase,
  setClaseParaEditar,
}) {
  const [clases, setClases] = useState([]);

  // 🔹 Cargar clases del profesor
  const cargarClases = useCallback(async () => {
    try {
      const q = query(collection(db, "clases"), where("profesorId", "==", currentUser.id));
      const snapshot = await getDocs(q);
      const clasesProfesor = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClases(clasesProfesor);
    } catch (err) {
      console.error("Error cargando clases:", err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  // 🔸 Abrir clase
  const abrirClase = (clase) => {
    setSelectedClase(clase);
    setCurrentPage("vista-clase");
  };

  // 🔸 Editar clase
  const editarClase = (clase) => {
    setClaseParaEditar(clase);
    setCurrentPage("editar-clase");
  };

  // 🔸 Eliminar clase
  const eliminarClase = async (claseId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta clase? Esta acción no se puede deshacer.")) return;

    try {
      await deleteDoc(doc(db, "clases", claseId));
      setClases((prev) => prev.filter((c) => c.id !== claseId));
    } catch (err) {
      console.error("Error al eliminar la clase:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-600 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold">EduAdapt</h2>
            <p className="text-indigo-200 text-sm mt-1">Panel Profesor</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage("crear-clase")}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Nueva Clase</span>
            </button>

            <button
              onClick={() => setCurrentPage("registrar-alumno")}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Registrar Alumno</span>
            </button>

            <button
              onClick={() => setCurrentPage("lista-alumnos")}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Ver Lista de Alumnos</span>
            </button>
          </div>
        </div>

        <div>
          <div className="bg-indigo-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-indigo-200">Profesor</p>
            <p className="font-medium">{currentUser?.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Clases</h1>
          <p className="text-gray-600">Gestiona tus clases y estudiantes</p>
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
              onClick={() => setCurrentPage("crear-clase")}
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
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 p-6 flex flex-col justify-between"
              >
                {/* Encabezado de clase */}
                <div className="flex items-center justify-between mb-4">
                  <h3
                    onClick={() => abrirClase(clase)}
                    className="text-xl font-bold text-gray-800 cursor-pointer hover:text-indigo-600"
                  >
                    {clase.nombre}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editarClase(clase)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                      title="Editar clase"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarClase(clase.id)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                      title="Eliminar clase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info de clase */}
                <div className="flex items-center text-gray-600 mb-3">
                  <Users className="w-5 h-5 mr-2 text-indigo-500" />
                  <span>{clase.alumnos?.length || 0} alumnos</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 mr-1 text-indigo-400" />
                  <span>
                    Creada el{" "}
                    {new Date(clase.fechaCreacion).toLocaleDateString()}
                  </span>
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
