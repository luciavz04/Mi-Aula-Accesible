// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kvuuphcokiyracoxyvjq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXVwaGNva2l5cmFjb3h5dmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDIyOTksImV4cCI6MjA3OTI3ODI5OX0.dfXeBZEOBqcc4rkz_SJX9z5xW7TGsMc4xw6emNlr8QM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* -------------------------------------------------------------
   FUNCIONES DE ADAPTACIÓN DE TEXTO
------------------------------------------------------------- */

export const adaptarTexto = {
  extraerTexto: async (archivo) => {
    // Puedes sustituir esto por mammoth o pdf-parse
    return "Texto extraído del documento...";
  },

  generarLecturaFacil: (texto) => {
    if (!texto) return "";
    const oraciones = texto.split(/[.!?]+/);

    const simplificadas = oraciones.map((o) => {
      const palabras = o.trim().split(" ");
      if (palabras.length > 15) {
        const fragmentos = [];
        for (let i = 0; i < palabras.length; i += 12) {
          fragmentos.push(palabras.slice(i, i + 12).join(" "));
        }
        return fragmentos.join(".\n\n");
      }
      return o.trim();
    });

    return simplificadas.join(".\n\n");
  },

  generarResumen: (texto) => {
    if (!texto) return "";
    const oraciones = texto.split(/[.!?]+/).filter((o) => o.trim());
    const resumen = oraciones.slice(0, Math.min(5, oraciones.length));
    return "• " + resumen.map((o) => o.trim()).join(".\n\n• ") + ".";
  },

  generarVersionSimplificada: (texto) => {
    if (!texto) return "";

    let simple = texto
      .replace(/\b(utilizar|emplear)\b/gi, "usar")
      .replace(/\b(adquirir|obtener)\b/gi, "conseguir")
      .replace(/\b(realizar|efectuar)\b/gi, "hacer")
      .replace(/\b(finalizar|concluir)\b/gi, "terminar")
      .replace(/\b(iniciar|comenzar)\b/gi, "empezar");

    const oraciones = simple.split(/[.!?]+/);
    const simplificadas = oraciones.map((o) => {
      const palabras = o.trim().split(" ");
      if (palabras.length > 20) {
        return palabras.slice(0, 18).join(" ") + "...";
      }
      return o.trim();
    });

    return simplificadas.join(". ");
  },

  /* -------------------------------------------------------------
     GENERA TODAS LAS ADAPTACIONES AUTOMÁTICAMENTE
     (SE USA AL SUBIR UN WORD)
  ------------------------------------------------------------- */
  generarTodasAdaptaciones: (textoBase) => {
    return {
      textoBase: textoBase,
      resumen: adaptarTexto.generarResumen(textoBase),
      versionSimplificada: adaptarTexto.generarVersionSimplificada(textoBase),
      lecturaFacil: adaptarTexto.generarLecturaFacil(textoBase),
      transcripcion: textoBase,
      formatoFuente: "texto",

      /* ------------------------------------------
         ARCHIVOS ACCESIBLES PARA DESCARGAR
      ------------------------------------------ */
      conversionesAccesibles: [
        {
          id: "txt-simple",
          tipo: "txt",
          titulo: "Versión texto plano",
          contenido: textoBase,
        },

        {
          id: "html-accesible",
          tipo: "html",
          titulo: "Versión HTML accesible",
          contenido: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documento Accesible</title>
  <style>
    body {
      font-family: 'OpenDyslexic', Arial, sans-serif;
      font-size: 18px;
      line-height: 1.8;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #FFFEF7;
      color: #1a1a1a;
    }
    p { margin-bottom: 1.5em; }
  </style>
</head>
<body>
  <div>
  ${textoBase
    .split("\n")
    .map((p) => `<p>${p}</p>`)
    .join("\n")}
  </div>
</body>
</html>`,
        },
      ],
    };
  },
};
