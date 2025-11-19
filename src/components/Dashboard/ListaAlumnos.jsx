import React, { useState, useEffect } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

function ListaAlumnos({ setCurrentPage }) {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "alumnos"));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlumnos(lista);
      } catch (error) {
        console.error("Error cargando alumnos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarAlumnos();
  }, []);

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

        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users className="w-8 h-8 text-indigo-600" /> Lista de Alumnos
        </h1>

        {cargando ? (
          <p className="text-gray-500">Cargando alumnos...</p>
        ) : alumnos.length === 0 ? (
          <p className="text-gray-500">No hay alumnos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Apellidos</th>
                  <th className="px-4 py-3 text-left">DNI</th>
                  <th className="px-4 py-3 text-left">Clase</th>
                  <th className="px-4 py-3 text-left">Discapacidades</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map(alumno => (
                  <tr key={alumno.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{alumno.nombre}</td>
                    <td className="px-4 py-3">{alumno.apellidos}</td>
                    <td className="px-4 py-3">{alumno.dni}</td>
                    <td className="px-4 py-3">
                      {alumno.claseNombre || "Sin asignar"}
                    </td>
                    <td className="px-4 py-3">
                      {alumno.necesidades?.length
                        ? alumno.necesidades.join(", ")
                        : "Ninguna"}
                    </td>
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
