import React, { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

function LoginAlumno({ setCurrentPage, setCurrentUser, setUserType }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const usuarioNormalizado = usuario.trim();

      if (!usuarioNormalizado || !password) {
        setError('Introduce tu usuario y contraseña');
        return;
      }

      const q = query(
        collection(db, 'alumnos'),
        where('usuario', '==', usuarioNormalizado),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('No se encontró un alumno con ese usuario');
        return;
      }

      const alumnoDoc = snapshot.docs[0];
      const alumno = { id: alumnoDoc.id, ...alumnoDoc.data() };

      if (alumno.password !== password) {
        setError('Usuario o contraseña incorrectos');
        return;
      }

      setCurrentUser(alumno);
      setUserType('alumno');
      localStorage.setItem('currentUser', JSON.stringify(alumno));
      localStorage.setItem('userType', 'alumno');
      setCurrentPage('alumno-dashboard');
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
              Acceso Alumno
            </h2>
            <p className="text-gray-600 mt-2">
              Inicia sesión con tu usuario
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
                Usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>¿No tienes usuario?</p>
            <p className="mt-1">Pide a tu profesor que te cree una cuenta</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAlumno;