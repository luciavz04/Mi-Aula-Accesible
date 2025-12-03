import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import {
  BookOpen,
  Layers,
  LogOut,
  Contrast,
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

  /* ===================== CARGAR CLASES ===================== */
  const cargarClases = useCallback(async () => {
    if (!currentUser?.id) return;

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
      console.error("❌ Error cargando clases:", err);
      setError("No se pudieron cargar tus clases. Inténtalo más tarde.");
    }

    setCargando(false);
  }, [currentUser?.id]);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  /* ===================== ADAPTACIONES AUTOMÁTICAS ===================== */
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

  /* ===================== ESTILOS ACCESIBLES ===================== */

  const fondo = altoContraste ? "bg-slate-900" : "bg-gray-100";

  const tarjeta =
    altoContraste
      ? "bg-slate-800 border border-slate-700 text-white"
      : "bg-white border border-gray-200 shadow-md text-gray-900";

  const textoSecundario =
    altoContraste ? "text-slate-300" : "text-gray-600";

  /* ===================== RENDER ===================== */
  return (
    <div className={`min-h-screen flex ${fondo}`}>
      
      {/* =============== SIDEBAR =============== */}
      <aside
        className={`w-64 p-6 flex flex-col justify-between shadow-xl ${
          altoContraste ? "bg-slate-800 text-white" : "bg-indigo-700 text-white"
        }`}
      >
        <div>
          <h2 className="text-3xl font-bold mb-1">EduAdapt</h2>
          <p className="opacity-70 text-sm mb-8">Panel Alumno</p>

<<<<<<< HEAD
          <nav className="space-y-6">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition">
=======
          <nav className="space-y-3">

            {/* Mis clases */}
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">
>>>>>>> f9d69f1ac19e66e6fb1b2bf2792654c3438767ba
              <BookOpen className="w-5 h-5" />
              Mis Clases
            </button>

            {/* Volver al inicio */}
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition"
            >
              <Layers className="w-5 h-5" />
              Volver a inicio
            </button>
          </nav>
        </div>

        {/* Footer sidebar */}
        <div>
          <div className="bg-indigo-600 rounded-lg p-4 mb-4 shadow">
            <p className="opacity-70 text-sm">Alumno</p>
            <p className="font-semibold">{currentUser?.nombre}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* =============== MAIN =============== */}
      <main className="flex-1 p-10 space-y-8">

        {/* ENCABEZADO */}
        <header
          className={`rounded-3xl p-10 shadow-xl text-white ${
            altoContraste
              ? "bg-slate-800 border border-slate-700"
              : "bg-gradient-to-r from-indigo-800 to-blue-800"
          }`}
        >
          <p className="opacity-70 text-xs uppercase">Bienvenido/a</p>

          <h1
            className={`${textoGrande ? "text-4xl" : "text-3xl"} font-bold mt-2`}
          >
            {currentUser?.nombre}
          </h1>

          <p className="opacity-80 mt-3 max-w-2xl">
            Aquí verás todas tus clases y materiales accesibles.
          </p>
        </header>

        {/* ACCESIBILIDAD */}
        <section className={`${tarjeta} rounded-2xl p-6`}>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Contrast className="w-4 h-4 text-indigo-500" />
            Opciones de accesibilidad
          </div>

          <div className="flex gap-3 flex-wrap">

            {/* Alto contraste */}
            <button
              onClick={() => setAltoContraste((v) => !v)}
              className="btn-secondary px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900"
            >
              {altoContraste ? "Desactivar alto contraste" : "Activar alto contraste"}
            </button>

            {/* Texto grande */}
            <button
              onClick={() => setTextoGrande((v) => !v)}
              className="btn-secondary px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900"
            >
              {textoGrande ? "Reducir texto" : "Aumentar el texto"}
            </button>
          </div>
        </section>

        {/* ERRORES */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow">
            {error}
          </div>
        )}

        {/* ESTADO: Cargando */}
        {cargando ? (
          <div className={`${tarjeta} rounded-2xl p-12 text-center`}>
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className={textoSecundario}>Cargando tus clases...</p>
          </div>
        ) : clases.length === 0 ? (
          
          <div className={`${tarjeta} rounded-2xl p-12 text-center`}>
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-1">No tienes clases aún</h3>
            <p className={textoSecundario}>Tu profesor te añadirá pronto.</p>
          </div>

        ) : (
          /* LISTA DE CLASES */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.map((clase) => (
              <div
                key={clase.id}
                onClick={() => abrirClase(clase)}
                className={`${tarjeta} rounded-2xl p-6 shadow-lg hover:shadow-2xl cursor-pointer transition`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="uppercase text-xs text-gray-400">
                      Clase
                    </p>
                    <h3 className="text-xl font-bold">{clase.nombre}</h3>
                  </div>

                  <BookOpen className="w-10 h-10 text-indigo-600" />
                </div>

                <p className={textoSecundario}>
                  <span className="font-medium">Profesor: </span>
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
