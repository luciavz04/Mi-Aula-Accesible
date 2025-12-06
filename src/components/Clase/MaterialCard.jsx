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
  Megaphone,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import htmlDocx from "html-docx-js/dist/html-docx";

function MaterialCard({ material, currentUser, userType }) {
  const [fontSize, setFontSize] = useState(16);
  const [contenidoAdaptado, setContenidoAdaptado] = useState("");
  const [mostrarVersionCompleta, setMostrarVersionCompleta] = useState(false);
  const [lecturaEnfocada, setLecturaEnfocada] = useState(false);
  const [contenidoVisible, setContenidoVisible] = useState(true);

  const [voz, setVoz] = useState(null);
  const [estadoLectura, setEstadoLectura] = useState("stop");
  const sintetizador = window.speechSynthesis;
  const utterRef = useRef(null);

  const esAnuncio = material.esAnuncio === true;

  /* ---------------------------- ADAPTACIÓN ---------------------------- */
  const adaptarContenido = useCallback(() => {
    const necesidades = currentUser?.necesidades || [];

    const base = material.auto_adaptaciones?.textoBase || material.contenido || "";
    const simplificada = material.auto_adaptaciones?.versionSimplificada;

    let texto = base;

    if (userType === "profesor") {
      setContenidoAdaptado(base);
      return;
    }

    if (
      necesidades.includes("Dificultad de Comprensión") &&
      !mostrarVersionCompleta &&
      simplificada
    )
      texto = simplificada;

    setContenidoAdaptado(texto);
  }, [material, currentUser, mostrarVersionCompleta, userType]);

  useEffect(() => {
    adaptarContenido();
  }, [adaptarContenido]);

  /* ---------------------------- LECTURA EN VOZ ALTA ---------------------------- */
  useEffect(() => {
    function cargarVoces() {
      const voces = sintetizador.getVoices();
      const esp = voces.find((v) => v.lang.startsWith("es"));
      setVoz(esp || voces[0]);
    }

    cargarVoces();
    sintetizador.onvoiceschanged = cargarVoces;
  }, []);

  const iniciarLectura = () => {
    sintetizador.cancel();

    const u = new SpeechSynthesisUtterance(contenidoAdaptado);
    u.voice = voz;
    u.rate = 1;

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

  /* ---------------------------- DESCARGA DOCX ---------------------------- */
  const descargarAdaptado = () => {
    if (esAnuncio) return;

    const html = `
      <html><body style="font-family: Arial; font-size:18px;">
      ${contenidoAdaptado.replace(/\n/g, "<p>")}
      </body></html>
    `;

    const blob = htmlDocx.asBlob(html);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = material.titulo + "-adaptado.docx";
    a.click();
  };

  /* ---------------------------- ESTILOS ---------------------------- */
  const styleTexto = {
    fontFamily: "Arial",
    fontSize: fontSize,
    backgroundColor: lecturaEnfocada ? "#000" : "#F3F4F6",
    color: lecturaEnfocada ? "#fff" : "#1F2937",
    lineHeight: "1.7",
    padding: "16px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
  };

  /* ---------------------------- UI ---------------------------- */
  return (
    <div className="shadow-xl rounded-2xl bg-white overflow-hidden mb-8">
      {/* CABECERA */}
      <div className={`${esAnuncio ? "bg-yellow-600" : "bg-indigo-600"} p-6`}>
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          {esAnuncio ? (
            <>
              <Megaphone className="w-6 h-6" /> Anuncio de clase
            </>
          ) : (
            <>
              <BookOpen className="w-6 h-6" /> {material.titulo}
            </>
          )}
        </h3>

        {/* FECHA */}
        <p className="text-gray-200 text-sm mt-1 font-medium">
          {material.fecha_subida
            ? new Date(material.fecha_subida).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Fecha no disponible"}
        </p>
      </div>

      {/* CUERPO */}
      <div className="p-6 space-y-6">
        {/* LECTURA EN VOZ ALTA */}
        {userType === "alumno" && (
          <div className="flex flex-wrap gap-3 border-b pb-4">
            {estadoLectura === "stop" && (
              <button
                onClick={iniciarLectura}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <Volume2 className="w-4" />
                Leer en voz alta
              </button>
            )}

            {estadoLectura === "playing" && (
              <button
                onClick={pausarLectura}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-2"
              >
                <Pause className="w-4" /> Pausar
              </button>
            )}

            {estadoLectura === "paused" && (
              <button
                onClick={reanudarLectura}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
              >
                <Play className="w-4" /> Reanudar
              </button>
            )}

            {estadoLectura !== "stop" && (
              <button
                onClick={detenerLectura}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
              >
                <Square className="w-4" /> Detener
              </button>
            )}
          </div>
        )}

        {/* BOTONES ACCESIBLES (ahora también en anuncios) */}
        {userType === "alumno" && (
          <div className="flex flex-wrap gap-3 pt-2 border-b pb-4">
            <button
              onClick={() => setFontSize((p) => Math.max(12, p - 2))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setFontSize((p) => Math.min(36, p + 2))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setLecturaEnfocada((v) => !v)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                lecturaEnfocada ? "bg-indigo-200" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Highlighter className="w-4 h-4" /> Enfocar
            </button>
          </div>
        )}

        {/* MOSTRAR / OCULTAR */}
        <button
          onClick={() => setContenidoVisible(!contenidoVisible)}
          className="flex items-center gap-2 text-indigo-600 font-semibold"
        >
          {contenidoVisible ? (
            <>
              <ChevronUp className="w-5 h-5" /> Ocultar contenido
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" /> Mostrar contenido
            </>
          )}
        </button>

        {/* CONTENIDO */}
        {contenidoVisible && <div style={styleTexto}>{contenidoAdaptado}</div>}

        {/* DESCARGA */}
        {!esAnuncio && userType === "alumno" && (
          <button
            onClick={descargarAdaptado}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-6 transition"
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
