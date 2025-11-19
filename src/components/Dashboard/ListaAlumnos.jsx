import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Edit3, Save, XCircle } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

function ListaAlumnos({ setCurrentPage }) {
  const [alumnos, setAlumnos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  // 🔹 Cargar alumnos desde Firebase
  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "alumnos"));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlumnos(lista);
      } catch (error) {
        console.error("Error cargando alumnos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarAlumnos();
  }, []);

  // 🔹 Manejar cambios en el formulario de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Guardar cambios en Firestore
  const guardarCambios = async (id) => {
    try {
      const ref = doc(db, "alumnos", id);
      await updateDoc(ref, formData);

      setAlumnos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...formData } : a))
      );
      setMensaje("✅ Alumno actualizado correctamente");
      setEditando(null);
      setFormData({});
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      console.error("Error actualizando alumno:", error);
      setMensaje("❌ Error al guardar los cambios");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* 🔙 Volver */}
        <button
          onClick={() => setCurrentPage("profesor-dashboard")}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users className="w-8 h-8 text-indigo-600" /> Lista de Alumnos
        </h1>

        {mensaje && (
          <div className="mb-4 text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <p className="text-gray-500">Cargando alumnos...</p>
        ) : alumnos.length === 0 ? (
          <p className="text-gray-500">No hay alumnos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden text-sm">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Apellidos</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Contraseña</th>
                  <th className="px-4 py-3 text-left">DNI</th>
                  <th className="px-4 py-3 text-left">Clase</th>
                  <th className="px-4 py-3 text-left">Discapacidades</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr
                    key={alumno.id}
                    className="border-t hover:bg-gray-50 transition-all"
                  >
                    {/* Si está en modo edición */}
                    {editando === alumno.id ? (
                      <>
                        <td className="px-3 py-2">
                          <input
                            name="nombre"
                            value={formData.nombre || ""}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            name="apellidos"
                            value={formData.apellidos || ""}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            name="usuario"
                            value={formData.usuario || ""}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            name="password"
                            type="text"
                            value={formData.password || ""}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            name="dni"
                            value={formData.dni || ""}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            name="claseNombre"
                            value={formData.claseNombre || ""}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            name="necesidades"
                            value={
                              Array.isArray(formData.necesidades)
                                ? formData.necesidades.join(", ")
                                : formData.necesidades || ""
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                necesidades: e.target.value
                                  .split(",")
                                  .map((n) => n.trim()),
                              }))
                            }
                            className="w-full border rounded-md px-2 py-1"
                          />
                        </td>
                        <td className="px-3 py-2 text-center flex justify-center gap-2">
                          <button
                            onClick={() => guardarCambios(alumno.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditando(null);
                              setFormData({});
                            }}
                            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      // Modo normal
                      <>
                        <td className="px-3 py-2">{alumno.nombre}</td>
                        <td className="px-3 py-2">{alumno.apellidos}</td>
                        <td className="px-3 py-2">{alumno.usuario}</td>
                        <td className="px-3 py-2">{alumno.password}</td>
                        <td className="px-3 py-2">{alumno.dni}</td>
                        <td className="px-3 py-2">
                          {alumno.claseNombre || "—"}
                        </td>
                        <td className="px-3 py-2">
                          {alumno.necesidades?.length
                            ? alumno.necesidades.join(", ")
                            : "Ninguna"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => {
                              setEditando(alumno.id);
                              setFormData(alumno);
                            }}
                            className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaAlumnos;
