import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  ZoomIn,
  ZoomOut,
  Eye,
  Lightbulb,
  Download,
  Image as ImageIcon,
  FileText,
  FileAudio,
  FileVideo,
  BellRing,
  Contrast,
  Target,
  Clock,
  Maximize2,
  X
} from 'lucide-react';

function MaterialCard({ material, currentUser, userType }) {
  const [fontSize, setFontSize] = useState(16);
  const [contenidoAdaptado, setContenidoAdaptado] = useState('');
  const [adaptacionesActivas, setAdaptacionesActivas] = useState([]);
  const [mostrarVersionCompleta, setMostrarVersionCompleta] = useState(false);
  const [modoConcentracion, setModoConcentracion] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [temporizadorRestante, setTemporizadorRestante] = useState(null);
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [zoomImagen, setZoomImagen] = useState(1.2);
  const [conversionesDescargables, setConversionesDescargables] = useState([]);

  const adaptarContenido = useCallback(() => {
    const necesidades = currentUser?.necesidades || [];
    const baseTexto =
      material.autoAdaptaciones?.textoBase ||
      material.contenido ||
      material.descripcion ||
      `Vista previa del archivo ${material.archivo?.nombre || ''}`;

    const resumenAutomatico =
      material.autoAdaptaciones?.resumen || material.resumen;

    const versionSimplificada =
      material.autoAdaptaciones?.versionSimplificada ||
      resumenAutomatico;

    const lecturaFacil = material.autoAdaptaciones?.lecturaFacil;

    const adaptaciones = [];
    if (userType === 'profesor' || necesidades.length === 0) {
      setContenidoAdaptado(baseTexto);
      setAdaptacionesActivas([]);
      return;
    }

    let contenido = baseTexto;

    if (necesidades.includes('Dislexia')) {
      if (lecturaFacil) contenido = lecturaFacil;
      adaptaciones.push('Lectura fácil automática');
      adaptaciones.push('Fuente legible');
    }

    if (necesidades.includes('TDAH')) {
      adaptaciones.push('Modo concentración disponible');
      adaptaciones.push('Bloques breves generados');
    }

    if (necesidades.includes('Discapacidad Visual')) {
      adaptaciones.push('Fuente ampliada');
      adaptaciones.push('Contraste optimizado');
    }

    if (
      necesidades.includes('Dificultad de Comprensión') &&
      !mostrarVersionCompleta
    ) {
      contenido = versionSimplificada;
      adaptaciones.push('Versión simplificada');
    }

    if (
      necesidades.includes('Discapacidad Auditiva') &&
      material.autoAdaptaciones?.transcripcion
    ) {
      adaptaciones.push('Transcripción disponible');
    }

    setContenidoAdaptado(contenido);
    setAdaptacionesActivas(adaptaciones);
  }, [currentUser, material, mostrarVersionCompleta, userType]);

  useEffect(() => {
    adaptarContenido();
  }, [adaptarContenido]);

  useEffect(() => {
    if (currentUser?.necesidades?.includes('Discapacidad Visual')) {
      setAltoContraste(true);
    }
  }, [currentUser]);

  /* ---------------------------------------------------------
      TEMPORIZADOR
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!temporizadorActivo) return;

    const intervalo = setInterval(() => {
      setTemporizadorRestante((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalo);
          setTemporizadorActivo(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [temporizadorActivo]);

  /* ---------------------------------------------------------
      GENERAR ARCHIVOS ACCESIBLES DESCARGABLES
  ---------------------------------------------------------- */
  useEffect(() => {
    const conversiones =
      material.autoAdaptaciones?.conversionesAccesibles || [];

    const urls = conversiones.map((c) => {
      const mime = c.tipo === 'html' ? 'text/html' : 'text/plain';
      const blob = new Blob([c.contenido], {
        type: `${mime};charset=utf-8`,
      });

      return {
        ...c,
        url: URL.createObjectURL(blob),
        extensionDescarga: c.tipo === 'html' ? 'html' : 'txt',
      };
    });

    setConversionesDescargables(urls);

    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [material.autoAdaptaciones?.conversionesAccesibles]);
  const leerEnVozAlta = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura en voz alta');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(contenidoAdaptado);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const iniciarTemporizador = () => {
    setTemporizadorRestante(600);
    setTemporizadorActivo(true);
  };

  const formatear = () => {
    if (!temporizadorRestante) return '10:00';
    const m = String(Math.floor(temporizadorRestante / 60)).padStart(2, '0');
    const s = String(temporizadorRestante % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
        <h3 className="text-xl font-bold">{material.titulo}</h3>
        <p className="text-sm opacity-80">
          Fecha: {new Date(material.fechaSubida).toLocaleDateString()}
        </p>
      </div>

      <div className="p-6">
        {/* Botones de accesibilidad */}
        {userType === 'alumno' && (
          <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b">
            <button
              onClick={() => setFontSize(fontSize - 2)}
              className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <ZoomOut className="w-4 h-4" /> A-
            </button>

            <button
              onClick={() => setFontSize(fontSize + 2)}
              className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <ZoomIn className="w-4 h-4" /> A+
            </button>

            <button
              onClick={leerEnVozAlta}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" /> Leer
            </button>

            {currentUser?.necesidades?.includes('TDAH') && (
              <button
                onClick={iniciarTemporizador}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {formatear()}
              </button>
            )}
          </div>
        )}

        {/* CONTENIDO ADAPTADO */}
        <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.7' }}>
          {contenidoAdaptado}
        </div>

        {/* VERSION SIMPLIFICADA */}
        {currentUser?.necesidades?.includes(
          'Dificultad de Comprensión'
        ) && (
          <button
            onClick={() =>
              setMostrarVersionCompleta(!mostrarVersionCompleta)
            }
            className="mt-3 text-indigo-600 font-semibold"
          >
            {mostrarVersionCompleta
              ? 'Ver versión simplificada'
              : 'Ver versión completa'}
          </button>
        )}

        {/* DESCARGABLES ACCESIBLES */}
        {conversionesDescargables.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Versiones accesibles
            </p>

            {conversionesDescargables.map((c) => (
              <a
                key={c.id}
                href={c.url}
                download={`${material.titulo}-${c.id}.${c.extensionDescarga}`}
                className="block text-indigo-600 font-medium text-sm mb-2"
              >
                {c.titulo}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialCard;
