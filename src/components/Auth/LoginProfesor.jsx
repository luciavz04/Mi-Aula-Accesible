import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowLeft, LogIn } from "lucide-react";

function LoginProfesor({ setCurrentPage, setCurrentUser, setUserType }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔍 Buscar en Firestore un profesor con el email indicado
      const q = query(collection(db, "profesores"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("❌ No existe ninguna cuenta con este correo.");
        setLoading(false);
        return;
      }

      // ✅ Si el email existe, comprobamos la contraseña
      const profesorDoc = snapshot.docs[0];
      const profesor = { id: profesorDoc.id, ...profesorDoc.data() };

      if (profesor.password !== password) {
        setError("🔒 Contraseña incorrecta.");
        setLoading(false);
        return;
      }

      // 🟢 Login correcto
      setCurrentUser(profesor);
      setUserType("profesor");
      localStorage.setItem("currentUser", JSON.stringify(profesor));
      localStorage.setItem("userType", "profesor");
      setCurrentPage("profesor-dashboard");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("⚠️ Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Volver */}
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Acceso Profesor</h2>
          <p className="text-gray-600 mt-2">Inicia sesión con tu cuenta</p>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={loading}
          >
            <LogIn className="w-5 h-5 mr-2" />
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Ir al registro */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage("registro-profesor")}
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginProfesor;
