import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

function EditarClase({ clase, setCurrentPage }) {
  const [nombre, setNombre] = useState(clase?.nombre || "");
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [alumnosEnClase, setAlumnosEnClase] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  // 🔹 Cargar todos los alumnos desde Firebase
  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "alumnos"));
        const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Dividimos entre los que ya están en la clase y los disponibles
        const enClase = lista.filter((a) => clase.alumnos?.includes(a.id));
        const fueraClase = lista.filter((a) => !clase.alumnos?.includes(a.id));

        setAlumnosEnClase(enClase);
        setAlumnosDisponibles(fueraClase);
      } catch (error) {
        console.error("Error cargando alumnos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarAlumnos();
  }, [clase]);

  const quitarAlumno = async (alumno) => {
    try {
      const ref = doc(db, "clases", clase.id);
      await updateDoc(ref, {
        alumnos: arrayRemove(alumno.id),
      });
      setAlumnosEnClase((prev) => prev.filter((a) => a.id !== alumno.id));
      setAlumnosDisponibles((prev) => [...prev, alumno]);
      setMensaje(`🗑️ ${alumno.nombre} eliminado de la clase.`);
    } catch (error) {
      console.error("Error eliminando alumno:", error);
      setMensaje("❌ No se pudo eliminar el alumno.");
    }
  };

  const agregarAlumno = async (alumno) => {
    try {
      const ref = doc(db, "clases", clase.id);
      await updateDoc(ref, {
        alumnos: arrayUnion(alumno.id),
      });
      setAlumnosDisponibles((prev) => prev.filter((a) => a.id !== alumno.id));
      setAlumnosEnClase((prev) => [...prev, alumno]);
      setMensaje(`✅ ${alumno.nombre} añadido a la clase.`);
    } catch (error) {
      console.error("Error agregando alumno:", error);
      setMensaje("❌ No se pudo agregar el alumno.");
    }
  };

  const guardarNombre = async () => {
    if (!nombre.trim()) {
      setMensaje("⚠️ El nombre de la clase no puede estar vacío.");
      return;
    }

    setGuardando(true);
    try {
      const ref = doc(db, "clases", clase.id);
      await updateDoc(ref, { nombre });
      setMensaje("✅ Nombre de clase actualizado correctamente.");
    } catch (error) {
      console.error("Error actualizando nombre:", error);
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
            {/* Alumnos actuales */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                👩‍🏫 Alumnos en esta clase
              </h2>
              {alumnosEnClase.length === 0 ? (
                <p className="text-gray-500">
                  No hay alumnos en esta clase todavía.
                </p>
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
                        title="Eliminar de la clase"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alumnos disponibles */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                ➕ Añadir nuevos alumnos
              </h2>
              {alumnosDisponibles.length === 0 ? (
                <p className="text-gray-500">
                  No hay más alumnos disponibles para añadir.
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
                        title="Agregar a la clase"
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
