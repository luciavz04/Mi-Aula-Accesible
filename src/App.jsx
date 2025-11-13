import React, { useState } from "react";
import HomePage from "./components/HomePage";
import LoginProfesor from "./components/Auth/LoginProfesor";
import RegistroProfesor from "./components/Auth/RegistroProfesor";
import ProfesorDashboard from "./components/Dashboard/ProfesorDashboard";
import RegistrarAlumno from "./components/Dashboard/RegistrarAlumno";
import CrearClase from "./components/Dashboard/CrearClase";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
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
    </div>
  );
}

export default App;
