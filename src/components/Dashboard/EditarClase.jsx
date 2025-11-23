import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";
import { supabase } from "../../supabase";

function EditarClase({ clase, setCurrentPage }) {
  const [nombre, setNombre] = useState(clase?.nombre || "");
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [alumnosEnClase, setAlumnosEnClase] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  // 🔹 Cargar alumnos desde Supabase
  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const { data, error } = await supabase
          .from("alumnos")
          .select("*")
          .order("nombre", { ascending: true });

        if (error) throw error;

        const enClase = data.filter((a) => clase.alumnos?.includes(a.id));
        const fueraClase = data.filter((a) => !clase.alumnos?.includes(a.id));

        setAlumnosEnClase(enClase);
        setAlumnosDisponibles(fueraClase);
      } catch (err) {
        console.error("Error cargando alumnos:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();
  }, [clase]);

  // 🔹 Actualizar alumno → remover de clase
  const quitarAlumno = async (alumno) => {
    try {
      const nuevosAlumnos = alumnosEnClase
        .filter((a) => a.id !== alumno.id)
        .map((a) => a.id);

      const { error } = await supabase
        .from("clases")
        .update({ alumnos: nuevosAlumnos })
        .eq("id", clase.id);

      if (error) throw error;

      setAlumnosEnClase((prev) => prev.filter((a) => a.id !== alumno.id));
      setAlumnosDisponibles((prev) => [...prev, alumno]);
      setMensaje(`🗑️ ${alumno.nombre} eliminado de la clase.`);
    } catch (err) {
      console.error(err);
      setMensaje("❌ No se pudo eliminar el alumno.");
    }
  };

  // 🔹 Actualizar alumno → agregar a clase
  const agregarAlumno = async (alumno) => {
    try {
      const nuevosAlumnos = [...alumnosEnClase.map((a) => a.id), alumno.id];

      const { error } = await supabase
        .from("clases")
        .update({ alumnos: nuevosAlumnos })
        .eq("id", clase.id);

      if (error) throw error;

      setAlumnosDisponibles((prev) => prev.filter((a) => a.id !== alumno.id));
      setAlumnosEnClase((prev) => [...prev, alumno]);
      setMensaje(`✅ ${alumno.nombre} añadido a la clase.`);
    } catch (err) {
      console.error(err);
      setMensaje("❌ No se pudo agregar el alumno.");
    }
  };

  // 🔹 Guardar nombre de la clase
  const guardarNombre = async () => {
    if (!nombre.trim()) {
      setMensaje("⚠️ El nombre de la clase no puede estar vacío.");
      return;
    }

    setGuardando(true);

    try {
      const { error } = await supabase
        .from("clases")
        .update({ nombre })
        .eq("id", clase.id);

      if (error) throw error;

      setMensaje("✅ Nombre de clase actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setMensaje("❌ No se pudo guardar el nombre.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">

        <button
          onClick={() => setCurrentPage("profesor-dashboard")}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Editar Clase
        </h1>

        {mensaje && (
          <div className="mb-4 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200">
            {mensaje}
          </div>
        )}

        {/* Editar nombre */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la clase
          </label>
          <div className="flex gap-3">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={guardarNombre}
              disabled={guardando}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              {guardando ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <Save className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          </div>
        ) : (
          <>
            {/* Alumnos en clase */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                👩‍🏫 Alumnos en esta clase
              </h2>

              {alumnosEnClase.length === 0 ? (
                <p className="text-gray-500">No hay alumnos en esta clase.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {alumnosEnClase.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {a.nombre} {a.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">{a.usuario}</p>
                      </div>

                      <button
                        onClick={() => quitarAlumno(a)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Añadir alumnos */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                ➕ Añadir nuevos alumnos
              </h2>

              {alumnosDisponibles.length === 0 ? (
                <p className="text-gray-500">
                  No hay más alumnos disponibles.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {alumnosDisponibles.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-indigo-300 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {a.nombre} {a.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">{a.usuario}</p>
                      </div>

                      <button
                        onClick={() => agregarAlumno(a)}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EditarClase;
