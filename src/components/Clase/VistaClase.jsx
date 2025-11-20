import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  FileText,
  Info,
  Megaphone,
  Palette,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Type,
  Upload,
  Volume2
} from 'lucide-react';

import { db, storage } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  doc
} from 'firebase/firestore';

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

import MaterialesList from './MaterialesList';

/* -----------------------------------------------------
   UTILIDAD 1 — LECTURA FÁCIL PARA ANUNCIOS
------------------------------------------------------*/
const generarLecturaFacilAnuncio = (texto) => {
  if (!texto) return '';
  const palabras = texto.split(' ');
  const bloques = [];
  for (let i = 0; i < palabras.length; i += 8) {
    bloques.push(palabras.slice(i, i + 8).join(' '));
  }
  return bloques.join('\n\n• ');
};

/* -----------------------------------------------------
   UTILIDAD 2 — MATERIAL VIRTUAL A PARTIR DE ANUNCIO
------------------------------------------------------*/
const convertirAnuncioEnMaterial = (anuncio) => {
  const lecturaFacil = generarLecturaFacilAnuncio(anuncio.texto);

  return {
    id: `anuncio-${anuncio.id}`,
    titulo: '📢 Anuncio de clase',
    fechaSubida: anuncio.fecha,
    esAnuncio: true,
    contenido: anuncio.texto,
    autoAdaptaciones: {
      textoBase: anuncio.texto,
      resumen: anuncio.texto,
      versionSimplificada: anuncio.texto,
      lecturaFacil,
      transcripcion: anuncio.texto,
      formatoFuente: 'texto',
      conversionesAccesibles: []
    },
    archivo: null
  };
};

/* -----------------------------------------------------
   !!! A PARTIR DE AQUÍ COMIENZA TU COMPONENTE REAL
------------------------------------------------------*/

function VistaClase({ clase, currentUser, userType, setCurrentPage }) {
  const [materiales, setMateriales] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(userType === 'profesor');

  const esAlumno = userType === 'alumno';
  const necesidadesAlumno =
    currentUser?.necesidades?.filter((n) => n !== 'Ninguna') || [];

  /* ---------------- CARGA DE MATERIALES ---------------- */
  const cargarMateriales = useCallback(async () => {
    if (!clase?.id) return;
    try {
      const refMat = collection(db, 'clases', clase.id, 'materiales');
      const snap = await getDocs(query(refMat, orderBy('fechaSubida', 'desc')));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMateriales(lista);
    } catch (err) {
      console.error('Error cargando materiales:', err);
    }
  }, [clase?.id]);

  /* ---------------- CARGA DE ANUNCIOS ---------------- */
  const cargarAnuncios = useCallback(async () => {
    if (!clase?.id) return;
    try {
      const refAn = collection(db, 'clases', clase.id, 'anuncios');
      const snap = await getDocs(query(refAn, orderBy('fecha', 'desc')));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAnuncios(lista);
    } catch (err) {
      console.error('Error cargando anuncios:', err);
    }
  }, [clase?.id]);

  useEffect(() => {
    cargarMateriales();
    cargarAnuncios();
  }, [cargarMateriales, cargarAnuncios]);

  /* ----------------------------------------------------------
     COMBINACIÓN FINAL: MATERIALES NORMALES + ANUNCIOS VIRTUALES
  -----------------------------------------------------------*/
  const materialesVirtuales = anuncios.map((a) =>
    convertirAnuncioEnMaterial(a)
  );

  const listaCompletaMateriales = [
    ...materialesVirtuales,
    ...materiales
  ].sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));

  /* ----------------------------------------------------------
     COMPONENTE PRINCIPAL — RENDER
  -----------------------------------------------------------*/

  const volver = () =>
    setCurrentPage(
      userType === 'profesor'
        ? 'profesor-dashboard'
        : 'alumno-dashboard'
    );
  /* ----------------------------------------------------------
     ESTILOS ALTO CONTRASTE / TEXTO GRANDE PARA ALUMNOS
  -----------------------------------------------------------*/
  const [modoAltoContrasteAlumno, setModoAltoContrasteAlumno] =
    useState(false);
  const [textoGrandeAlumno, setTextoGrandeAlumno] = useState(false);

  useEffect(() => {
    if (necesidadesAlumno.includes('Discapacidad Visual')) {
      setModoAltoContrasteAlumno(true);
      setTextoGrandeAlumno(true);
    }
    if (necesidadesAlumno.includes('Dislexia')) {
      setTextoGrandeAlumno(true);
    }
  }, [necesidadesAlumno]);

  const contenedorAlumno = modoAltoContrasteAlumno
    ? 'bg-slate-900 text-white'
    : 'bg-slate-50';

  const tarjetaAlumno = modoAltoContrasteAlumno
    ? 'bg-slate-800 text-white border border-slate-700'
    : 'bg-white text-slate-900 border border-slate-100';

  const ultimoMaterial = listaCompletaMateriales[0];

    /* ----------------------------------------------------------
      ⚙️ CONSTANTES Y ESTADOS FALTANTES (NECESARIOS)
  -----------------------------------------------------------*/

  const ACCEPT_ATTR =
    '.pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.mp3,.wav,.mp4,.m4a';

  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);

  const [anuncioTexto, setAnuncioTexto] = useState('');
  const [incluirMaterial, setIncluirMaterial] = useState(false);

  const [anuncioAdjuntos, setAnuncioAdjuntos] = useState({
    original: null,
    adaptados: {}
  });

  const [dificultadesClase, setDificultadesClase] = useState([]);

  const [anuncioError, setAnuncioError] = useState('');
  const [enviandoAnuncio, setEnviandoAnuncio] = useState(false);
  const [progresoAnuncio, setProgresoAnuncio] = useState(0);

  /* --------------------------
      OBTENER DIFICULTADES
  ---------------------------*/
  useEffect(() => {
    const obtener = async () => {
      if (!clase?.id) return;
      try {
        const ref = doc(db, 'clases', clase.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setDificultadesClase(data.necesidades || []);
        }
      } catch (err) {
        console.error('Error obteniendo dificultades:', err);
      }
    };
    obtener();
  }, [clase?.id]);

  /* --------------------------
      SUBIR ARCHIVO MATERIAL
  ---------------------------*/
  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoAdjunto({
      archivo: file,
      nombre: file.name
    });
  };

  const subirMaterial = async () => {
    if (!archivoAdjunto) {
      setMensajeError('Debes seleccionar un archivo');
      return;
    }

    setMensajeError('');
    setSubiendo(true);

    try {

      console.log("=== DEBUG SUBIDA ===");
      console.log("archivoAdjunto:", archivoAdjunto);
      console.log("clase.id:", clase?.id);
      console.log("storageBucket:", storage._bucket);
      const storageRef = ref(
        storage,
        `clases/${clase.id}/materiales/${Date.now()}-${archivoAdjunto.nombre}`
      );

      const uploadTask = uploadBytesResumable(storageRef, archivoAdjunto.archivo);

      uploadTask.on('state_changed', (snap) => {
        const progreso = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgresoSubida(progreso);
      });

      await uploadTask;

      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'clases', clase.id, 'materiales'), {
        titulo: archivoAdjunto.nombre,
        fechaSubida: Date.now(),
        archivo: {
          nombre: archivoAdjunto.nombre,
          url,
          tipo: archivoAdjunto.archivo.type
        },
        autoAdaptaciones: {
          textoBase: archivoAdjunto.nombre,
          resumen: 'Resumen automático próximamente',
          versionSimplificada: 'Versión simplificada próximamente',
          lecturaFacil: 'Lectura fácil generada próximamente',
          transcripcion: null,
          conversionesAccesibles: []
        }
      });

      setArchivoAdjunto(null);
      setProgresoSubida(0);
      setSubiendo(false);

      cargarMateriales();
    } catch (err) {
      console.error(err);
      setMensajeError('Error al subir el archivo');
      setSubiendo(false);
    }
  };

  /* -------------------------------
      SUBIR ARCHIVOS DE ANUNCIO
  --------------------------------*/
  const handleAnuncioArchivoChange = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnuncioAdjuntos((prev) => {
      if (tipo === 'original') {
        return { ...prev, original: { archivo: file, nombre: file.name } };
      }
      return {
        ...prev,
        adaptados: {
          ...prev.adaptados,
          [tipo]: { archivo: file, nombre: file.name }
        }
      };
    });
  };

  /* --------------------------
      ARCHIVO PARA ALUMNO
  ---------------------------*/
  const obtenerArchivoParaAlumno = (anuncio) => {
    if (!anuncio.archivos || !incluirMaterial || !esAlumno) return null;

    const nec = necesidadesAlumno;

    for (const dificultad of nec) {
      if (anuncio.archivos.adaptados?.[dificultad]) {
        return {
          url: anuncio.archivos.adaptados[dificultad].url,
          etiqueta: dificultad
        };
      }
    }

    if (anuncio.archivos.original) {
      return {
        url: anuncio.archivos.original.url,
        etiqueta: 'original'
      };
    }

    return null;
  };

  /* ----------------------------
      PUBLICAR ANUNCIO
  -----------------------------*/
  const publicarAnuncio = async () => {
    if (!anuncioTexto.trim()) {
      setAnuncioError('Debes escribir un anuncio');
      return;
    }

    setAnuncioError('');
    setEnviandoAnuncio(true);

    let archivosFinales = {
      original: null,
      adaptados: {}
    };

    try {
      if (incluirMaterial && anuncioAdjuntos.original) {
        // subir original
        const refOrig = ref(
          storage,
          `clases/${clase.id}/anuncios/${Date.now()}-${anuncioAdjuntos.original.nombre}`
        );

        const upOrig = uploadBytesResumable(refOrig, anuncioAdjuntos.original.archivo);

        upOrig.on('state_changed', (snap) => {
          setProgresoAnuncio(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          );
        });

        await upOrig;

        const urlOrig = await getDownloadURL(refOrig);
        archivosFinales.original = {
          url: urlOrig,
          nombre: anuncioAdjuntos.original.nombre
        };

        // subir adaptados
        for (const dificultad of Object.keys(anuncioAdjuntos.adaptados)) {
          const fileData = anuncioAdjuntos.adaptados[dificultad];

          const refDif = ref(
            storage,
            `clases/${clase.id}/anuncios/${Date.now()}-${fileData.nombre}`
          );

          const upDif = uploadBytesResumable(refDif, fileData.archivo);
          await upDif;

          const urlDif = await getDownloadURL(refDif);

          archivosFinales.adaptados[dificultad] = {
            url: urlDif,
            nombre: fileData.nombre
          };
        }
      }

      await addDoc(collection(db, 'clases', clase.id, 'anuncios'), {
        texto: anuncioTexto,
        fecha: Date.now(),
        incluyeMaterial: incluirMaterial,
        archivos: archivosFinales
      });

      setAnuncioTexto('');
      setAnuncioAdjuntos({ original: null, adaptados: {} });
      setIncluirMaterial(false);
      setProgresoAnuncio(0);
      setEnviandoAnuncio(false);

      cargarAnuncios();
    } catch (err) {
      console.error(err);
      setAnuncioError('Error publicando el anuncio');
      setEnviandoAnuncio(false);
    }
  };


  /* ----------------------------------------------------------
     RENDER PRINCIPAL (ALUMNO O PROFESOR)
  -----------------------------------------------------------*/
  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        esAlumno ? contenedorAlumno : 'bg-slate-50'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ---------------------------------------------
            BOTÓN VOLVER
        ---------------------------------------------- */}
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

        {/* ---------------------------------------------
            CABECERA PARA ALUMNOS
        ---------------------------------------------- */}
        {esAlumno ? (
          <>
            <section
              className={`rounded-3xl p-8 shadow-xl transition-colors ${
                modoAltoContrasteAlumno
                  ? 'bg-slate-800 border border-slate-700 text-white'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
              }`}
            >
              <p className="text-xs uppercase tracking-widest text-white/80">
                Clase adaptada
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div>
                  <h1
                    className={`${
                      textoGrandeAlumno ? 'text-4xl' : 'text-3xl'
                    } font-bold`}
                  >
                    {clase.nombre}
                  </h1>

                  <p
                    className={`${
                      textoGrandeAlumno ? 'text-base' : 'text-sm'
                    } text-white/80 mt-2`}
                  >
                    Profesor/a: {clase.profesorNombre}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 ml-auto">
                  <div className="bg-white/15 rounded-2xl px-4 py-3 text-sm">
                    <p className="text-white/70 uppercase text-[11px]">
                      Materiales
                    </p>
                    <p className="text-2xl font-semibold">
                      {listaCompletaMateriales.length}
                    </p>
                  </div>

                  <div className="bg-white/15 rounded-2xl px-4 py-3 text-sm">
                    <p className="text-white/70 uppercase text-[11px]">
                      Última actualización
                    </p>
                    <p className="text-lg font-semibold">
                      {ultimoMaterial
                        ? new Date(
                            ultimoMaterial.fechaSubida
                          ).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

                {necesidadesAlumno.length > 0 && (
                <div className="mt-6 mb-6">
                  <p
                    className={`${
                      textoGrandeAlumno ? 'text-base' : 'text-sm'
                    } text-white/80 mb-2`}
                  >
                    Apoyos aplicados automáticamente:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {necesidadesAlumno.map((n) => (
                      <span
                        key={n}
                        className={`px-4 py-1 rounded-full text-sm ${modoAltoContrasteAlumno ? 'bg-white/20 text-white' : 'bg-white/20 text-slate-900'}`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ---------------------------------------------
                TARJETAS DE FUNCIONALIDADES ACCESIBLES
            ---------------------------------------------- */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article className={`${tarjetaAlumno} rounded-2xl shadow p-5 flex gap-4`}>
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl self-start">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-current">Lectura y audio</h3>
                  <p
                    className={`${
                      textoGrandeAlumno ? 'text-base' : 'text-sm'
                    } text-slate-600 dark:text-slate-100`}
                  >
                    Escucha el contenido y activa lectura fácil cuando lo necesites.
                  </p>
                </div>
              </article>

              <article className={`${tarjetaAlumno} rounded-2xl shadow p-5 flex gap-4`}>
                <div className="bg-amber-100 text-amber-700 p-3 rounded-xl self-start">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-current">Modo concentración</h3>
                  <p
                    className={`${
                      textoGrandeAlumno ? 'text-base' : 'text-sm'
                    } text-slate-600 dark:text-slate-100`}
                  >
                    Reduce distracciones con alto contraste, temporizador y foco visual.
                  </p>
                </div>
              </article>

              <article
                className={`${tarjetaAlumno} rounded-2xl shadow p-5 flex gap-4 md:col-span-2 xl:col-span-1`}
              >
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl self-start">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-current">Versión simplificada</h3>
                  <p
                    className={`${
                      textoGrandeAlumno ? 'text-base' : 'text-sm'
                    } text-slate-600 dark:text-slate-100`}
                  >
                    Reduce la complejidad de los textos con versiones adaptadas automáticamente.
                  </p>
                </div>
              </article>
            </div>

            {/* ---------------------------------------------
                CONTROLES RÁPIDOS
            ---------------------------------------------- */}
            <div className={`${tarjetaAlumno} rounded-2xl shadow p-5`}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Palette className="w-5 h-5 text-indigo-500" />
                <p className="font-semibold">Accesibilidad rápida</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    setModoAltoContrasteAlumno((p) => !p)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                    modoAltoContrasteAlumno
                      ? 'bg-black text-white border-white/30'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}
                >
                  {modoAltoContrasteAlumno
                    ? 'Desactivar contraste'
                    : 'Activar contraste'}
                </button>

                <button
                  onClick={() => setTextoGrandeAlumno((p) => !p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                    textoGrandeAlumno
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  {textoGrandeAlumno
                    ? 'Tamaño normal'
                    : 'Aumentar texto'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ---------------------------------------------------------
             PROFESOR — CABECERA GENERAL
          ---------------------------------------------------------- */
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm uppercase tracking-wide text-slate-500">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Clase accesible
                </div>

                <h1 className="text-3xl font-bold text-slate-900">
                  {clase.nombre}
                </h1>

                <p className="text-slate-600">
                  Profesor/a: {clase.profesorNombre}
                </p>

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs uppercase text-slate-500">
                      Materiales
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {listaCompletaMateriales.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs uppercase text-slate-500">
                      Última actualización
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {ultimoMaterial
                        ? new Date(
                            ultimoMaterial.fechaSubida
                          ).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs uppercase text-slate-500">
                      Adaptaciones automáticas
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      Activadas
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------
                PANEL PROFESOR – SUBIDA DE ARCHIVOS Y ANUNCIOS
            ------------------------------------------------------- */}
            <aside className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Subida rápida
                  </h2>
                  <p className="text-sm text-slate-500">
                    Sube cualquier archivo. La plataforma generará versiones
                    accesibles automáticamente.
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
                  {/* -------------------------------
                      SUBIR ARCHIVO PROFESOR
                  -------------------------------- */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Adjunta tu documento
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center space-x-2 bg-slate-50 border border-dashed border-slate-300 px-4 py-2 rounded-lg cursor-pointer hover:border-indigo-400">
                        <Paperclip className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm text-slate-700">
                          Seleccionar archivo
                        </span>

                        <input
                          type="file"
                          accept={ACCEPT_ATTR}
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
                      <Info className="w-3 h-3" /> Aceptamos PDF, Word,
                      PowerPoint, texto, imágenes, audio y vídeo.
                    </p>
                  </div>

                  {/* ERROR */}
                  {mensajeError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2 rounded-lg">
                      {mensajeError}
                    </div>
                  )}

                  {/* BARRA DE PROGRESO */}
                  {subiendo && (
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-200"
                        style={{ width: `${progresoSubida}%` }}
                      />
                    </div>
                  )}

                  {/* BOTÓN SUBIR */}
                  <button
                    onClick={subirMaterial}
                    disabled={subiendo}
                    className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                      subiendo
                        ? 'bg-emerald-400 cursor-wait'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {subiendo
                      ? `Procesando (${progresoSubida}%)...`
                      : 'Procesar y compartir'}
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ---------------------------------------------------------
            SECCIÓN PRINCIPAL DE ANUNCIOS
        ---------------------------------------------------------- */}
        <section
          className={`${
            esAlumno && modoAltoContrasteAlumno
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'bg-white'
          } rounded-3xl shadow-xl p-6 md:p-8`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-200">
                Anuncios y avisos
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Comunica y comparte materiales adaptados
              </h2>
            </div>

            {userType === 'profesor' && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                <Megaphone className="w-4 h-4" />
                Publica un anuncio
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------
              FORMULARIO PROFESOR — PUBLICAR ANUNCIO
          ---------------------------------------------------------- */}
          {userType === 'profesor' && (
            <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr] mb-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Texto del anuncio
                </label>

                <textarea
                  value={anuncioTexto}
                  onChange={(e) => setAnuncioTexto(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Comparte recordatorios, instrucciones o avisos importantes"
                />

                {/* checkbox: incluir material */}
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={incluirMaterial}
                    onChange={(e) => setIncluirMaterial(e.target.checked)}
                  />
                  Añadir material adjunto y sus adaptaciones
                </label>

                {/* -------------------------------------
                    SUBIDA DE ARCHIVOS PARA ANUNCIOS
                -------------------------------------- */}
                {incluirMaterial && (
                  <div className="space-y-3 border border-dashed border-indigo-200 rounded-2xl p-4 bg-indigo-50/40">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Archivo original
                        </p>
                        <p className="text-sm text-slate-600">
                          Este será el archivo base visible para quienes no
                          requieren adaptaciones especiales.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center space-x-2 bg-white border border-dashed border-slate-300 px-4 py-2 rounded-lg cursor-pointer hover:border-indigo-400">
                      <Paperclip className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-slate-700">
                        Seleccionar archivo original
                      </span>

                      <input
                        type="file"
                        accept={ACCEPT_ATTR}
                        className="hidden"
                        onChange={(e) =>
                          handleAnuncioArchivoChange(e, 'original')
                        }
                      />
                    </label>

                    {anuncioAdjuntos.original && (
                      <p className="text-sm text-slate-600">
                        {anuncioAdjuntos.original.nombre}
                      </p>
                    )}

                    {/* ADAPTACIONES PERSONALIZADAS */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {dificultadesClase.length === 0 && (
                        <p className="text-sm text-slate-600 sm:col-span-2 lg:col-span-3">
                          No hay necesidades registradas en esta clase.  
                          Solo se pedirá el archivo original.
                        </p>
                      )}

                      {dificultadesClase.map((dificultad) => (
                        <div
                          key={dificultad}
                          className="bg-white rounded-xl p-3 border border-slate-200"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            Adaptación {dificultad}
                          </p>

                          <p className="text-xs text-slate-500 mb-2">
                            Sube la versión ajustada a esta necesidad.
                          </p>

                          <label className="flex items-center space-x-2 bg-slate-50 border border-dashed border-slate-300 px-3 py-2 rounded-lg cursor-pointer hover:border-indigo-400">
                            <Paperclip className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-slate-700">
                              Adjuntar
                            </span>

                            <input
                              type="file"
                              accept={ACCEPT_ATTR}
                              className="hidden"
                              onChange={(e) =>
                                handleAnuncioArchivoChange(e, dificultad)
                              }
                            />
                          </label>

                          {anuncioAdjuntos.adaptados[dificultad] && (
                            <p className="text-xs text-slate-500 mt-1 truncate">
                              {anuncioAdjuntos.adaptados[dificultad].nombre}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MENSAJE DE ERROR */}
                {anuncioError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    {anuncioError}
                  </div>
                )}

                {/* BARRA PROGRESO */}
                {enviandoAnuncio && (
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-200"
                      style={{ width: `${progresoAnuncio}%` }}
                    />
                  </div>
                )}

                {/* BOTÓN PUBLICAR */}
                <button
                  onClick={publicarAnuncio}
                  disabled={enviandoAnuncio}
                  className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                    enviandoAnuncio
                      ? 'bg-indigo-300 cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {enviandoAnuncio
                    ? `Publicando (${progresoAnuncio}%)...`
                    : 'Publicar anuncio'}
                </button>
              </div>

              {/* ---------------------------------------------------------
                  RECOMENDACIONES AUTOMÁTICAS (PROFESOR)
              ---------------------------------------------------------- */}
              <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 space-y-3">
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Pautas de accesibilidad
                </h3>

                <ul className="text-sm text-indigo-900 space-y-2 list-disc list-inside">
                  <li>Dislexia → tipografías legibles y lectura fácil.</li>
                  <li>TDAH → bloques breves y modo concentración.</li>
                  <li>Visual → texto grande y alto contraste.</li>
                  <li>Auditiva → transcripción o subtítulos.</li>
                  <li>Comprensión → resumen o versión simplificada.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------
              LISTADO DE ANUNCIOS (YA CREADOS)
          ---------------------------------------------------------- */}
          {anuncios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-800">No hay anuncios</p>
              <p className="text-sm text-slate-500">
                Cuando el profesor publique un anuncio aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anuncios.map((anuncio) => {
                const archivoAlumno = esAlumno
                  ? obtenerArchivoParaAlumno(anuncio)
                  : null;

                return (
                  <div
                    key={anuncio.id}
                    className={`${tarjetaAlumno} rounded-2xl shadow p-5 flex flex-col gap-3`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/70">
                          Anuncio
                        </p>

                        <p
                          className={`${
                            textoGrandeAlumno ? 'text-lg' : 'text-base'
                          } font-semibold text-current`}
                        >
                          {anuncio.texto}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-white/70 mt-1">
                          Publicado el{' '}
                          {new Date(anuncio.fecha).toLocaleString()}
                        </p>
                      </div>

                      {anuncio.incluyeMaterial && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                          Material adjunto
                        </span>
                      )}
                    </div>

                    {anuncio.incluyeMaterial && (
                      <div className="flex flex-wrap gap-2 items-center">
                        {/* -------- Profesor -------- */}
                        {userType === 'profesor' ? (
                          <>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs">
                              Original listo
                            </span>

                            {Object.entries(
                              anuncio.archivos?.adaptados || {}
                            ).map(([dif]) => (
                              <span
                                key={dif}
                                className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs"
                              >
                                Adaptación {dif}
                              </span>
                            ))}
                          </>
                        ) : (
                          /* -------- Alumno -------- */
                          archivoAlumno && (
                            <a
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                              href={archivoAlumno.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="w-4 h-4" /> Ver versión{' '}
                              {archivoAlumno.etiqueta}
                            </a>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------
            SECCIÓN DE MATERIALES ACCESIBLES (ARCHIVOS)
        ---------------------------------------------------------- */}
        <section
          className={`${
            esAlumno && modoAltoContrasteAlumno
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'bg-white'
          } rounded-3xl shadow-xl p-6 md:p-8`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-white/70">
                Materiales accesibles
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Todo tu contenido adaptado
              </h2>
            </div>

            {esAlumno && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/80">
                <BookOpen className="w-4 h-4" /> Haz clic en un material para
                activar lectura fácil, audio, temporizador o alto contraste.
              </div>
            )}
          </div>

          {/* LISTA DE MATERIALES */}
          {listaCompletaMateriales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No hay materiales disponibles
              </h3>
              <p className="text-slate-500">
                {userType === 'profesor'
                  ? 'Sube un material para generar automáticamente sus adaptaciones.'
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
