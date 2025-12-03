import React, { useState } from "react";
import { supabase } from "../../supabase";
import { ArrowLeft } from "lucide-react";

function RegistrarAlumno({ setCurrentPage }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [usuario, setUsuario] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [necesidad, setNecesidad] = useState(""); // 🔹 Solo una discapacidad
  const [mensaje, setMensaje] = useState("");

  const opcionesNecesidades = [
    "Dislexia",
    "TDAH",
    "Discapacidad Visual",
    "Discapacidad Auditiva",
    "Dificultad de Comprensión",
    "Ninguna",
  ];

  const seleccionarNecesidad = (opcion) => {
    // Si se vuelve a pulsar la misma, se deselecciona
    setNecesidad((prev) => (prev === opcion ? "" : opcion));
  };

  const registrarAlumno = async () => {
    if (!nombre || !apellidos || !usuario || !dni || !password) {
      setMensaje("⚠️ Por favor, completa todos los campos.");
      return;
    }

    if (!necesidad) {
      setMensaje("⚠️ Debes seleccionar una necesidad educativa (o 'Ninguna').");
      return;
    }

    try {
      const { error } = await supabase.from("alumnos").insert({
        nombre,
        apellidos,
        usuario,
        dni,
        password,
        necesidades: necesidad, // 🔹 Guarda un único valor
        fecha_registro: new Date().toISOString(),
      });

      if (error) {
        console.error("Error Supabase:", error);
        setMensaje("❌ Error al guardar el alumno.");
        return;
      }

      setMensaje("✅ Alumno registrado correctamente en Supabase");
      setNombre("");
      setApellidos("");
      setUsuario("");
      setDni("");
      setPassword("");
      setNecesidad("");

      setTimeout(() => setMensaje(""), 2500);
    } catch (error) {
      console.error("Error al registrar alumno:", error);
      setMensaje("❌ Error al guardar el alumno.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setCurrentPage("profesor-dashboard")}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Registrar Alumno
        </h2>

        {mensaje && (
          <div className="mb-4 text-center font-medium text-sm">{mensaje}</div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
          />

          <input
            type="text"
            placeholder="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
          />

          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
          />

          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
          />

          <div className="mb-4">
            <p className="font-semibold text-gray-700 mb-2">
              Necesidad educativa (solo una):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {opcionesNecesidades.map((opcion) => (
                <button
                  key={opcion}
                  onClick={() => seleccionarNecesidad(opcion)}
                  type="button"
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                    necesidad === opcion
                      ? "border-indigo-400 bg-indigo-100 text-indigo-700"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={registrarAlumno}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Registrar Alumno
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrarAlumno;
