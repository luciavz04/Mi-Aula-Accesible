import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit3, Check } from "lucide-react";
import Storage from "../../utils/storage";

function CrearClase({ currentUser, setCurrentPage }) {
  const [nombreClase, setNombreClase] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const necesidadesOpciones = [
    { id: "dislexia", label: "Dislexia" },
    { id: "tdah", label: "TDAH" },
    { id: "visual", label: "Discapacidad Visual" },
    { id: "auditiva", label: "Discapacidad Auditiva" },
    { id: "comprension", label: "Dificultad de Comprensión" },
    { id: "ninguna", label: "Ninguna" },
  ];

  const agregarAlumno = () => {
    setAlumnos([
      ...alumnos,
      {
        nombre: "",
        apellido: "",
        usuario: "",
        password: "",
        necesidades: [],
      },
    ]);
    setEditingIndex(alumnos.length);
  };

  const eliminarAlumno = (index) => {
    const nuevos = alumnos.filter((_, i) => i !== index);
    setAlumnos(nuevos);
    if (editingIndex === index) setEditingIndex(null);
  };

  const actualizarAlumno = (index, campo, valor) => {
    setAlumnos((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [campo]: valor } : a))
    );
  };

  const toggleNecesidad = (index, necesidadId) => {
    setAlumnos((prevAlumnos) =>
      prevAlumnos.map((alumno, i) => {
        if (i !== index) return alumno;

        let nuevasNecesidades = [...alumno.necesidades];
        if (necesidadId === "ninguna") {
          nuevasNecesidades = nuevasNecesidades.includes("ninguna")
            ? []
            : ["ninguna"];
        } else {
          if (nuevasNecesidades.includes(necesidadId)) {
            nuevasNecesidades = nuevasNecesidades.filter(
              (n) => n !== necesidadId
            );
          } else {
            nuevasNecesidades = [
              ...nuevasNecesidades.filter((n) => n !== "ninguna"),
              necesidadId,
            ];
          }
        }

        return { ...alumno, necesidades: nuevasNecesidades };
      })
    );
  };

  const guardarClase = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombreClase.trim()) {
      setError("Ingresa el nombre de la clase");
      return;
    }

    if (alumnos.length === 0) {
      setError("Agrega al menos un alumno");
      return;
    }

    for (let alumno of alumnos) {
      if (
        !alumno.nombre ||
        !alumno.apellido ||
        !alumno.usuario ||
        !alumno.password
      ) {
        setError("Completa todos los campos de los alumnos");
        return;
      }
    }

    setLoading(true);
    try {
      const resultClases = await Storage.get("clases");
      const clases = resultClases ? JSON.parse(resultClases.value) : [];

      const nuevaClase = {
        id: Date.now().toString(),
        nombre: nombreClase,
        profesorId: currentUser.id,
        profesorNombre: currentUser.nombre,
        alumnos: alumnos,
        materiales: [],
        fechaCreacion: new Date().toISOString(),
      };

      clases.push(nuevaClase);
      await Storage.set("clases", JSON.stringify(clases));

      const resultAlumnos = await Storage.get("alumnos");
      const todosAlumnos = resultAlumnos ? JSON.parse(resultAlumnos.value) : [];

      const alumnosConClase = alumnos.map((alumno) => ({
        ...alumno,
        claseId: nuevaClase.id,
      }));

      todosAlumnos.push(...alumnosConClase);
      await Storage.set("alumnos", JSON.stringify(todosAlumnos));

      setSuccess(true);
      setTimeout(() => setCurrentPage("profesor-dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setError("Error al guardar la clase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Volver */}
        <button
          onClick={() => setCurrentPage("profesor-dashboard")}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </button>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Crear Nueva Clase
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              ¡Clase creada exitosamente!
            </div>
          )}

          <form onSubmit={guardarClase}>
            {/* Nombre de la clase */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la clase
              </label>
              <input
                type="text"
                value={nombreClase}
                onChange={(e) => setNombreClase(e.target.value)}
                placeholder="Ej: 3º A Matemáticas"
                required
                disabled={loading}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Lista de alumnos */}
            <div className="scroll-container">
              {alumnos.map((alumno, index) => (
                <div key={index} className="alumno-container mb-6">
                  <div className="alumno-header flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Alumno {index + 1}
                    </h4>
                    <div className="flex gap-2">
                      {editingIndex === index ? (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="text-green-600 hover:text-green-800"
                          title="Guardar cambios"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar alumno"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => eliminarAlumno(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {editingIndex === index && (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <input
                          type="text"
                          value={alumno.nombre}
                          onChange={(e) =>
                            actualizarAlumno(index, "nombre", e.target.value)
                          }
                          placeholder="Nombre"
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={alumno.apellido}
                          onChange={(e) =>
                            actualizarAlumno(index, "apellido", e.target.value)
                          }
                          placeholder="Apellidos"
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={alumno.usuario}
                          onChange={(e) =>
                            actualizarAlumno(index, "usuario", e.target.value)
                          }
                          placeholder="Usuario"
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                        <input
                          type="password"
                          value={alumno.password}
                          onChange={(e) =>
                            actualizarAlumno(index, "password", e.target.value)
                          }
                          placeholder="Contraseña"
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-sm font-semibold text-gray-700 mb-2 block">
                          Necesidades educativas:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {necesidadesOpciones.map((necesidad) => (
                            <button
                              key={necesidad.id}
                              type="button"
                              onClick={() =>
                                toggleNecesidad(index, necesidad.id)
                              }
                              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                alumno.necesidades.includes(necesidad.id)
                                  ? "border-blue-400 bg-blue-100 text-blue-700"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              {necesidad.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {alumnos.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No hay alumnos agregados. Haz clic en “Agregar alumno”.
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={agregarAlumno}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all font-semibold shadow-md"
              >
                <Plus className="w-4 h-4" />
                Agregar alumno
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all font-semibold shadow-md"
              >
                {loading ? "Creando clase..." : "Crear clase"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearClase;
