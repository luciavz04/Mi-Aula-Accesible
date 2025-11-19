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


function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setSelectedClase(null);
    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}

      {currentPage === "login-profesor" && (
        <LoginProfesor
          setCurrentPage={setCurrentPage}
          setCurrentUser={setCurrentUser}
          setUserType={setUserType}
        />
      )}

      {currentPage === "login-alumno" && (
        <LoginAlumno
          setCurrentPage={setCurrentPage}
          setCurrentUser={setCurrentUser}
          setUserType={setUserType}
        />
      )}

      {currentPage === "registro-profesor" && (
        <RegistroProfesor setCurrentPage={setCurrentPage} />
      )}

      {currentPage === "profesor-dashboard" && currentUser && (
        <ProfesorDashboard
          currentUser={currentUser}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          setSelectedClase={setSelectedClase}
        />
      )}

      {currentPage === "registrar-alumno" && (
        <RegistrarAlumno setCurrentPage={setCurrentPage} />
      )}

      {currentPage === "crear-clase" && (
        <CrearClase currentUser={currentUser} setCurrentPage={setCurrentPage} />
      )}

      {currentPage === "alumno-dashboard" && currentUser && (
        <AlumnoDashboard
          currentUser={currentUser}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          setSelectedClase={setSelectedClase}
        />
      )}

      {currentPage === "lista-alumnos" && (
  <ListaAlumnos setCurrentPage={setCurrentPage} />
)}


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