import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  Paperclip,
  FileText,
  Megaphone,
  Send,
} from "lucide-react";

import { supabase, adaptarTexto } from "../../supabase";
import mammoth from "mammoth";
import MaterialesList from "./MaterialesList";

function VistaClase({ clase, currentUser, userType, setCurrentPage }) {
  /* ===================== ESTADOS ===================== */
  const [materiales, setMateriales] = useState([]);
  const [anuncios, setAnuncios] = useState([]);

  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [nuevoAnuncio, setNuevoAnuncio] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [debugMsg, setDebugMsg] = useState("");

  const esAlumno = userType === "alumno";

  /* ============================================================
      CARGA DE MATERIALES
  ============================================================ */
  const cargarMateriales = useCallback(async () => {
    setDebugMsg((m) => m + "\n[Cargando materiales...]");

    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .eq("clase_id", clase.id)
      .order("fecha_subida", { ascending: false });

    setDebugMsg((m) =>
      m +
      `\nMateriales recibidos (${data?.length || 0})\nError: ${
        error ? JSON.stringify(error) : "NO"
      }\n`
    );

    if (!error) setMateriales(data || []);
  }, [clase.id]);

  /* ============================================================
      CARGA DE ANUNCIOS (CON DEPURACIÓN)
  ============================================================ */
  const cargarAnuncios = useCallback(async () => {
    setDebugMsg((m) => m + "\n[Cargando anuncios...]");

    const { data, error } = await supabase
      .from("anuncios")
      .select("*")
      .eq("clase_id", clase.id)
      .order("fecha", { ascending: false });

    setDebugMsg(
      (m) =>
        m +
        `\nANUNCIOS DEVUELTOS POR SUPABASE: ${JSON.stringify(
          data,
          null,
          2
        )}\nERROR: ${error ? JSON.stringify(error) : "NO"}\n`
    );

    if (!error) setAnuncios(data || []);
    else setAnuncios([]);
  }, [clase.id]);

  /* ============================================================
      EFECTO INICIAL
  ============================================================ */
  useEffect(() => {
    cargarMateriales();
    cargarAnuncios();
  }, [cargarMateriales, cargarAnuncios]);

  /* ============================================================
      PROCESAR WORD
  ============================================================ */
  const procesarWord = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || "";
    } catch {
      return "";
    }
  };

  /* ============================================================
      SUBIR MATERIAL
  ============================================================ */
  const subirMaterial = async () => {
    if (!archivoAdjunto)
      return setMensajeError("Debes seleccionar un archivo.");

    setSubiendo(true);
    setMensajeError("");

    const file = archivoAdjunto.archivo;
    const nombreArchivo = `${Date.now()}-${file.name}`;

    let textoExtraido = "";
    let adaptaciones = null;

    if (file.name.endsWith(".docx")) {
      textoExtraido = await procesarWord(file);
    }

    if (textoExtraido) {
      adaptaciones = adaptarTexto.generarTodasAdaptaciones(textoExtraido);
    }

    const { error: uploadError } = await supabase.storage
      .from("archivos-clases")
      .upload(`clases/${clase.id}/${nombreArchivo}`, file);

    if (uploadError) {
      setSubiendo(false);
      return setMensajeError("Error subiendo archivo.");
    }

    const { data: urlData } = supabase.storage
      .from("archivos-clases")
      .getPublicUrl(`clases/${clase.id}/${nombreArchivo}`);

    await supabase.from("materiales").insert({
      clase_id: clase.id,
      titulo: archivoAdjunto.nombre,
      archivo_url: urlData.publicUrl,
      archivo_tipo: file.type,
      archivo_nombre: archivoAdjunto.nombre,
      fecha_subida: Date.now(),
      contenido: textoExtraido,
      auto_adaptaciones: adaptaciones,
    });

    setSubiendo(false);
    cargarMateriales();
  };

  /* ============================================================
      PUBLICAR ANUNCIO
  ============================================================ */
  const publicarAnuncio = async () => {
    if (!nuevoAnuncio.trim()) return;

    const { error } = await supabase.from("anuncios").insert({
      clase_id: clase.id,
      texto: nuevoAnuncio.trim(),
      fecha: new Date().toISOString(),
    });

    setDebugMsg((m) => m + `\nINSERT anuncio error?: ${JSON.stringify(error)}`);

    setNuevoAnuncio("");
    cargarAnuncios();
  };

  /* ============================================================
      SIMULAR TARJETAS DE MATERIALES PARA ANUNCIOS
  ============================================================ */
  const materialesVirtuales = anuncios.map((a) => ({
    id: `anuncio-${a.id}`,
    titulo: "📢 Anuncio de clase",
    fecha_subida: a.fecha,
    archivo_tipo: "anuncio",
    esAnuncio: true,
    contenido: a.texto,
    auto_adaptaciones: adaptarTexto.generarTodasAdaptaciones(a.texto),
  }));

  const listaCompleta = [...materialesVirtuales, ...materiales];

  /* ============================================================
      RENDER
  ============================================================ */
  return (
    <div className="min-h-screen p-6 bg-slate-50 relative">
      {/* DEBUG OVERLAY VISUAL */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 10,
          background: "black",
          color: "lime",
          fontSize: "12px",
          padding: "10px",
          whiteSpace: "pre-wrap",
          maxWidth: "350px",
          maxHeight: "250px",
          overflowY: "auto",
          borderRadius: "10px",
          opacity: 0.85,
          zIndex: 9999,
        }}
      >
        {debugMsg || "Sin logs todavía..."}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() =>
            setCurrentPage(esAlumno ? "alumno-dashboard" : "profesor-dashboard")
          }
          className="inline-flex items-center text-indigo-600 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <section className="rounded-3xl p-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl">
          <h1 className="text-3xl font-bold">{clase.nombre}</h1>
          <p className="opacity-80 mt-2">
            Profesor/a: {clase.profesor_nombre}
          </p>
        </section>

        {userType === "profesor" && (
          <aside className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Upload className="w-5 h-5 text-indigo-500" />
              Subida de materiales
            </h2>

            <label className="cursor-pointer flex items-center gap-3 border border-dashed border-slate-300 p-4 rounded-xl hover:border-indigo-500">
              <Paperclip className="text-indigo-600" />
              <span>Seleccionar archivo (solo Word)</span>
              <input
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) =>
                  setArchivoAdjunto({
                    archivo: e.target.files[0],
                    nombre: e.target.files[0]?.name,
                  })
                }
              />
            </label>

            {archivoAdjunto && (
              <p className="text-sm text-slate-500">{archivoAdjunto.nombre}</p>
            )}

            <button onClick={subirMaterial} className="btn-primary w-full">
              Subir material
            </button>
          </aside>
        )}

        {userType === "profesor" && (
          <aside className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              Publicar anuncio
            </h2>

            <textarea
              className="w-full p-4 border rounded-xl"
              placeholder="Escribe un anuncio para tus alumnos..."
              value={nuevoAnuncio}
              onChange={(e) => setNuevoAnuncio(e.target.value)}
              rows={3}
            />

            <button
              onClick={publicarAnuncio}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Publicar anuncio
            </button>
          </aside>
        )}

        {/* LISTA FINAL */}
        <section className="rounded-3xl shadow-xl p-8 bg-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Materiales accesibles
          </h2>

          {listaCompleta.length === 0 ? (
            <p className="text-center text-slate-500">
              No hay materiales ni anuncios todavía.
            </p>
          ) : (
            <MaterialesList
              materiales={listaCompleta}
              currentUser={currentUser}
              userType={userType}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default VistaClase;
