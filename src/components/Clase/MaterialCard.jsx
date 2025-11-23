import React, { useState, useEffect, useCallback } from "react";
import {
  Volume2,
  ZoomIn,
  ZoomOut,
  Clock,
  Download,
} from "lucide-react";
import htmlDocx from "html-docx-js/dist/html-docx";

function MaterialCard({ material, currentUser, userType }) {
  const [fontSize, setFontSize] = useState(16);
  const [contenidoAdaptado, setContenidoAdaptado] = useState("");
  const [mostrarVersionCompleta, setMostrarVersionCompleta] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);

  /* ---------------------------------------------------------
     ADAPTAR CONTENIDO SEGÚN NECESIDADES
  --------------------------------------------------------- */
  const adaptarContenido = useCallback(() => {
    const necesidades = currentUser?.necesidades || [];

    const baseTexto =
      material.auto_adaptaciones?.textoBase ||
      material.contenido ||
      "Contenido no disponible";

    const resumen = material.auto_adaptaciones?.resumen;
    const simplificada = material.auto_adaptaciones?.versionSimplificada;
    const lecturaFacil = material.auto_adaptaciones?.lecturaFacil;

    let contenido = baseTexto;

    if (userType === "profesor") {
      setContenidoAdaptado(baseTexto);
      return;
    }

    if (necesidades.includes("Dislexia") && lecturaFacil)
      contenido = lecturaFacil;

    if (
      necesidades.includes("Dificultad de Comprensión") &&
      !mostrarVersionCompleta &&
      simplificada
    )
      contenido = simplificada;

    setContenidoAdaptado(contenido);
  }, [material, currentUser, mostrarVersionCompleta, userType]);

  useEffect(() => {
    adaptarContenido();
  }, [adaptarContenido]);

  /* ---------------------------------------------------------
     VISUAL — DISCAPACIDAD VISUAL
  --------------------------------------------------------- */
  useEffect(() => {
    if (currentUser?.necesidades?.includes("Discapacidad Visual")) {
      setAltoContraste(true);
      setFontSize(20);
    }
  }, [currentUser]);

  /* ---------------------------------------------------------
     LECTURA EN VOZ ALTA
  --------------------------------------------------------- */
  const leerEnVozAlta = () => {
    const u = new SpeechSynthesisUtterance(contenidoAdaptado);
    u.lang = "es-ES";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  /* ---------------------------------------------------------
     DESCARGA ADAPTADA (.DOCX)
  --------------------------------------------------------- */
  const descargarAdaptado = () => {
    const necesidades = currentUser?.necesidades || [];

    const html = `
      <html>
      <head>
        <style>
          body {
            font-family: ${necesidades.includes("Dislexia")
              ? "'OpenDyslexic', Arial"
              : "Arial"};
            font-size: 18px;
            line-height: 1.7;
            padding: 20px;
            background: ${
              necesidades.includes("Discapacidad Visual")
                ? "#000"
                : "#FFFFFF"
            };
            color: ${
              necesidades.includes("Discapacidad Visual")
                ? "white"
                : "#111827"
            };
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

  /* =========================================================
     UI FINAL ESTILIZADO
  ========================================================= */
  return (
    <div className="shadow-xl rounded-2xl bg-white overflow-hidden mb-8">
      
      {/* CABECERA */}
      <div className="bg-indigo-600 p-6 text-white">
        <h3 className="text-2xl font-bold">{material.titulo}</h3>
        <p className="opacity-80 text-sm mt-1">
          Fecha: {new Date(material.fecha_subida).toLocaleDateString()}
        </p>
      </div>

      {/* CONTENIDO */}
      <div className="p-6 space-y-6">

        {/* Opciones accesibles */}
        {userType === "alumno" && (
          <div className="flex flex-wrap gap-3 border-b pb-4">

            <button
              onClick={() => setFontSize((p) => p - 2)}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setFontSize((p) => p + 2)}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={leerEnVozAlta}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Volume2 className="w-4 h-4" /> Leer
            </button>

            {currentUser?.necesidades?.includes("TDAH") && (
              <button className="px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4" /> 10 min
              </button>
            )}
          </div>
        )}

        {/* Texto adaptado */}
        <div
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.7",
            backgroundColor: altoContraste ? "#111" : "#F9FAFB",
            color: altoContraste ? "white" : "#1F2937",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          {contenidoAdaptado}
        </div>

        {/* Botón ver versión completa/simplificada */}
        {currentUser?.necesidades?.includes("Dificultad de Comprensión") && (
          <button
            onClick={() => setMostrarVersionCompleta(!mostrarVersionCompleta)}
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            {mostrarVersionCompleta
              ? "Ver versión simplificada"
              : "Ver versión completa"}
          </button>
        )}

        {/* DESCARGA */}
        {userType === "alumno" && (
          <button
            onClick={descargarAdaptado}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Download className="w-5 h-5" />
            Descargar Documento Adaptado
          </button>
        )}
      </div>
    </div>
  );
}

export default MaterialCard;
