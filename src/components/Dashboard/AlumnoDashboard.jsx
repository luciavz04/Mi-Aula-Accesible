import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import {
  BookOpen,
  Layers,
  LogOut,
  Contrast,
  Type,
  Loader2,
  GraduationCap,
} from "lucide-react";

function AlumnoDashboard({
  currentUser,
  setCurrentPage,
  handleLogout,
  setSelectedClase,
}) {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [altoContraste, setAltoContraste] = useState(false);
  const [textoGrande, setTextoGrande] = useState(false);

  /* =====================================================
     Cargar clases del alumno
  ===================================================== */
  const cargarClases = useCallback(async () => {
    if (!currentUser?.id) {
      setClases([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("clases")
        .select("*")
        .contains("alumnos", [currentUser.id]);

      if (error) throw error;
      setClases(data || []);
    } catch (err) {
      console.error("Error cargando clases:", err);
      setError("No pudimos recuperar tus clases. Reintenta en unos segundos.");
    }

    setCargando(false);
  }, [currentUser?.id]);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  /* =====================================================
     Aplicar adaptaciones automáticas
  ===================================================== */
  useEffect(() => {
    if (currentUser?.necesidades?.includes("Discapacidad Visual")) {
      setAltoContraste(true);
      setTextoGrande(true);
    }
    if (currentUser?.necesidades?.includes("Dislexia")) {
      setTextoGrande(true);
    }
  }, [currentUser?.necesidades]);

  const abrirClase = (clase) => {
    setSelectedClase(clase);
    setCurrentPage("vista-clase");
  };

  /* =====================================================
      Estilos dinámicos según tu paleta final
  ===================================================== */

  const fondo = altoContraste ? "bg-slate-900" : "bg-gray-50";

  const tarjeta = altoContraste
    ? "bg-slate-800 border border-slate-700 text-white"
    : "bg-white border border-gray-200 shadow-md text-gray-900";

  const textoSecundario = altoContraste ? "text-slate-300" : "text-gray-600";

  /* =====================================================
      Render principal
  ===================================================== */
  return (
    <div className={`min-h-screen flex ${fondo}`}>
      {/* =============  SIDEBAR ================== */}
      <aside
        className={`w-64 p-6 flex flex-col justify-between shadow-xl ${
          altoContraste ? "bg-slate-800 text-white" : "bg-indigo-600 text-white"
        }`}
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">EduAdapt</h2>
          <p className="text-indigo-200 text-sm mb-8">Panel Alumno</p>

          <nav className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition">
              <BookOpen className="w-5 h-5" />
              Mis Clases
            </button>

            <button
              onClick={() => setCurrentPage("home")}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-400 hover:bg-indigo-500 transition"
            >
              <Layers className="w-5 h-5" />
              Volver al Inicio
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div>
          <div className="bg-indigo-500 rounded-lg p-4 mb-4 shadow-md">
            <p className="text-indigo-200 text-sm">Alumno</p>
            <p className="font-semibold">{currentUser?.nombre}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* =================== CONTENIDO PRINCIPAL ==================== */}
      <main className="flex-1 p-10 space-y-8">

        {/* Encabezado bonito + contraste FIX */}
        <header
          className={`rounded-3xl p-10 shadow-xl text-white ${
            altoContraste
              ? "bg-slate-800 border border-slate-700"
              : "bg-gradient-to-r from-indigo-800 to-blue-800"
          }`}
        >
          <p className="uppercase text-indigo-200 text-xs font-semibold">
            Bienvenido/a
          </p>

          <h1
            className={`mt-2 font-bold ${
              textoGrande ? "text-4xl" : "text-3xl"
            }`}
          >
            {currentUser?.nombre}
          </h1>

          <p className="opacity-90 mt-3 max-w-2xl">
            Esta es tu aula accesible. Tus clases y materiales ya están adaptados
            automáticamente a tus necesidades.
          </p>
        </header>

        {/* Ajustes de accesibilidad */}
        <section className={`${tarjeta} rounded-2xl p-6`}>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Contrast className="w-4 h-4 text-indigo-500" />
            Opciones de accesibilidad
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setAltoContraste((p) => !p)}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              {altoContraste
                ? "Desactivar alto contraste"
                : "Activar alto contraste"}
            </button>

            <button
              onClick={() => setTextoGrande((p) => !p)}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              {textoGrande ? "Reducir texto" : "Aumentar texto"}
            </button>
          </div>
        </section>

        {/* Errores */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow">
            {error}
          </div>
        )}

        {/* Estado: cargando */}
        {cargando ? (
          <div className={`${tarjeta} rounded-2xl p-12 text-center shadow-md`}>
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className={textoSecundario}>Buscando tus clases...</p>
          </div>
        ) : clases.length === 0 ? (
          /* Estado: No hay clases */
          <div className={`${tarjeta} rounded-2xl p-12 shadow-md text-center`}>
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Aún no tienes clases asignadas</h3>
            <p className={textoSecundario}>Tu profesor te añadirá pronto.</p>
          </div>
        ) : (
          /* Lista de clases */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.map((clase) => (
              <div
                key={clase.id}
                onClick={() => abrirClase(clase)}
                className={`${tarjeta} rounded-2xl p-6 shadow-lg hover:shadow-2xl cursor-pointer transition`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="uppercase text-xs text-gray-400">Clase</p>
                    <h3 className="text-xl font-bold">{clase.nombre}</h3>
                  </div>

                  <BookOpen className="w-10 h-10 text-indigo-600" />
                </div>

                <p className={textoSecundario}>
                  <span className="font-medium">Profesor:</span>{" "}
                  {clase.profesor_nombre}
                </p>

                <p className="text-xs mt-2 text-gray-500">
                  Creada el{" "}
                  {clase.fecha_creacion
                    ? new Date(clase.fecha_creacion).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AlumnoDashboard;
