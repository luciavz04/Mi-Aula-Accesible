import React, { useState, useEffect } from 'react';
import { User, BookOpen, LogOut, Plus, Upload, FileText, Presentation, File, Volume2, ZoomIn, ZoomOut, Eye, Lightbulb, Brain, Ear } from 'lucide-react';

// Storage wrapper para manejar errores
const Storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Error obteniendo dato:', error);
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { value };
    } catch (error) {
      console.error('Error guardando dato:', error);
      return null;
    }
  },
  async delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }
};

// HomePage Component
const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            EduAdapt
          </h1>
          <p className="text-xl text-gray-600">Educación Adaptativa para Todos</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('login-alumno')}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <User className="w-20 h-20 mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Soy Alumno</h2>
            <p className="text-gray-600">Accede a tus materiales adaptados</p>
          </button>
          
          <button
            onClick={() => onNavigate('login-profesor')}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Soy Profesor</h2>
            <p className="text-gray-600">Gestiona tus clases y alumnos</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Alumno Component
const LoginAlumno = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const profesores = await Storage.get('profesores');
    if (!profesores) {
      setError('No hay profesores registrados');
      return;
    }

    const profList = JSON.parse(profesores.value);
    let alumnoEncontrado = null;
    let claseDelAlumno = null;

    for (const prof of profList) {
      const clasesResult = await Storage.get(`clases_${prof.email}`);
      if (clasesResult) {
        const clases = JSON.parse(clasesResult.value);
        for (const clase of clases) {
          const alumno = clase.alumnos.find(a => a.username === username && a.password === password);
          if (alumno) {
            alumnoEncontrado = alumno;
            claseDelAlumno = clase;
            break;
          }
        }
      }
      if (alumnoEncontrado) break;
    }

    if (alumnoEncontrado) {
      onLogin({ ...alumnoEncontrado, clase: claseDelAlumno }, 'alumno');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-800">Acceso Alumno</h2>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Iniciar Sesión
          </button>
          
          <button
            onClick={onBack}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Profesor Component
const LoginProfesor = ({ onLogin, onNavigate, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const profesores = await Storage.get('profesores');
    if (!profesores) {
      setError('No hay profesores registrados');
      return;
    }

    const profList = JSON.parse(profesores.value);
    const profesor = profList.find(p => p.email === email && p.password === password);

    if (profesor) {
      onLogin(profesor, 'profesor');
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h2 className="text-3xl font-bold text-gray-800">Acceso Profesor</h2>
        </div>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Iniciar Sesión
          </button>
          
          <button
            onClick={() => onNavigate('registro-profesor')}
            className="w-full border-2 border-purple-500 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
          >
            Crear Cuenta
          </button>
          
          <button
            onClick={onBack}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

// Registro Profesor Component
const RegistroProfesor = ({ onNavigate, onBack }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegistro = async () => {
    setError('');
    setSuccess('');

    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const profesoresData = await Storage.get('profesores');
    const profesores = profesoresData ? JSON.parse(profesoresData.value) : [];

    if (profesores.find(p => p.email === email)) {
      setError('Este email ya está registrado');
      return;
    }

    profesores.push({ nombre, email, password });
    await Storage.set('profesores', JSON.stringify(profesores));
    
    setSuccess('¡Cuenta creada! Redirigiendo...');
    setTimeout(() => onNavigate('login-profesor'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h2 className="text-3xl font-bold text-gray-800">Crear Cuenta Profesor</h2>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}
          
          <button
            onClick={handleRegistro}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Crear Cuenta
          </button>
          
          <button
            onClick={onBack}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Profesor Component
const ProfesorDashboard = ({ profesor, onLogout, onNavigate }) => {
  const [clases, setClases] = useState([]);

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    const clasesData = await Storage.get(`clases_${profesor.email}`);
    setClases(clasesData ? JSON.parse(clasesData.value) : []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel del Profesor</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {profesor.nombre}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Botón Crear Clase */}
        <button
          onClick={() => onNavigate('crear-clase', { profesor })}
          className="mb-8 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg font-semibold"
        >
          <Plus className="w-6 h-6" />
          Crear Nueva Clase
        </button>

        {/* Lista de Clases */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((clase, index) => (
            <div
              key={index}
              onClick={() => onNavigate('vista-clase', { clase, profesor, userType: 'profesor' })}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-purple-500 group"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <BookOpen className="w-12 h-12 text-white mb-3" />
                <h3 className="text-2xl font-bold text-white">{clase.nombre}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">{clase.alumnos.length}</span> alumnos
                </p>
                <div className="flex flex-wrap gap-2">
                  {clase.alumnos.slice(0, 3).map((alumno, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {alumno.nombre}
                    </span>
                  ))}
                  {clase.alumnos.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      +{clase.alumnos.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {clases.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <BookOpen className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay clases todavía</h3>
            <p className="text-gray-600">Crea tu primera clase para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Crear Clase Component
const CrearClase = ({ profesor, onBack }) => {
  const [nombreClase, setNombreClase] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: '',
    username: '',
    password: '',
    necesidades: []
  });

  const necesidadesDisponibles = [
    { id: 'dislexia', label: 'Dislexia', icon: Brain },
    { id: 'tdah', label: 'TDAH', icon: Lightbulb },
    { id: 'visual', label: 'Discapacidad Visual', icon: Eye },
    { id: 'auditiva', label: 'Discapacidad Auditiva', icon: Ear },
    { id: 'comprension', label: 'Dificultad de Comprensión', icon: FileText }
  ];

  const toggleNecesidad = (necesidad) => {
    setNuevoAlumno(prev => ({
      ...prev,
      necesidades: prev.necesidades.includes(necesidad)
        ? prev.necesidades.filter(n => n !== necesidad)
        : [...prev.necesidades, necesidad]
    }));
  };

  const agregarAlumno = () => {
    if (!nuevoAlumno.nombre || !nuevoAlumno.username || !nuevoAlumno.password) {
      alert('Completa todos los campos del alumno');
      return;
    }
    setAlumnos([...alumnos, nuevoAlumno]);
    setNuevoAlumno({ nombre: '', username: '', password: '', necesidades: [] });
  };

  const guardarClase = async () => {
    if (!nombreClase || alumnos.length === 0) {
      alert('Debes agregar un nombre y al menos un alumno');
      return;
    }

    const clasesData = await Storage.get(`clases_${profesor.email}`);
    const clases = clasesData ? JSON.parse(clasesData.value) : [];
    
    clases.push({
      nombre: nombreClase,
      alumnos,
      materiales: []
    });
    
    await Storage.set(`clases_${profesor.email}`, JSON.stringify(clases));
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Crear Nueva Clase</h2>
          
          {/* Nombre de la Clase */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Clase</label>
            <input
              type="text"
              value={nombreClase}
              onChange={(e) => setNombreClase(e.target.value)}
              placeholder="Ej: 3° A Matemáticas"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Formulario Nuevo Alumno */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Agregar Alumno</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoAlumno.nombre}
                onChange={(e) => setNuevoAlumno({...nuevoAlumno, nombre: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Usuario"
                value={nuevoAlumno.username}
                onChange={(e) => setNuevoAlumno({...nuevoAlumno, username: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoAlumno.password}
                onChange={(e) => setNuevoAlumno({...nuevoAlumno, password: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Necesidades */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Necesidades Educativas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {necesidadesDisponibles.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => toggleNecesidad(id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                      nuevoAlumno.necesidades.includes(id)
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={agregarAlumno}
              className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold"
            >
              Agregar Alumno
            </button>
          </div>

          {/* Lista de Alumnos Agregados */}
          {alumnos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Alumnos Agregados ({alumnos.length})</h3>
              <div className="space-y-3">
                {alumnos.map((alumno, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{alumno.nombre}</p>
                      <p className="text-sm text-gray-600">Usuario: {alumno.username}</p>
                      {alumno.necesidades.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {alumno.necesidades.map(nec => (
                            <span key={nec} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {necesidadesDisponibles.find(n => n.id === nec)?.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setAlumnos(alumnos.filter((_, i) => i !== index))}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <button
              onClick={guardarClase}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg"
            >
              Guardar Clase
            </button>
            <button
              onClick={onBack}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Alumno Component
const AlumnoDashboard = ({ alumno, onLogout, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mi Panel</h1>
            <p className="text-gray-600 mt-1">Hola, {alumno.nombre}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {alumno.clase && (
          <div
            onClick={() => onNavigate('vista-clase', { clase: alumno.clase, alumno, userType: 'alumno' })}
            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-500 group max-w-2xl"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8">
              <BookOpen className="w-16 h-16 text-white mb-4" />
              <h2 className="text-3xl font-bold text-white">{alumno.clase.nombre}</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-lg mb-4">Haz clic para ver los materiales</p>
              {alumno.necesidades && alumno.necesidades.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Adaptaciones activas:</p>
                  <div className="flex flex-wrap gap-2">
                    {alumno.necesidades.map(nec => (
                      <span key={nec} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {nec === 'dislexia' && '🧠 Dislexia'}
                        {nec === 'tdah' && '💡 TDAH'}
                        {nec === 'visual' && '👁️ Visual'}
                        {nec === 'auditiva' && '👂 Auditiva'}
                        {nec === 'comprension' && '📖 Comprensión'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Vista Clase Component con Upload de Archivos
const VistaClase = ({ clase, alumno, profesor, userType, onBack }) => {
  const [materiales, setMateriales] = useState(clase.materiales || []);
  const [showUpload, setShowUpload] = useState(false);
  const [nuevoMaterial, setNuevoMaterial] = useState({
    titulo: '',
    contenido: '',
    tipo: 'texto'
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target.result;
      let tipo = 'documento';
      
      if (file.type.includes('pdf')) {
        tipo = 'pdf';
      } else if (file.type.includes('presentation') || file.name.endsWith('.pptx')) {
        tipo = 'presentacion';
      } else if (file.type.includes('image')) {
        tipo = 'imagen';
      }

      setNuevoMaterial({
        ...nuevoMaterial,
        tipo,
        archivo: {
          nombre: file.name,
          tipo: file.type,
          data: fileData
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const guardarMaterial = async () => {
    if (!nuevoMaterial.titulo) {
      alert('Debes agregar un título');
      return;
    }

    const material = {
      ...nuevoMaterial,
      id: Date.now(),
      fecha: new Date().toISOString()
    };

    const nuevosMateriales = [...materiales, material];
    setMateriales(nuevosMateriales);

    // Guardar en storage
    const clasesData = await Storage.get(`clases_${profesor.email}`);
    const clases = JSON.parse(clasesData.value);
    const claseIndex = clases.findIndex(c => c.nombre === clase.nombre);
    clases[claseIndex].materiales = nuevosMateriales;
    await Storage.set(`clases_${profesor.email}`, JSON.stringify(clases));

    setNuevoMaterial({ titulo: '', contenido: '', tipo: 'texto' });
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-lg border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{clase.nombre}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {userType === 'profesor' && (
          <div className="mb-6">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg font-semibold"
            >
              <Upload className="w-5 h-5" />
              Subir Material
            </button>
          </div>
        )}

        {/* Formulario de Upload */}
        {showUpload && userType === 'profesor' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Material</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={nuevoMaterial.titulo}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, titulo: e.target.value})}
                  placeholder="Ej: Tema 3 - Ecuaciones"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Material</label>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setNuevoMaterial({...nuevoMaterial, tipo: 'texto'})}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      nuevoMaterial.tipo === 'texto'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📝 Texto
                  </button>
                  <label className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                    nuevoMaterial.tipo !== 'texto'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    📎 Subir Archivo
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.pptx,.ppt,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {nuevoMaterial.tipo === 'texto' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido</label>
                  <textarea
                    value={nuevoMaterial.contenido}
                    onChange={(e) => setNuevoMaterial({...nuevoMaterial, contenido: e.target.value})}
                    rows="10"
                    placeholder="Escribe el contenido aquí..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              ) : nuevoMaterial.archivo && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <File className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">{nuevoMaterial.archivo.nombre}</p>
                    <p className="text-sm text-gray-600">Listo para subir</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={guardarMaterial}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                >
                  Guardar Material
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Materiales */}
        <div className="space-y-6">
          {materiales.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              alumno={alumno}
              userType={userType}
            />
          ))}
        </div>

        {materiales.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <FileText className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay materiales todavía</h3>
            <p className="text-gray-600">
              {userType === 'profesor' 
                ? 'Sube el primer material para tus alumnos'
                : 'Tu profesor aún no ha subido materiales'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Material Card Component con Adaptaciones
const MaterialCard = ({ material, alumno, userType }) => {
  const [fontSize, setFontSize] = useState(16);
  const [isReading, setIsReading] = useState(false);

  const necesidades = userType === 'alumno' ? alumno?.necesidades || [] : [];

  // Adaptar contenido según necesidades
  const adaptarContenido = (contenido) => {
    if (!contenido) return '';
    
    if (necesidades.includes('comprension')) {
      // Simplificar texto (primeras 4 oraciones)
      const oraciones = contenido.split('.').filter(o => o.trim());
      return oraciones.slice(0, 4).join('. ') + (oraciones.length > 4 ? '...' : '.');
    }
    
    return contenido;
  };

  const leerTexto = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(material.contenido || 'Material sin contenido de texto');
        utterance.lang = 'es-ES';
        utterance.rate = 0.85;
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  // Estilos adaptativos
  const getAdaptiveStyles = () => {
    let styles = 'bg-white rounded-2xl shadow-lg p-8 ';
    
    if (necesidades.includes('dislexia')) {
      styles += 'font-arial ';
    }
    
    if (necesidades.includes('tdah')) {
      styles += 'border-4 border-blue-300 ';
    }
    
    return styles;
  };

  const getTextStyles = () => {
    let styles = 'text-gray-800 ';
    
    if (necesidades.includes('dislexia')) {
      styles += 'tracking-wider leading-loose ';
    }
    
    return styles;
  };

  const getBackgroundColor = () => {
    if (necesidades.includes('dislexia')) return '#faf8f3';
    return 'white';
  };

  return (
    <div className={getAdaptiveStyles()} style={{ backgroundColor: getBackgroundColor() }}>
      {/* Header del Material */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{material.titulo}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {material.tipo === 'pdf' && <FileText className="w-4 h-4" />}
            {material.tipo === 'presentacion' && <Presentation className="w-4 h-4" />}
            {material.tipo === 'texto' && <File className="w-4 h-4" />}
            <span className="capitalize">{material.tipo}</span>
          </div>
        </div>

        {/* Controles de Accesibilidad */}
        {userType === 'alumno' && (
          <div className="flex gap-2">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Disminuir tamaño"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Aumentar tamaño"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={leerTexto}
              className={`p-2 rounded-lg transition-colors ${
                isReading ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Leer en voz alta"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Badges de Adaptación */}
      {userType === 'alumno' && necesidades.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {necesidades.includes('dislexia') && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              🧠 Modo Dislexia
            </span>
          )}
          {necesidades.includes('tdah') && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              💡 Modo Concentración
            </span>
          )}
          {necesidades.includes('visual') && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              👁️ Alto Contraste
            </span>
          )}
          {necesidades.includes('comprension') && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              📖 Versión Simplificada
            </span>
          )}
        </div>
      )}

      {/* Contenido del Material */}
      {material.tipo === 'texto' ? (
        <div
          className={getTextStyles()}
          style={{ fontSize: `${fontSize}px`, lineHeight: necesidades.includes('dislexia') ? '2' : '1.6' }}
        >
          {adaptarContenido(material.contenido)}
        </div>
      ) : material.archivo && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              {material.tipo === 'pdf' && <FileText className="w-8 h-8 text-white" />}
              {material.tipo === 'presentacion' && <Presentation className="w-8 h-8 text-white" />}
              {material.tipo === 'documento' && <File className="w-8 h-8 text-white" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{material.archivo.nombre}</p>
              <p className="text-sm text-gray-600">Archivo {material.tipo}</p>
            </div>
          </div>
          
          {material.tipo === 'pdf' && material.archivo.data && (
            <iframe
              src={material.archivo.data}
              className="w-full h-96 rounded-lg border-2 border-gray-200"
              title={material.titulo}
            />
          )}
          
          {(material.tipo === 'imagen' || material.archivo.tipo?.includes('image')) && (
            <img
              src={material.archivo.data}
              alt={material.titulo}
              className="w-full rounded-lg"
            />
          )}

          <div className="mt-4">
            <a
              href={material.archivo.data}
              download={material.archivo.nombre}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
            >
              <Upload className="w-5 h-5" />
              Descargar Archivo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// App Principal
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [navigationData, setNavigationData] = useState(null);

  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    setNavigationData(data);
  };

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    setCurrentView(type === 'profesor' ? 'dashboard-profesor' : 'dashboard-alumno');
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setCurrentView('home');
    setNavigationData(null);
  };

  return (
    <div className="min-h-screen">
      {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
      
      {currentView === 'login-alumno' && (
        <LoginAlumno
          onLogin={handleLogin}
          onBack={() => handleNavigate('home')}
        />
      )}
      
      {currentView === 'login-profesor' && (
        <LoginProfesor
          onLogin={handleLogin}
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('home')}
        />
      )}
      
      {currentView === 'registro-profesor' && (
        <RegistroProfesor
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('login-profesor')}
        />
      )}
      
      {currentView === 'dashboard-profesor' && user && (
        <ProfesorDashboard
          profesor={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentView === 'dashboard-alumno' && user && (
        <AlumnoDashboard
          alumno={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentView === 'crear-clase' && navigationData && (
        <CrearClase
          profesor={navigationData.profesor}
          onBack={() => handleNavigate('dashboard-profesor')}
        />
      )}
      
      {currentView === 'vista-clase' && navigationData && (
        <VistaClase
          clase={navigationData.clase}
          alumno={navigationData.alumno}
          profesor={navigationData.profesor}
          userType={navigationData.userType}
          onBack={() => handleNavigate(
            navigationData.userType === 'profesor' ? 'dashboard-profesor' : 'dashboard-alumno'
          )}
        />
      )}
    </div>
  );
}