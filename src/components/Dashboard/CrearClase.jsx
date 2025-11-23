import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckSquare, Loader2 } from "lucide-react";
import { supabase } from "../../supabase";

function CrearClase({ currentUser, setCurrentPage }) {
  const [nombreClase, setNombreClase] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  // 🔹 Cargar alumnos desde Supabase
  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const { data, error } = await supabase
          .from("alumnos")
          .select("*")
          .order("nombre", { ascending: true });

        if (error) {
          console.error("Error cargando alumnos:", error);
        } else {
          setAlumnos(data || []);
        }
      } catch (err) {
        console.error("Error cargando alumnos:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();
  }, []);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const crearClase = async () => {
    if (!nombreClase.trim()) {
      setMensaje("⚠️ Escribe un nombre para la clase");
      return;
    }
    if (seleccionados.length === 0) {
      setMensaje("⚠️ Debes seleccionar al menos un alumno");
      return;
    }

    try {
      const { error } = await supabase.from("clases").insert({
        nombre: nombreClase,
        profesor_id: currentUser.id,
        profesor_nombre: currentUser.nombre,
        alumnos: seleccionados,
        fecha_creacion: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creando clase:", error);
        setMensaje("❌ Error al guardar la clase");
        return;
      }

      setMensaje("✅ Clase creada correctamente");
      setNombreClase("");
      setSeleccionados([]);

      setTimeout(() => setCurrentPage("profesor-dashboard"), 1500);

    } catch (err) {
      console.error("Error creando clase:", err);
      setMensaje("❌ Error al guardar la clase");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => setCurrentPage("profesor-dashboard")}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Crear Nueva Clase
        </h1>

        {mensaje && (
          <div className="mb-4 text-center font-medium text-sm">{mensaje}</div>
        )}

        <input
          type="text"
          value={nombreClase}
          onChange={(e) => setNombreClase(e.target.value)}
          placeholder="Ej: 3ºA Matemáticas"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 mb-6"
        />

        {cargando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Selecciona alumnos para esta clase:
            </h3>
            {alumnos.length === 0 ? (
              <p className="text-gray-500">No hay alumnos registrados todavía.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {alumnos.map((alumno) => (
                  <div
                    key={alumno.id}
                    onClick={() => toggleSeleccion(alumno.id)}
                    className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${
                      seleccionados.includes(alumno.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {alumno.nombre} {alumno.apellidos}
                      </p>
                      <p className="text-sm text-gray-600">
                        {alumno.usuario} — {alumno.dni}
                      </p>
                    </div>
                    {seleccionados.includes(alumno.id) && (
                      <CheckSquare className="text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={crearClase}
          className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Crear Clase
        </button>
      </div>
    </div>
  );
}

export default CrearClase;
