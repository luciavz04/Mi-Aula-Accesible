import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Volume2,
  Pause,
  Play,
  Square,
  ZoomIn,
  ZoomOut,
  Download,
  Highlighter,
  BookOpen,
  Eye,
  Megaphone,
} from "lucide-react";
import htmlDocx from "html-docx-js/dist/html-docx";

function MaterialCard({ material, currentUser, userType }) {
  /* ------------------------ ESTADOS ------------------------ */
  const [fontSize, setFontSize] = useState(16);
  const [contenidoAdaptado, setContenidoAdaptado] = useState("");
  const [mostrarVersionCompleta, setMostrarVersionCompleta] = useState(false);
  const [modoOpenDyslexic, setModoOpenDyslexic] = useState(false);
  const [lecturaEnfocada, setLecturaEnfocada] = useState(false);

  const [voz, setVoz] = useState(null);
  const [listaVoces, setListaVoces] = useState([]);
  const [velocidad, setVelocidad] = useState(1);

  const sintetizador = window.speechSynthesis;
  const utterRef = useRef(null);
  const [estadoLectura, setEstadoLectura] = useState("stop");

  const esAnuncio = material.esAnuncio === true;

  /* ==========================================================================================
        ADAPTACIÓN DE CONTENIDO - CORREGIDO
  ========================================================================================== */
  const adaptarContenido = useCallback(() => {
    const necesidades = currentUser?.necesidades || [];

    // Para anuncios, usamos directamente el contenido
    if (esAnuncio) {
      setContenidoAdaptado(material.contenido || "Sin contenido");
      return;
    }

    // Para materiales, verificamos las adaptaciones
    const baseTexto = material.auto_adaptaciones?.textoBase ||
                      material.contenido ||
                      "Contenido no disponible";

    const simplificada = material.auto_adaptaciones?.versionSimplificada;
    const lecturaFacil = material.auto_adaptaciones?.lecturaFacil;

    let contenido = baseTexto;

    // Si es profesor, mostramos siempre el texto base
    if (userType === "profesor") {
      setContenidoAdaptado(baseTexto);
      return;
    }

    // Adaptaciones para alumnos
    if (necesidades.includes("Dislexia") && lecturaFacil) {
      contenido = lecturaFacil;
    }

    if (
      necesidades.includes("Dificultad de Comprensión") &&
      !mostrarVersionCompleta &&
      simplificada
    ) {
      contenido = simplificada;
    }

    setContenidoAdaptado(contenido);

    // Activar modo dyslexic si el alumno lo necesita
    if (necesidades.includes("Dislexia")) {
      setModoOpenDyslexic(true);
    }
  }, [material, esAnuncio, currentUser, mostrarVersionCompleta, userType]);

  useEffect(() => {
    adaptarContenido();
  }, [adaptarContenido]);

  /* ==========================================================================================
        LECTURA EN VOZ ALTA
  ========================================================================================== */
  useEffect(() => {
    function cargarVoces() {
      const voces = window.speechSynthesis.getVoices();
      setListaVoces(voces);
      const vozEsp = voces.find((v) => v.lang.startsWith("es"));
      setVoz(vozEsp || voces[0]);
    }
    cargarVoces();
    window.speechSynthesis.onvoiceschanged = cargarVoces;
  }, []);

  const iniciarLectura = () => {
    if (!contenidoAdaptado) return;
    sintetizador.cancel();

    const u = new SpeechSynthesisUtterance(contenidoAdaptado);
    u.voice = voz;
    u.rate = velocidad;
    u.lang = voz?.lang || "es-ES";

    utterRef.current = u;

    sintetizador.speak(u);
    setEstadoLectura("playing");
  };

  const pausarLectura = () => {
    sintetizador.pause();
    setEstadoLectura("paused");
  };

  const reanudarLectura = () => {
    sintetizador.resume();
    setEstadoLectura("playing");
  };

  const detenerLectura = () => {
    sintetizador.cancel();
    setEstadoLectura("stop");
  };

  /* ==========================================================================================
        DESCARGA DOCX
  ========================================================================================== */
  const descargarAdaptado = () => {
    if (esAnuncio) return;

    const html = `
      <html>
      <head>
        <style>
          body {
            font-family: ${
              modoOpenDyslexic ? "'OpenDyslexic', Arial" : "Arial"
            };
            font-size: 18px;
            line-height: 1.7;
            padding: 20px;
            background: white;
            color: #111827;
          }
          p { margin-bottom: 14px; }
        </style>
      </head>
      <body>
        ${contenidoAdaptado
          .split("\n")
          .map((p) => `<p>${p}</p>`)
          .join("")}
      </body>
      </html>
    `;

    const blob = htmlDocx.asBlob(html);
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `${material.titulo}-adaptado.docx`;
    enlace.click();
  };

  /* ==========================================================================================
        UI
  ========================================================================================== */

  const estiloTexto = {
    fontFamily: modoOpenDyslexic ? "OpenDyslexic, Arial" : "Arial",
    fontSize: `${fontSize}px`,
    lineHeight: "1.7",
    backgroundColor: lecturaEnfocada ? "#000" : "#F9FAFB",
    color: lecturaEnfocada ? "white" : "#1F2937",
    padding: "16px",
    borderRadius: "12px",
  };

  return (
    <div className="shadow-xl rounded-2xl bg-white overflow-hidden mb-8">

      {/* CABECERA */}
      <div className={`p-6 text-white ${esAnuncio ? 'bg-yellow-600' : 'bg-indigo-600'}`}>
        <h3 className="text-2xl font-bold flex items-center gap-2">
          {esAnuncio ? (
            <>
              <Megaphone className="w-6 h-6" />
              Anuncio de Clase
            </>
          ) : (
            <>
              <BookOpen className="w-6 h-6" />
              {material.titulo}
            </>
          )}
        </h3>

        <p className="opacity-80 text-sm mt-1">
          {material.fecha_subida
            ? new Date(material.fecha_subida).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Fecha no disponible"}
        </p>
      </div>

      {/* CONTENIDO */}
      <div className="p-6 space-y-6">

        {/* Opciones accesibles (solo para materiales y alumnos) */}
        {!esAnuncio && userType === "alumno" && (
          <div className="flex flex-wrap gap-3 border-b pb-4">
            <button
              onClick={() => setFontSize((p) => Math.max(12, p - 2))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Reducir tamaño de texto"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setFontSize((p) => Math.min(32, p + 2))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Aumentar tamaño de texto"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setModoOpenDyslexic((v) => !v)}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                modoOpenDyslexic ? 'bg-indigo-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Fuente para dislexia"
            >
              <Eye className="w-4 h-4" />
              Dyslexic
            </button>

            <button
              onClick={() => setLecturaEnfocada((v) => !v)}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                lecturaEnfocada ? 'bg-indigo-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Modo alto contraste"
            >
              <Highlighter className="w-4 h-4" />
              Enfocar
            </button>
          </div>
        )}

        {/* Lectura en voz alta (para alumnos) */}
        {userType === "alumno" && (
          <div className="space-y-3 border-b pb-4">
            {estadoLectura === "stop" && (
              <button
                onClick={iniciarLectura}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Volume2 className="w-4 h-4" />
                Leer en voz alta
              </button>
            )}

            {estadoLectura === "playing" && (
              <button
                onClick={pausarLectura}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition"
              >
                <Pause className="w-4 h-4" /> Pausar
              </button>
            )}

            {estadoLectura === "paused" && (
              <button
                onClick={reanudarLectura}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 transition"
              >
                <Play className="w-4 h-4" /> Reanudar
              </button>
            )}

            {estadoLectura !== "stop" && (
              <button
                onClick={detenerLectura}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
              >
                <Square className="w-4 h-4" /> Detener
              </button>
            )}
          </div>
        )}

        {/* TEXTO */}
        <div style={estiloTexto} className="whitespace-pre-wrap">
          {contenidoAdaptado}
        </div>

        {/* Versión simplificada (solo para alumnos con dificultad de comprensión) */}
        {currentUser?.necesidades?.includes("Dificultad de Comprensión") &&
          !esAnuncio && (
            <button
              onClick={() =>
                setMostrarVersionCompleta(!mostrarVersionCompleta)
              }
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition"
            >
              {mostrarVersionCompleta
                ? "Ver versión simplificada"
                : "Ver versión completa"}
            </button>
          )}

        {/* DESCARGA (solo materiales, no anuncios) */}
        {!esAnuncio && userType === "alumno" && (
          <button
            onClick={descargarAdaptado}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Download className="w-5 h-5" />
            Descargar documento adaptado
          </button>
        )}
      </div>
    </div>
  );
}

export default MaterialCard;