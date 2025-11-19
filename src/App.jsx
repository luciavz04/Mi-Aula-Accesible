import React, { useState } from "react";
import HomePage from "./components/HomePage";
import LoginProfesor from "./components/Auth/LoginProfesor";
import LoginAlumno from "./components/Auth/LoginAlumno";
import RegistroProfesor from "./components/Auth/RegistroProfesor";
import ProfesorDashboard from "./components/Dashboard/ProfesorDashboard";
import AlumnoDashboard from "./components/Dashboard/AlumnoDashboard";
import RegistrarAlumno from "./components/Dashboard/RegistrarAlumno";
import CrearClase from "./components/Dashboard/CrearClase";
import VistaClase from "./components/Clase/VistaClase";
import ListaAlumnos from "./components/Dashboard/ListaAlumnos";
import EditarClase from "./components/Dashboard/EditarClase";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);
  const [claseParaEditar, setClaseParaEditar] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setSelectedClase(null);
    setClaseParaEditar(null);
    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Página de inicio */}
      {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}

      {/* Login profesor */}
      {currentPage === "login-profesor" && (
        <LoginProfesor
          setCurrentPage={setCurrentPage}
          setCurrentUser={setCurrentUser}
          setUserType={setUserType}
        />
      )}

      {/* Login alumno */}
      {currentPage === "login-alumno" && (
        <LoginAlumno
          setCurrentPage={setCurrentPage}
          setCurrentUser={setCurrentUser}
          setUserType={setUserType}
        />
      )}

      {/* Registro profesor */}
      {currentPage === "registro-profesor" && (
        <RegistroProfesor setCurrentPage={setCurrentPage} />
      )}

      {/* Dashboard profesor */}
      {currentPage === "profesor-dashboard" && currentUser && (
        <ProfesorDashboard
          currentUser={currentUser}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          setSelectedClase={setSelectedClase}
          setClaseParaEditar={setClaseParaEditar} // ✅ ESTA LÍNEA ES CLAVE
        />
      )}

      {/* Registrar alumno */}
      {currentPage === "registrar-alumno" && (
        <RegistrarAlumno setCurrentPage={setCurrentPage} />
      )}

      {/* Crear nueva clase */}
      {currentPage === "crear-clase" && (
        <CrearClase currentUser={currentUser} setCurrentPage={setCurrentPage} />
      )}

      {/* Dashboard alumno */}
      {currentPage === "alumno-dashboard" && currentUser && (
        <AlumnoDashboard
          currentUser={currentUser}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          setSelectedClase={setSelectedClase}
        />
      )}

      {/* Lista de alumnos */}
      {currentPage === "lista-alumnos" && (
        <ListaAlumnos setCurrentPage={setCurrentPage} />
      )}

      {/* Editar clase */}
      {currentPage === "editar-clase" && claseParaEditar && (
        <EditarClase clase={claseParaEditar} setCurrentPage={setCurrentPage} />
      )}

      {/* Vista clase (profesor o alumno) */}
      {currentPage === "vista-clase" && selectedClase && (
        <VistaClase
          clase={selectedClase}
          currentUser={currentUser}
          userType={userType}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

export default App;
