import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { db } from "../../firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

const initialFormState = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function RegistroProfesor({ setCurrentPage }) {
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const redirectTimeout = useRef(null);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const nombreLimpio = form.nombre.trim();
    const emailNormalizado = form.email.trim().toLowerCase();
    const { password, confirmPassword } = form;

    // Validaciones sincronas antes de tocar Firebase
    if (!nombreLimpio) {
      setError("Ingresa tu nombre completo");
      return;
    }

    if (!emailNormalizado) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValido.test(emailNormalizado)) {
      setError("El correo electrónico no es válido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      // Verificar si el email ya existe en Firestore
      const q = query(
        collection(db, "profesores"),
        where("email", "==", emailNormalizado)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("Este email ya está registrado");
        return;
      }

      // Crear nuevo profesor en Firestore
      await addDoc(collection(db, "profesores"), {
        nombre: nombreLimpio,
        email: emailNormalizado,
        password,
        fechaRegistro: new Date().toISOString(),
      });

      setSuccess(true);
      setForm(initialFormState);
      redirectTimeout.current = setTimeout(() => {
        setCurrentPage("login-profesor");
      }, 2000);

    } catch (err) {
      setError("Error al crear la cuenta. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setCurrentPage("login-profesor")}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Registro Profesor</h2>
            <p className="text-gray-600 mt-2">Crea tu cuenta para comenzar</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              ¡Cuenta creada exitosamente! Redirigiendo...
            </div>
          )}

          <form onSubmit={handleRegistro} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={handleChange("nombre")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
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
                value={form.password}
                onChange={handleChange("password")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
                success || loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              disabled={success || loading}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? "Guardando..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage("login-profesor")}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroProfesor;