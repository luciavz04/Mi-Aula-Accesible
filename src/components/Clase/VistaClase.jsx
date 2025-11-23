import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Upload,
  Paperclip,
  Info,
  ShieldCheck,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import { supabase, adaptarTexto } from '../../supabase';
import mammoth from 'mammoth';
import MaterialesList from './MaterialesList';

function VistaClase({ clase, currentUser, userType, setCurrentPage }) {
  const [materiales, setMateriales] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [mensajeError, setMensajeError] = useState('');
  const [panelAbierto, setPanelAbierto] = useState(userType === 'profesor');

  const esAlumno = userType === 'alumno';
  const necesidadesAlumno = currentUser?.necesidades?.filter((n) => n !== 'Ninguna') || [];

  /* CARGA DE MATERIALES */
  const cargarMateriales = useCallback(async () => {
    if (!clase?.id) return;
    try {
      const { data, error } = await supabase
        .from('materiales')
        .select('*')
        .eq('clase_id', clase.id)
        .order('fecha_subida', { ascending: false });

      if (error) throw error;
      setMateriales(data || []);
    } catch (err) {
      console.error('Error cargando materiales:', err);
    }
  }, [clase?.id]);

  /* CARGA DE ANUNCIOS */
  const cargarAnuncios = useCallback(async () => {
    if (!clase?.id) return;
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('clase_id', clase.id)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setAnuncios(data || []);
    } catch (err) {
      console.error('Error cargando anuncios:', err);
    }
  }, [clase?.id]);

  useEffect(() => {
    cargarMateriales();
    cargarAnuncios();
  }, [cargarMateriales, cargarAnuncios]);

  /* PROCESAR ARCHIVO WORD Y EXTRAER TEXTO */
  const procesarArchivoWord = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value; // Texto plano extraído
    } catch (err) {
      console.error('Error extrayendo texto de Word:', err);
      return null;
    }
  };

  /* SUBIR ARCHIVO CON ADAPTACIONES AUTOMÁTICAS */
  const subirMaterial = async () => {
    if (!archivoAdjunto) {
      setMensajeError('Debes seleccionar un archivo');
      return;
    }

    setMensajeError('');
    setSubiendo(true);
    setProgresoSubida(10);

    try {
      let textoExtraido = '';
      let adaptaciones = null;

      // Si es Word, extraemos texto y generamos adaptaciones
      if (
        archivoAdjunto.archivo.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        archivoAdjunto.archivo.name.endsWith('.docx')
      ) {
        setProgresoSubida(30);
        textoExtraido = await procesarArchivoWord(archivoAdjunto.archivo);

        if (textoExtraido) {
          setProgresoSubida(50);
          adaptaciones = adaptarTexto.generarTodasAdaptaciones(textoExtraido);
        }
      }

      setProgresoSubida(70);

      // Subir archivo a Supabase Storage
      const nombreArchivo = `${Date.now()}-${archivoAdjunto.nombre}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('archivos-clases')
        .upload(`clases/${clase.id}/${nombreArchivo}`, archivoAdjunto.archivo);

      if (uploadError) throw uploadError;

      setProgresoSubida(85);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('archivos-clases')
        .getPublicUrl(`clases/${clase.id}/${nombreArchivo}`);

      const archivoUrl = urlData.publicUrl;

      setProgresoSubida(95);

      // Guardar material en la base de datos
      const { error: insertError } = await supabase.from('materiales').insert({
        clase_id: clase.id,
        titulo: archivoAdjunto.nombre,
        fecha_subida: Date.now(),
        archivo_url: archivoUrl,
        archivo_nombre: archivoAdjunto.nombre,
        archivo_tipo: archivoAdjunto.archivo.type,
        contenido: textoExtraido || '',
        auto_adaptaciones: adaptaciones || {
          textoBase: archivoAdjunto.nombre,
          resumen: 'Resumen automático próximamente',
          versionSimplificada: 'Versión simplificada próximamente',
          lecturaFacil: 'Lectura fácil generada próximamente',
          transcripcion: null,
          conversionesAccesibles: []
        }
      });

      if (insertError) throw insertError;

      setProgresoSubida(100);
      setArchivoAdjunto(null);
      setSubiendo(false);
      cargarMateriales();
    } catch (err) {
      console.error('Error subiendo material:', err);
      setMensajeError('Error al subir el archivo. Revisa la consola.');
      setSubiendo(false);
    }
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoAdjunto({
      archivo: file,
      nombre: file.name
    });
  };

  const volver = () =>
    setCurrentPage(userType === 'profesor' ? 'profesor-dashboard' : 'alumno-dashboard');

  /* MATERIALES VIRTUALES A PARTIR DE ANUNCIOS */
  const convertirAnuncioEnMaterial = (anuncio) => {
    return {
      id: `anuncio-${anuncio.id}`,
      titulo: '📢 Anuncio de clase',
      fecha_subida: anuncio.fecha,
      esAnuncio: true,
      contenido: anuncio.texto,
      auto_adaptaciones: {
        textoBase: anuncio.texto,
        resumen: anuncio.texto,
        versionSimplificada: anuncio.texto,
        lecturaFacil: anuncio.texto,
        transcripcion: anuncio.texto,
        formatoFuente: 'texto',
        conversionesAccesibles: []
      },
      archivo: null
    };
  };

  const materialesVirtuales = anuncios.map((a) => convertirAnuncioEnMaterial(a));
  const listaCompletaMateriales = [...materialesVirtuales, ...materiales].sort(
    (a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida)
  );

  /* ESTILOS ALTO CONTRASTE */
  const [modoAltoContraste, setModoAltoContraste] = useState(false);
  const [textoGrande, setTextoGrande] = useState(false);

  useEffect(() => {
    if (necesidadesAlumno.includes('Discapacidad Visual')) {
      setModoAltoContraste(true);
      setTextoGrande(true);
    }
    if (necesidadesAlumno.includes('Dislexia')) {
      setTextoGrande(true);
    }
  }, [necesidadesAlumno]);

  const contenedorAlumno = modoAltoContraste ? 'bg-slate-900 text-white' : 'bg-slate-50';
  const tarjetaAlumno = modoAltoContraste
    ? 'bg-slate-800 text-white border border-slate-700'
    : 'bg-white text-slate-900 border border-slate-100';

  return (
    <div className={`min-h-screen p-4 md:p-8 ${esAlumno ? contenedorAlumno : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BOTÓN VOLVER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={volver}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al panel
          </button>

          {userType === 'profesor' && (
            <p className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Adaptaciones automáticas activas
            </p>
          )}
        </div>

        {/* CABECERA */}
        {esAlumno ? (
          <section
            className={`rounded-3xl p-8 shadow-xl transition-colors ${
              modoAltoContraste
                ? 'bg-slate-800 border border-slate-700 text-white'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
            }`}
          >
            <h1 className={`${textoGrande ? 'text-4xl' : 'text-3xl'} font-bold`}>{clase.nombre}</h1>
            <p className={`${textoGrande ? 'text-base' : 'text-sm'} text-white/80 mt-2`}>
              Profesor/a: {clase.profesor_nombre}
            </p>
          </section>
        ) : (
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 text-sm uppercase tracking-wide text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Clase accesible
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{clase.nombre}</h1>
            <p className="text-slate-600">Profesor/a: {clase.profesor_nombre}</p>
          </section>
        )}

        {/* PANEL PROFESOR — SUBIDA */}
        {userType === 'profesor' && (
          <aside className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Subida rápida</h2>
                <p className="text-sm text-slate-500">
                  Sube un Word (.docx) y la plataforma generará versiones accesibles automáticamente.
                </p>
              </div>
              <button
                onClick={() => setPanelAbierto(!panelAbierto)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {panelAbierto ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {panelAbierto && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adjunta tu documento Word
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center space-x-2 bg-slate-50 border border-dashed border-slate-300 px-4 py-2 rounded-lg cursor-pointer hover:border-indigo-400">
                      <Paperclip className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-slate-700">Seleccionar archivo</span>
                      <input
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleArchivoChange}
                      />
                    </label>
                    {archivoAdjunto && (
                      <div className="text-sm text-slate-600 truncate max-w-[200px]">
                        {archivoAdjunto.nombre}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Solo archivos .docx (Word). El texto será adaptado automáticamente.
                  </p>
                </div>

                {mensajeError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2 rounded-lg">
                    {mensajeError}
                  </div>
                )}

                {subiendo && (
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-200"
                      style={{ width: `${progresoSubida}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={subirMaterial}
                  disabled={subiendo}
                  className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                    subiendo
                      ? 'bg-emerald-400 cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {subiendo ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando ({progresoSubida}%)...
                    </span>
                  ) : (
                    'Procesar y compartir'
                  )}
                </button>
              </div>
            )}
          </aside>
        )}

        {/* LISTA DE MATERIALES */}
        <section className={`${esAlumno && modoAltoContraste ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white'} rounded-3xl shadow-xl p-6 md:p-8`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className={`text-sm ${esAlumno && modoAltoContraste ? 'text-white/70' : 'text-slate-500'}`}>
                Materiales accesibles
              </p>
              <h2 className={`text-2xl font-bold ${esAlumno && modoAltoContraste ? 'text-white' : 'text-slate-900'}`}>
                Todo tu contenido adaptado
              </h2>
            </div>
          </div>

          {listaCompletaMateriales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No hay materiales disponibles
              </h3>
              <p className="text-slate-500">
                {userType === 'profesor'
                  ? 'Sube un Word para generar automáticamente sus adaptaciones.'
                  : 'Tu profesor pronto añadirá contenido adaptado.'}
              </p>
            </div>
          ) : (
            <MaterialesList
              materiales={listaCompletaMateriales}
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