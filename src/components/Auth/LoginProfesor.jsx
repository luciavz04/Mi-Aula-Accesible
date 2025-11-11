import React, { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import Storage from '../../utils/storage';

function LoginProfesor({ setCurrentPage, setCurrentUser, setUserType }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await Storage.get('profesores');
      const profesores = result ? JSON.parse(result.value) : [];

      const profesor = profesores.find(
        p => p.email === email && p.password === password
      );

      if (profesor) {
        setCurrentUser(profesor);
        setUserType('profesor');
        localStorage.setItem('currentUser', JSON.stringify(profesor));
        localStorage.setItem('userType', 'profesor');
        setCurrentPage('profesor-dashboard');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Acceso Profesor
            </h2>
            <p className="text-gray-600 mt-2">
              Inicia sesión con tu cuenta
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentPage('registro-profesor')}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginProfesor;