import React, { useState, useEffect } from 'react';
import { Volume2, ZoomIn, ZoomOut, Eye, Lightbulb } from 'lucide-react';

function MaterialCard({ material, currentUser, userType }) {
  const [fontSize, setFontSize] = useState(16);
  const [contenidoAdaptado, setContenidoAdaptado] = useState('');
  const [adaptacionesActivas, setAdaptacionesActivas] = useState([]);

  useEffect(() => {
    adaptarContenido();
  }, [material, currentUser]);

  const adaptarContenido = () => {
    if (userType === 'profesor' || !currentUser.necesidades || currentUser.necesidades.length === 0) {
      setContenidoAdaptado(material.contenido);
      return;
    }

    let contenido = material.contenido;
    const adaptaciones = [];

    // Adaptación para Dislexia
    if (currentUser.necesidades.includes('Dislexia')) {
      adaptaciones.push('Fuente legible');
      adaptaciones.push('Mayor espaciado');
    }

    // Adaptación para TDAH
    if (currentUser.necesidades.includes('TDAH')) {
      adaptaciones.push('Modo concentración');
    }

    // Adaptación para Discapacidad Visual
    if (currentUser.necesidades.includes('Discapacidad Visual')) {
      adaptaciones.push('Fuente ampliada');
      adaptaciones.push('Alto contraste');
    }

    // Adaptación para Dificultad de Comprensión
    if (currentUser.necesidades.includes('Dificultad de Comprensión')) {
      const oraciones = contenido.split('.').filter(o => o.trim());
      if (oraciones.length > 4) {
        contenido = oraciones.slice(0, 4).join('.') + '.';
        adaptaciones.push('Versión simplificada');
      }
    }

    setContenidoAdaptado(contenido);
    setAdaptacionesActivas(adaptaciones);
  };

  const leerEnVozAlta = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(contenidoAdaptado);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta lectura en voz alta');
    }
  };

  const getEstilosPorNecesidades = () => {
    let estilos = {
      fontSize: `${fontSize}px`,
      lineHeight: '1.6'
    };

    if (!currentUser.necesidades || currentUser.necesidades.length === 0) {
      return estilos;
    }

    // Dislexia
    if (currentUser.necesidades.includes('Dislexia')) {
      estilos = {
        ...estilos,
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.12em',
        lineHeight: '2',
        backgroundColor: '#faf8f3',
        textAlign: 'left'
      };
    }

    // TDAH
    if (currentUser.necesidades.includes('TDAH')) {
      estilos = {
        ...estilos,
        border: '3px solid #3b82f6',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
      };
    }

    // Discapacidad Visual
    if (currentUser.necesidades.includes('Discapacidad Visual')) {
      estilos = {
        ...estilos,
        fontSize: `${fontSize + 4}px`,
        fontWeight: '500',
        color: '#000000',
        backgroundColor: '#ffffff'
      };
    }

    return estilos;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {material.titulo}
        </h3>
        <p className="text-indigo-100 text-sm">
          Subido el {new Date(material.fechaSubida).toLocaleDateString()}
        </p>
      </div>

      <div className="p-6">
        {/* Controles de accesibilidad para alumnos */}
        {userType === 'alumno' && (
          <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              title="Reducir tamaño"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="text-sm">A-</span>
            </button>

            <button
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              title="Aumentar tamaño"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm">A+</span>
            </button>

            <button
              onClick={leerEnVozAlta}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              title="Leer en voz alta"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">Leer</span>
            </button>

            {adaptacionesActivas.length > 0 && (
              <div className="flex items-center space-x-2 ml-auto">
                <Eye className="w-4 h-4 text-green-600" />
                <div className="flex flex-wrap gap-1">
                  {adaptacionesActivas.map((adaptacion, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {adaptacion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contenido del material */}
        <div
          className="p-6 rounded-lg transition-all"
          style={getEstilosPorNecesidades()}
        >
          {contenidoAdaptado}
        </div>

        {/* Indicador de versión simplificada */}
        {userType === 'alumno' && 
         currentUser.necesidades?.includes('Dificultad de Comprensión') && 
         adaptacionesActivas.includes('Versión simplificada') && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
            <Lightbulb className="w-5 h-5" />
            <span>Este contenido ha sido simplificado para facilitar tu comprensión</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialCard;