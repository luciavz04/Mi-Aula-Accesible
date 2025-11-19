import React, { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  BookOpen,
  GraduationCap,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function AlumnoDashboard({
  currentUser,
  setCurrentPage,
  handleLogout,
  setSelectedClase,
}) {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarClases = useCallback(async () => {
    if (!currentUser?.id && !currentUser?.usuario) {
      setClases([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");

    try {
      const clasesRef = collection(db, "clases");
      let snapshot = null;
      let misClases = [];

      if (currentUser?.id) {
        const q = query(clasesRef, where("alumnos", "array-contains", currentUser.id));
        snapshot = await getDocs(q);
        misClases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      if (misClases.length === 0) {
        const respaldoSnapshot = await getDocs(clasesRef);
        misClases = respaldoSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((clase) => {
            const alumnos = Array.isArray(clase.alumnos) ? clase.alumnos : [];
            return alumnos.some((alumno) => {
              if (typeof alumno === "string") {
                return alumno === currentUser?.id || alumno === currentUser?.usuario;
              }
              if (alumno && typeof alumno === "object") {
                return alumno.id === currentUser?.id || alumno.usuario === currentUser?.usuario;
              }
              return false;
            });
          });
      }

      setClases(misClases);
    } catch (err) {
      console.error("Error cargando clases:", err);
      setError("No pudimos recuperar tus clases. Reintenta en unos segundos.");
    }
    setCargando(false);
  }, [currentUser?.id, currentUser?.usuario]);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  const abrirClase = (clase) => {
    setSelectedClase(clase);
    setCurrentPage("vista-clase");
  };

  const getNecesidadesBadges = () => {
    if (!currentUser.necesidades || currentUser.necesidades.length === 0) {
      return null;
    }

    const colores = {
      Dislexia: "bg-purple-100 text-purple-700",
      TDAH: "bg-blue-100 text-blue-700",
      "Discapacidad Visual": "bg-orange-100 text-orange-700",
      "Discapacidad Auditiva": "bg-green-100 text-green-700",
      "Dificultad de Comprensión": "bg-pink-100 text-pink-700",
    };

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {currentUser.necesidades.map((necesidad, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              colores[necesidad] || "bg-gray-100 text-gray-700"
            }`}
          >
            {necesidad}
          </span>
        ))}
      </div>
    );
  };

  const necesidadesActivas =
    currentUser?.necesidades?.filter((n) => n !== "Ninguna") || [];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold">EduAdapt</h2>
            <p className="text-blue-200 text-sm mt-1">Panel Alumno</p>
          </div>

          <div className="space-y-3">
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Mis Clases</span>
            </button>
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <Layers className="w-5 h-5" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>

        <div>
          <div className="bg-blue-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-200">Alumno</p>
            <p className="font-medium">{currentUser?.nombre}</p>
            {getNecesidadesBadges()}
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
      <div className="flex-1 p-10 space-y-8">
        {/* Header principal */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="uppercase text-xs tracking-widest text-white/80">
                Bienvenido/a
              </p>
              <h1 className="text-3xl font-bold mt-2">{currentUser?.nombre}</h1>
              <p className="text-white/80 mt-2 max-w-2xl">
                Esta es tu aula accesible. Aquí verás las clases a las que te
                hayas unido, con materiales ya adaptados a tus necesidades.
              </p>
            </div>

            {necesidadesActivas.length > 0 && (
              <div className="bg-white/10 rounded-2xl px-6 py-4 backdrop-blur text-sm">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Apoyos activos
                </p>
                <div className="flex flex-wrap gap-2">
                  {necesidadesActivas.map((necesidad) => (
                    <span
                      key={necesidad}
                      className="px-3 py-1 rounded-full bg-white/20"
                    >
                      {necesidad}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Buscando tus clases...</p>
          </div>
        ) : clases.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No estás inscrito en ninguna clase
            </h3>
            <p className="text-gray-500">
              Tu profesor te inscribirá en las clases correspondientes.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.map((clase) => (
              <div
                key={clase.id}
                onClick={() => abrirClase(clase)}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all cursor-pointer p-6 border border-transparent hover:border-blue-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Clase</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {clase.nombre}
                    </h3>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Profesor:</span>{" "}
                  {clase.profesorNombre}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{clase.materiales?.length || 0} materiales</span>
                  <span>
                    Creada el{" "}
                    {clase.fechaCreacion
                      ? new Date(clase.fechaCreacion).toLocaleDateString()
                      : "—"}
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

export default AlumnoDashboard;
