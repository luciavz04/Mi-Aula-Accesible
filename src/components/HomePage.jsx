import React from 'react';
import { GraduationCap, Users } from 'lucide-react';

function HomePage({ setCurrentPage }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">
            EduAdapt
          </h1>
          <p className="text-xl text-gray-600">
            Plataforma Educativa Adaptativa para Todos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => setCurrentPage('login-alumno')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-100 p-6 rounded-full group-hover:bg-blue-200 transition-colors">
                <GraduationCap className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Soy Alumno
              </h2>
              <p className="text-gray-600 text-center">
                Accede a tus clases y materiales adaptados
              </p>
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('login-profesor')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-indigo-100 p-6 rounded-full group-hover:bg-indigo-200 transition-colors">
                <Users className="w-16 h-16 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Soy Profesor
              </h2>
              <p className="text-gray-600 text-center">
                Gestiona tus clases y crea contenido adaptativo
              </p>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Educación inclusiva y personalizada para estudiantes con diferentes necesidades
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;