// ===============================
//  Supabase Client
// ===============================
import { createClient } from "@supabase/supabase-js";

// ===============================
//   PDF.js — IMPORT SEGURO
// ===============================
import * as pdfjsLib from "pdfjs-dist";

// Worker correcto para evitar errores
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SUPABASE_URL = "https://kvuuphcokiyracoxyvjq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXVwaGNva2l5cmFjb3h5dmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDIyOTksImV4cCI6MjA3OTI3ODI5OX0.dfXeBZEOBqcc4rkz_SJX9z5xW7TGsMc4xw6emNlr8QM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================================================================
//   MOTOR DE ADAPTACIÓN DE TEXTOS — VERSIÓN FINAL
// =======================================================================
export const adaptarTexto = {
  /* -------------------------------------------------------------
     EXTRAER TEXTO DE PDF
  ------------------------------------------------------------- */
  extraerTextoPDF: async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      let texto = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texto += content.items.map((t) => t.str).join(" ") + "\n\n";
      }

      return texto.trim();
    } catch (err) {
      console.error("❌ Error leyendo PDF:", err);
      return "";
    }
  },

  /* -------------------------------------------------------------
     LECTURA FÁCIL (simplificación por párrafos)
  ------------------------------------------------------------- */
  generarLecturaFacil: (texto) => {
    if (!texto) return "";

    const oraciones = texto.split(/[.!?]+/);

    return oraciones
      .map((o) => {
        const palabras = o.trim().split(" ");
        if (palabras.length > 15) {
          const partes = [];
          for (let i = 0; i < palabras.length; i += 12) {
            partes.push(palabras.slice(i, i + 12).join(" "));
          }
          return partes.join(".\n\n");
        }
        return o.trim();
      })
      .join(".\n\n");
  },

  /* -------------------------------------------------------------
     RESUMEN AUTOMÁTICO
  ------------------------------------------------------------- */
  generarResumen: (texto) => {
    if (!texto) return "";

    const oraciones = texto
      .split(/[.!?]+/)
      .map((o) => o.trim())
      .filter(Boolean);

    const primeras = oraciones.slice(0, 5);

    return "• " + primeras.join(".\n\n• ") + ".";
  },

  /* -------------------------------------------------------------
     VERSION SIMPLIFICADA
  ------------------------------------------------------------- */
  generarVersionSimplificada: (texto) => {
    if (!texto) return "";

    let simple = texto
      .replace(/\b(utilizar|emplear)\b/gi, "usar")
      .replace(/\b(adquirir|obtener)\b/gi, "conseguir")
      .replace(/\b(realizar|efectuar)\b/gi, "hacer")
      .replace(/\b(finalizar|concluir)\b/gi, "terminar")
      .replace(/\b(iniciar|comenzar)\b/gi, "empezar");

    const oraciones = simple.split(/[.!?]+/);

    return oraciones
      .map((o) => {
        const palabras = o.trim().split(" ");
        return palabras.length > 20
          ? palabras.slice(0, 18).join(" ") + "..."
          : o.trim();
      })
      .join(". ");
  },

  /* -------------------------------------------------------------
     GENERA TODAS LAS ADAPTACIONES
  ------------------------------------------------------------- */
  generarTodasAdaptaciones: (textoBase) => {
    if (!textoBase) return null;

    return {
      textoBase,

      resumen: adaptarTexto.generarResumen(textoBase),

      versionSimplificada: adaptarTexto.generarVersionSimplificada(textoBase),

      lecturaFacil: adaptarTexto.generarLecturaFacil(textoBase),

      transcripcion: textoBase,

      formatoFuente: "texto",

      conversionesAccesibles: [
        {
          id: "txt",
          tipo: "txt",
          titulo: "Versión texto plano",
          contenido: textoBase,
        },
        {
          id: "html-accesible",
          tipo: "html",
          titulo: "HTML accesible (OpenDyslexic)",
          contenido: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'OpenDyslexic', Arial, sans-serif;
      font-size: 18px;
      line-height: 1.8;
      background: #FFFBEA;
      padding: 20px;
      color: #1a1a1a;
      max-width: 900px;
      margin: auto;
    }
    p { margin-bottom: 1.4rem; }
  </style>
</head>
<body>
${textoBase
  .split("\n")
  .map((p) => `<p>${p}</p>`)
  .join("\n")}
</body>
</html>`,
        },
      ],
    };
  },
};
