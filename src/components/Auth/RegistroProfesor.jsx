import React, { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Storage from '../../utils/storage';

function RegistroProfesor({ setCurrentPage }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Obtener lista de profesores
      const result = await Storage.get('profesores');
      const profesores = result ? JSON.parse(result.value) : [];

      // Verificar si el email ya existe
      if (profesores.find(p => p.email === email)) {
        setError('Este email ya está registrado');
        return;
      }

      // Crear nuevo profesor
      const nuevoProfesor = {
        id: Date.now().toString(),
        nombre,
        email,
        password,
        fechaRegistro: new Date().toISOString()
      };

      profesores.push(nuevoProfesor);
      await Storage.set('profesores', JSON.stringify(profesores));

      setSuccess(true);
      setTimeout(() => {
        setCurrentPage('login-profesor');
      }, 2000);

    } catch (err) {
      setError('Error al crear la cuenta. Inténtalo de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setCurrentPage('login-profesor')}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Registro Profesor
            </h2>
            <p className="text-gray-600 mt-2">
              Crea tu cuenta para comenzar
            </p>
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
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
              disabled={success}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Crear Cuenta
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage('login-profesor')}
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