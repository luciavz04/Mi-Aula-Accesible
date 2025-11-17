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
    const baseTexto = material.autoAdaptaciones?.textoBase ||
      material.contenido ||
      material.descripcion ||
      `Vista previa del archivo ${material.archivo?.nombre || ''}`;
    const resumenAutomatico = material.autoAdaptaciones?.resumen || material.resumen;
    const versionSimplificada = material.autoAdaptaciones?.versionSimplificada || resumenAutomatico;
    const lecturaFacil = material.autoAdaptaciones?.lecturaFacil;
    const adaptaciones = [];

    if (userType === 'profesor' || necesidades.length === 0) {
      setContenidoAdaptado(baseTexto);
      setAdaptacionesActivas([]);
      return;
    }

    let contenido = baseTexto;

    if (necesidades.includes('Dislexia')) {
      if (lecturaFacil) {
        contenido = lecturaFacil;
      }
      adaptaciones.push('Lectura fácil automática');
      adaptaciones.push('Fuente legible');
    }

    if (necesidades.includes('TDAH')) {
      adaptaciones.push('Modo concentración disponible');
      adaptaciones.push('Bloques cortos generados');
    }

    if (necesidades.includes('Discapacidad Visual')) {
      adaptaciones.push('Fuente ampliada');
      adaptaciones.push('Contraste optimizado');
    }

    if (necesidades.includes('Dificultad de Comprensión') && !mostrarVersionCompleta) {
      if (versionSimplificada) {
        contenido = versionSimplificada;
        adaptaciones.push('Versión simplificada automática');
      }
    }

    if (necesidades.includes('Discapacidad Auditiva') && (material.autoAdaptaciones?.transcripcion || material.transcripcion)) {
      adaptaciones.push('Transcripción automática disponible');
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

  useEffect(() => {
    if (!temporizadorActivo) {
      return;
    }

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

  useEffect(() => {
    const conversiones = material.autoAdaptaciones?.conversionesAccesibles || [];

    const urls = conversiones
      .filter((conversion) => conversion?.contenido)
      .map((conversion) => {
        const mime = conversion.tipo === 'html' ? 'text/html' : 'text/plain';
        const blob = new Blob([conversion.contenido], { type: `${mime};charset=utf-8` });
        return {
          ...conversion,
          url: URL.createObjectURL(blob),
          extensionDescarga: conversion.tipo === 'html' ? 'html' : 'txt'
        };
      });

    setConversionesDescargables(urls);

    return () => {
      urls.forEach((conversion) => URL.revokeObjectURL(conversion.url));
    };
  }, [material.autoAdaptaciones?.conversionesAccesibles]);

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

  const iniciarTemporizador = () => {
    setTemporizadorRestante(10 * 60);
    setTemporizadorActivo(true);
  };

  const formatearTemporizador = () => {
    if (!temporizadorRestante) return '10:00';
    const minutos = String(Math.floor(temporizadorRestante / 60)).padStart(2, '0');
    const segundos = String(temporizadorRestante % 60).padStart(2, '0');
    return `${minutos}:${segundos}`;
  };

  const abrirImagenAmpliada = (src, alt) => {
    setImagenAmpliada({ src, alt });
    setZoomImagen(1.5);
  };

  const cerrarImagenAmpliada = () => {
    setImagenAmpliada(null);
    setZoomImagen(1.2);
  };

  const ajustarZoomImagen = (delta) => {
    setZoomImagen((prev) => {
      const siguiente = prev + delta;
      if (siguiente < 1) return 1;
      if (siguiente > 3) return 3;
      return Number(siguiente.toFixed(2));
    });
  };

  const construirVisorDocumentos = (recurso) => {
    if (!recurso) return null;
    const base = 'https://docs.google.com/gview?embedded=1&url=';
    return `${base}${encodeURIComponent(recurso)}`;
  };

  useEffect(() => {
    if (!imagenAmpliada) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        cerrarImagenAmpliada();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imagenAmpliada]);

  const renderArchivoAdjunto = () => {
    if (!material.archivo) return null;

    const { tipo, dataUrl, nombre, url, extension } = material.archivo;
    const recurso = url || dataUrl;
    const extensionInferida = (extension || nombre?.split('.')?.pop() || '').toLowerCase();

    if (!recurso) {
      return (
        <div className="mt-4 text-sm text-gray-500">
          El archivo original está disponible para descargar desde el panel del profesor.
        </div>
      );
    }

    if (tipo?.startsWith('image/')) {
      return (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Imagen adjunta
          </p>
          <div className="mt-2">
            <img
              src={recurso}
              alt={`Material visual ${nombre}`}
              className="rounded-lg max-h-80 w-full object-contain cursor-zoom-in"
              onClick={() => abrirImagenAmpliada(recurso, `Vista ampliada de ${nombre}`)}
            />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => abrirImagenAmpliada(recurso, `Vista ampliada de ${nombre}`)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100"
              >
                <Maximize2 className="w-4 h-4" /> Ampliar imagen
              </button>
              <a
                href={recurso}
                download={nombre}
                className="text-sm text-indigo-600 font-semibold"
              >
                Descargar original
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (tipo?.startsWith('audio/')) {
      return (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileAudio className="w-4 h-4" /> Audio accesible
          </p>
          <audio controls className="mt-2 w-full">
            <track kind="captions" srcLang="es" />
            <source src={recurso} type={tipo} />
            Tu navegador no soporta audio embebido.
          </audio>
        </div>
      );
    }

    const esDocumentoWord = ['doc', 'docx'].includes(extensionInferida) || tipo?.includes('msword');
    const esPresentacion = ['ppt', 'pptx'].includes(extensionInferida) || tipo?.includes('presentation');
    const esTexto = ['pdf', 'txt', 'rtf'].includes(extensionInferida) || tipo?.includes('pdf') || tipo === 'text/plain';

    if (esDocumentoWord || esPresentacion || esTexto) {
      const viewerUrl = construirVisorDocumentos(recurso);

      return (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Documento accesible
          </p>
          <iframe
            title={`Documento ${nombre}`}
            src={viewerUrl || recurso}
            className="w-full h-72 mt-2 rounded-lg border"
          />
        </div>
      );
    }

    if (tipo?.startsWith('video/')) {
      return (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileVideo className="w-4 h-4" /> Video con apoyo
          </p>
          <video controls className="mt-2 w-full rounded-lg">
            <track kind="captions" srcLang="es" />
            <source src={recurso} type={tipo} />
            Tu navegador no soporta video embebido.
          </video>
        </div>
      );
    }

    return (
      <div className="mt-4 flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Download className="w-4 h-4" />
          <span>{nombre}</span>
        </div>
        <a
          href={recurso}
          download={nombre}
          className="text-indigo-600 text-sm font-medium"
        >
          Descargar
        </a>
      </div>
    );
  };

  const getEstilosPorNecesidades = () => {
    let estilos = {
      fontSize: `${fontSize}px`,
      lineHeight: '1.6'
    };

    const necesidades = currentUser?.necesidades || [];

    if (necesidades.length === 0) {
      return estilos;
    }

    // Dislexia
    if (necesidades.includes('Dislexia')) {
      estilos = {
        ...estilos,
        fontFamily: '"Lexend", "Arial", sans-serif',
        letterSpacing: '0.12em',
        lineHeight: '2',
        backgroundColor: material.autoAdaptaciones?.sugerenciasEstilos?.colorSuave || '#f5f1e6',
        textAlign: 'left'
      };
    }

    // TDAH
    if (necesidades.includes('TDAH')) {
      estilos = {
        ...estilos,
        border: '3px solid #3b82f6',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
      };
    }

    // Discapacidad Visual
    if (necesidades.includes('Discapacidad Visual') || altoContraste) {
      estilos = {
        ...estilos,
        fontSize: `${fontSize + 4}px`,
        fontWeight: '500',
        color: '#000000',
        backgroundColor: '#ffffff'
      };
    }

    if (altoContraste) {
      estilos = {
        ...estilos,
        backgroundColor: material.autoAdaptaciones?.sugerenciasEstilos?.colorAltoContraste || '#000000',
        color: '#ffffff',
        border: '4px solid #facc15'
      };
    }

    return estilos;
  };

  const necesita = (etiqueta) => currentUser?.necesidades?.includes(etiqueta);

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden ${modoConcentracion ? 'ring-4 ring-indigo-400' : ''}`}
      role="article"
      tabIndex={0}
      aria-label={`Material ${material.titulo}`}
    >
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {material.titulo}
        </h3>
        <p className="text-indigo-100 text-sm">
          Subido el {new Date(material.fechaSubida).toLocaleDateString()}
        </p>
      </div>

      <div className={`p-6 ${modoConcentracion ? 'bg-indigo-50' : ''}`}>
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

            {necesita('TDAH') && (
              <button
                onClick={() => setModoConcentracion(!modoConcentracion)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  modoConcentracion ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-pressed={modoConcentracion}
              >
                <Target className="w-4 h-4" />
                <span className="text-sm">Modo concentración</span>
              </button>
            )}

            {necesita('Discapacidad Visual') && (
              <button
                onClick={() => setAltoContraste(!altoContraste)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  altoContraste ? 'bg-yellow-400 text-black' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-pressed={altoContraste}
              >
                <Contrast className="w-4 h-4" />
                <span className="text-sm">Alto contraste</span>
              </button>
            )}

            {necesita('TDAH') && (
              <button
                onClick={() => {
                  iniciarTemporizador();
                }}
                className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">Temporizador {formatearTemporizador()}</span>
              </button>
            )}

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

        {necesita('Dificultad de Comprensión') && (
          <button
            onClick={() => setMostrarVersionCompleta(!mostrarVersionCompleta)}
            className="mt-3 text-sm text-indigo-600 font-semibold"
          >
            {mostrarVersionCompleta ? 'Ver versión simplificada' : 'Ver versión completa'}
          </button>
        )}

        {(material.autoAdaptaciones?.resumen || material.resumen) && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">Resumen accesible</p>
            <p className="text-blue-900 text-sm">{material.autoAdaptaciones?.resumen || material.resumen}</p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-600">
          <Lightbulb className="w-4 h-4 text-amber-500" /> Formato original: {material.autoAdaptaciones?.formatoFuente || 'No especificado'}
        </div>

        {renderArchivoAdjunto()}

        {conversionesDescargables.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Versiones accesibles generadas automáticamente
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {conversionesDescargables.map((conversion) => (
                <div
                  key={conversion.id}
                  className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/40 flex flex-col gap-3"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900">{conversion.titulo}</p>
                    <p className="text-sm text-gray-600">{conversion.descripcion}</p>
                  </div>
                  {conversion.url && (
                    <a
                      href={conversion.url}
                      download={`${material.titulo || 'material'}-${conversion.id}.${conversion.extensionDescarga}`}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Descargar versión accesible
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(material.autoAdaptaciones?.transcripcion || material.transcripcion) && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <BellRing className="w-4 h-4" /> Transcripción / subtítulos
            </p>
            <p className="text-emerald-900 text-sm mt-1">{material.autoAdaptaciones?.transcripcion || material.transcripcion}</p>
          </div>
        )}

        {/* Indicador de versión simplificada */}
        {userType === 'alumno' &&
         currentUser?.necesidades?.includes('Dificultad de Comprensión') &&
         adaptacionesActivas.some((adaptacion) => adaptacion.includes('simplificada')) && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
            <Lightbulb className="w-5 h-5" />
            <span>Este contenido ofrece una versión simplificada con apoyo visual.</span>
          </div>
        )}

        {userType === 'alumno' && currentUser?.necesidades?.includes('Discapacidad Auditiva') && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-blue-800 bg-blue-50 p-3 rounded-lg" aria-live="polite">
            <BellRing className="w-5 h-5" />
            <span>Notificación visual: nuevo material disponible para ti.</span>
          </div>
        )}
      </div>

      {imagenAmpliada && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label={imagenAmpliada.alt}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Vista ampliada</p>
              <button
                onClick={cerrarImagenAmpliada}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Cerrar vista ampliada"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => ajustarZoomImagen(-0.2)}
                className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2 text-sm font-medium"
              >
                <ZoomOut className="w-4 h-4" /> Alejar
              </button>
              <button
                onClick={() => ajustarZoomImagen(0.2)}
                className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2 text-sm font-medium"
              >
                <ZoomIn className="w-4 h-4" /> Acercar
              </button>
              <span className="text-sm text-gray-500 self-center">{Math.round(zoomImagen * 100)}%</span>
            </div>
            <div className="relative w-full max-h-[70vh] overflow-auto rounded-xl border">
              <img
                src={imagenAmpliada.src}
                alt={imagenAmpliada.alt}
                className="w-full h-full object-contain"
                style={{ transform: `scale(${zoomImagen})`, transformOrigin: 'center' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialCard;