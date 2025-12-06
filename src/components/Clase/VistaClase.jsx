import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, Paperclip, Send, Megaphone } from "lucide-react";
import { supabase, adaptarTexto } from "../../supabase";
import mammoth from "mammoth";
import MaterialesList from "./MaterialesList";

function VistaClase({ clase, currentUser, userType, setCurrentPage }) {
  const [materiales, setMateriales] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [nuevoAnuncio, setNuevoAnuncio] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const esAlumno = userType === "alumno";

  /* ===================== CARGAR MATERIALES ===================== */
  const cargarMateriales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("materiales")
        .select("*")
        .eq("clase_id", clase.id)
        .order("fecha_subida", { ascending: false });

      if (error) throw error;
      setMateriales(data || []);
    } catch (err) {
      console.error("❌ Error cargando materiales:", err);
      setMateriales([]);
    }
  }, [clase.id]);

  /* ===================== CARGAR ANUNCIOS ===================== */
  const cargarAnuncios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("clase_id", clase.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setAnuncios(data || []);
    } catch (err) {
      console.error("❌ Error cargando anuncios:", err);
      setAnuncios([]);
    }
  }, [clase.id]);

  /* ===================== LOAD INICIAL ===================== */
  useEffect(() => {
    cargarMateriales();
    cargarAnuncios();
  }, [cargarMateriales, cargarAnuncios]);

  /* ===================== PROCESAR WORD ===================== */
  const procesarWord = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || "";
    } catch (err) {
      console.error("❌ Error Word:", err);
      return "";
    }
  };

  /* ===================== SUBIR MATERIAL ===================== */
  const subirMaterial = async () => {
    if (!archivoAdjunto) {
      setMensajeError("Debes seleccionar un archivo.");
      return;
    }

    setSubiendo(true);
    setMensajeError("");

    try {
      const file = archivoAdjunto.archivo;
      const nombreSubida = `${Date.now()}-${file.name}`;

      let textoExtraido = "";
      if (file.name.endsWith(".docx")) {
        textoExtraido = await procesarWord(file);
      }

      const adaptaciones = textoExtraido
        ? adaptarTexto.generarTodasAdaptaciones(textoExtraido)
        : null;

      const { error: uploadError } = await supabase.storage
        .from("archivos-clases")
        .upload(`clases/${clase.id}/${nombreSubida}`, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("archivos-clases")
        .getPublicUrl(`clases/${clase.id}/${nombreSubida}`);

      const { error: insertError } = await supabase.from("materiales").insert({
        clase_id: clase.id,
        titulo: archivoAdjunto.nombre,
        archivo_url: urlData.publicUrl,
        archivo_tipo: file.type,
        archivo_nombre: archivoAdjunto.nombre,
        contenido: textoExtraido,
        auto_adaptaciones: adaptaciones,
      });

      if (insertError) throw insertError;

      setArchivoAdjunto(null);
      cargarMateriales();
      alert("📄 Material subido correctamente");
    } catch (err) {
      console.error("❌ Error subiendo material:", err);
      setMensajeError("Error: " + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  /* ===================== PUBLICAR ANUNCIO ===================== */
  const publicarAnuncio = async () => {
    const texto = nuevoAnuncio.trim();

    if (!texto) {
      alert("Escribe un anuncio.");
      return;
    }

    try {
      const { error } = await supabase.from("anuncios").insert({
        clase_id: clase.id,
        texto: texto,
      });

      if (error) throw error;

      setNuevoAnuncio("");
      cargarAnuncios();
      alert("📢 Anuncio publicado");
    } catch (err) {
      console.error("❌ Error anuncio:", err);
      alert("Error: " + err.message);
    }
  };

  /* ===================== COMBINAR EN UNA LISTA ===================== */
  const materialesVirtuales = anuncios.map((a) => ({
    id: "anuncio-" + a.id,
    titulo: "📢 Anuncio de clase",
    fecha_subida: a.fecha,
    archivo_tipo: "anuncio",
    esAnuncio: true,
    contenido: a.texto,
    auto_adaptaciones: adaptarTexto.generarTodasAdaptaciones(a.texto),
  }));

  const listaCompleta = [...materialesVirtuales, ...materiales];

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Volver */}
        <button
          onClick={() =>
            setCurrentPage(esAlumno ? "alumno-dashboard" : "profesor-dashboard")
          }
          className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        {/* Header */}
        <section className="rounded-3xl p-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl">
          <h1 className="text-3xl font-bold">{clase.nombre}</h1>
          <p className="opacity-80 mt-2">
            Profesor/a: {clase.profesor_nombre}
          </p>
        </section>

        {/* Errores */}
        {mensajeError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {mensajeError}
          </div>
        )}

        {/* ================= PROFESOR: SUBIR MATERIALES ================= */}
        {userType === "profesor" && (
          <aside className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <Upload className="w-5 h-5 text-indigo-500" />
              Subida de materiales
            </h2>

            <label className="cursor-pointer flex items-center gap-3 border border-dashed border-gray-300 p-4 rounded-xl hover:border-indigo-500">
              <Paperclip className="text-indigo-600" />
              <span>Seleccionar archivo (solo Word)</span>
              <input
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setArchivoAdjunto({ archivo: file, nombre: file.name });
                  }
                }}
              />
            </label>

            {archivoAdjunto && (
              <p className="text-sm text-gray-600">
                📄 {archivoAdjunto.nombre}
              </p>
            )}

            <button
              onClick={subirMaterial}
              disabled={subiendo || !archivoAdjunto}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl font-semibold disabled:opacity-50 transition"
            >
              {subiendo ? "Subiendo..." : "Subir material"}
            </button>
          </aside>
        )}

        {/* ================= PROFESOR: PUBLICAR ANUNCIO ================= */}
        {userType === "profesor" && (
          <aside className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              Publicar anuncio
            </h2>

            <textarea
              className="w-full p-4 border rounded-xl focus:border-indigo-500"
              placeholder="Escribe un anuncio..."
              value={nuevoAnuncio}
              onChange={(e) => setNuevoAnuncio(e.target.value)}
              rows={3}
            />

            <button
              onClick={publicarAnuncio}
              disabled={!nuevoAnuncio.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
              Publicar anuncio
            </button>
          </aside>
        )}

        {/* ================= LISTA MATERIALES + ANUNCIOS ================= */}
        <section className="rounded-3xl shadow-xl p-8 bg-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Megaphone className="w-5 h-5 text-indigo-500" />
            Materiales y Anuncios
          </h2>

          {listaCompleta.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
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
