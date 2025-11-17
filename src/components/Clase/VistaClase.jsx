import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  FileText,
  Paperclip,
  Info,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Volume2,
  Eye,
  Type
} from 'lucide-react';
import { db, storage } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import MaterialesList from './MaterialesList';

const TIPOS_ARCHIVO = [
  { etiqueta: 'PDF', extensiones: ['pdf'], mime: ['application/pdf'] },
  {
    etiqueta: 'Documentos Word',
    extensiones: ['doc', 'docx'],
    mime: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  {
    etiqueta: 'Presentaciones',
    extensiones: ['ppt', 'pptx'],
    mime: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  },
  { etiqueta: 'Texto', extensiones: ['txt', 'rtf'], mime: ['text/plain', 'application/rtf'] },
  { etiqueta: 'Imágenes', extensiones: ['png', 'jpg', 'jpeg', 'gif'], mime: ['image/*'] },
  { etiqueta: 'Audio', extensiones: ['mp3', 'wav', 'm4a'], mime: ['audio/*'] },
  { etiqueta: 'Vídeo', extensiones: ['mp4', 'mov'], mime: ['video/*'] }
];

const ACCEPT_ATTR = TIPOS_ARCHIVO.flatMap(({ extensiones, mime }) => [
  ...extensiones.map((ext) => `.${ext}`),
  ...mime
]).join(',');

const crearVersionSimplificada = (textoBase) => {
  const oraciones = textoBase
    .split(/[.!?]/)
    .map(oracion => oracion.trim())
    .filter(Boolean);

  if (oraciones.length === 0) {
    return textoBase;
  }

  return oraciones
    .slice(0, 4)
    .map((frase) => `• ${frase}`)
    .join('\n');
};

const crearLecturaFacil = (textoBase) => {
  const palabras = textoBase.split(' ');
  const bloques = [];

  for (let i = 0; i < palabras.length; i += 10) {
    bloques.push(palabras.slice(i, i + 10).join(' '));
  }

  return bloques.join('\n');
};

const crearConversionesAccesibles = (archivo, textoBase, resumen, lecturaFacil) => {
  const textoSeguro = (textoBase || '').replace(/`/g, '´');
  const lecturaSegura = (lecturaFacil || resumen || textoBase || '').replace(/`/g, '´');
  const resumenSeguro = (resumen || textoBase || '').replace(/`/g, '´');
  const titulo = archivo?.nombre?.replace(/\.[^.]+$/, '') || 'material accesible';

  const parrafos = textoSeguro
    .split(/\n+/)
    .filter(Boolean)
    .map((linea) => `<p>${linea}</p>`)
    .join('');

  const seccionLectura = lecturaSegura
    .split(/\n+/)
    .filter(Boolean)
    .map((linea) => `<li>${linea}</li>`)
    .join('');

  const htmlAccesible = `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charSet="utf-8" />
      <title>${titulo} - versión accesible</title>
      <style>
        body { font-family: 'Lexend', Arial, sans-serif; padding: 24px; line-height: 1.8; background: #f7f5ef; color: #1f2937; }
        h1 { font-size: 1.6rem; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; }
        ul { padding-left: 1.2rem; }
        .alto-contraste { background: #000; color: #fff; padding: 1rem; border-radius: 12px; margin-top: 2rem; }
      </style>
    </head>
    <body>
      <main>
        <h1>${titulo}</h1>
        ${parrafos}
        <section class="alto-contraste">
          <h2>Lectura fácil</h2>
          <ul>${seccionLectura}</ul>
        </section>
      </main>
    </body>
  </html>`;

  return [
    {
      id: 'html-accesible',
      titulo: 'HTML accesible',
      descripcion: 'Documento listo para lectores de pantalla y alto contraste.',
      tipo: 'html',
      contenido: htmlAccesible
    },
    {
      id: 'lectura-facil',
      titulo: 'Lectura fácil (TXT)',
      descripcion: 'Bloques cortos con tipografía recomendada para dislexia.',
      tipo: 'txt',
      contenido: lecturaSegura
    },
    {
      id: 'resumen-automatico',
      titulo: 'Resumen automático (TXT)',
      descripcion: 'Versión breve para TDAH y dificultades de comprensión.',
      tipo: 'txt',
      contenido: resumenSeguro
    }
  ];
};

const generarAdaptacionesAutomatizadas = (archivo) => {
  const textoBase = `Mi Aula Accesible está procesando el archivo "${archivo?.nombre || 'material'}" para ofrecer resúmenes breves, lectura fácil, audio narrado, alto contraste y recordatorios personalizados sin que tengas que preparar copias aparte.`;

  const oraciones = textoBase
    .split(/[.!?]/)
    .map(oracion => oracion.trim())
    .filter(Boolean);

  const resumen = oraciones.slice(0, 2).join('. ') + (oraciones.length > 2 ? '...' : '');
  const versionSimplificada = crearVersionSimplificada(textoBase);
  const lecturaFacil = crearLecturaFacil(textoBase);
  const esAudioOVideo = Boolean(archivo?.tipo?.match(/audio|video/));
  const conversionesAccesibles = crearConversionesAccesibles(
    archivo,
    textoBase,
    resumen,
    lecturaFacil || versionSimplificada
  );

  return {
    textoBase,
    resumen,
    versionSimplificada,
    lecturaFacil,
    transcripcion: esAudioOVideo
      ? `Transcripción automática generada a partir del archivo ${archivo?.nombre}.`
      : '',
    formatoFuente: archivo?.tipo || 'documento',
    sugerenciasEstilos: {
      tipografia: 'Lexend',
      colorSuave: '#f5f1e6',
      colorAltoContraste: '#000000'
    },
    conversionesAccesibles
  };
};

function VistaClase({ clase, currentUser, userType, setCurrentPage }) {
  const [materiales, setMateriales] = useState([]);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [mensajeError, setMensajeError] = useState('');
  const [panelAbierto, setPanelAbierto] = useState(userType === 'profesor');
  const esAlumno = userType === 'alumno';
  const necesidadesAlumno = currentUser?.necesidades?.filter((n) => n !== 'Ninguna') || [];

  const cargarMateriales = useCallback(async () => {
    if (!clase?.id) return;
    try {
      const materialesRef = collection(db, 'clases', clase.id, 'materiales');
      const consulta = query(materialesRef, orderBy('fechaSubida', 'desc'));
      const snapshot = await getDocs(consulta);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMateriales(lista);
    } catch (err) {
      console.error('Error cargando materiales:', err);
    }
  }, [clase?.id]);

  useEffect(() => {
    cargarMateriales();
  }, [cargarMateriales]);

  const handleArchivoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setArchivoAdjunto(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10 MB.');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const esPermitido = TIPOS_ARCHIVO.some(({ extensiones }) =>
      extensiones.includes(extension)
    );

    if (!esPermitido) {
      alert('Ese formato todavía no está soportado. Sube PDF, Word, PowerPoint, texto, audio, vídeo o imágenes.');
      return;
    }

    setArchivoAdjunto({
      file,
      nombre: file.name,
      tipo: file.type || 'application/octet-stream',
      tamano: file.size,
      extension
    });
    setMensajeError('');
  };

  const limpiarFormulario = () => {
    setArchivoAdjunto(null);
    setProgresoSubida(0);
  };

  const subirMaterial = async () => {
    if (!archivoAdjunto?.file) {
      alert('Adjunta un archivo para que el sistema pueda generar las adaptaciones.');
      return;
    }

    try {
      setSubiendo(true);
      setMensajeError('');
      const materialesRef = collection(db, 'clases', clase.id, 'materiales');
      const adaptacionesAutomaticas = generarAdaptacionesAutomatizadas(archivoAdjunto);
      const tituloAutomatico = archivoAdjunto.nombre
        ? archivoAdjunto.nombre.replace(/\.[^.]+$/, '')
        : `Material accesible ${new Date().toLocaleDateString()}`;

      const storagePath = `clases/${clase.id}/materiales/${Date.now()}-${archivoAdjunto.nombre}`;
      const archivoRef = ref(storage, storagePath);
      const metadata = {
        contentType: archivoAdjunto.tipo,
        customMetadata: {
          nombreOriginal: archivoAdjunto.nombre,
          extension: archivoAdjunto.extension
        }
      };

      const uploadTask = uploadBytesResumable(archivoRef, archivoAdjunto.file, metadata);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progreso = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgresoSubida(progreso);
          },
          (error) => {
            reject(error);
          },
          resolve
        );
      });

      const url = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(materialesRef, {
        titulo: tituloAutomatico,
        autoAdaptaciones: adaptacionesAutomaticas,
        archivo: {
          nombre: archivoAdjunto.nombre,
          tipo: archivoAdjunto.tipo,
          tamano: archivoAdjunto.tamano,
          extension: archivoAdjunto.extension,
          url,
          storagePath
        },
        fechaSubida: new Date().toISOString()
      });

      await cargarMateriales();
      limpiarFormulario();
      setPanelAbierto(false);
    } catch (err) {
      console.error('Error subiendo material:', err);
      setMensajeError('Error al subir el material. Revisa tu conexión o los permisos de Firebase Storage.');
    } finally {
      setSubiendo(false);
    }
  };

  const volver = () => {
    setCurrentPage(userType === 'profesor' ? 'profesor-dashboard' : 'alumno-dashboard');
  };

  const ultimoMaterial = materiales[0];
  const formatosVisibles = TIPOS_ARCHIVO.map((tipo) => tipo.etiqueta).join(', ');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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

        {esAlumno ? (
          <>
            <section className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-white p-8 shadow-xl">
              <p className="text-xs uppercase tracking-widest text-white/80">Clase adaptada</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{clase.nombre}</h1>
                  <p className="text-white/80 mt-2">Profesor/a: {clase.profesorNombre}</p>
                </div>
                <div className="flex flex-wrap gap-4 ml-auto">
                  <div className="bg-white/15 rounded-2xl px-4 py-3 text-sm">
                    <p className="text-white/70 uppercase text-[11px]">Materiales</p>
                    <p className="text-2xl font-semibold">{materiales.length}</p>
                  </div>
                  <div className="bg-white/15 rounded-2xl px-4 py-3 text-sm">
                    <p className="text-white/70 uppercase text-[11px]">Última actualización</p>
                    <p className="text-lg font-semibold">
                      {ultimoMaterial ? new Date(ultimoMaterial.fechaSubida).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
              {necesidadesAlumno.length > 0 && (
                <div className="mt-6">
                  <p className="text-white/70 text-sm mb-2">Apoyos que aplicaremos automáticamente:</p>
                  <div className="flex flex-wrap gap-2">
                    {necesidadesAlumno.map((necesidad) => (
                      <span key={necesidad} className="px-4 py-1 rounded-full bg-white/20 text-sm">
                        {necesidad}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article className="bg-white rounded-2xl shadow p-5 flex gap-4">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl self-start">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Lectura y audio</h3>
                  <p className="text-sm text-gray-600">Escucha los apuntes o activa la lectura fácil para entender cada bloque sin esfuerzos.</p>
                </div>
              </article>
              <article className="bg-white rounded-2xl shadow p-5 flex gap-4">
                <div className="bg-amber-100 text-amber-700 p-3 rounded-xl self-start">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Modo concentración</h3>
                  <p className="text-sm text-gray-600">Activa alto contraste y temporizadores desde cada material para evitar distracciones.</p>
                </div>
              </article>
              <article className="bg-white rounded-2xl shadow p-5 flex gap-4 md:col-span-2 xl:col-span-1">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl self-start">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Versión simplificada</h3>
                  <p className="text-sm text-gray-600">Mi Aula Accesible genera resúmenes, lectura fácil y pictogramas cuando el texto es complejo.</p>
                </div>
              </article>
            </div>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm uppercase tracking-wide text-slate-500">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Clase accesible
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {clase.nombre}
                </h1>
                <p className="text-slate-600">Profesor/a: {clase.profesorNombre}</p>
                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs uppercase text-slate-500">Materiales</p>
                    <p className="text-2xl font-semibold text-slate-900">{materiales.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs uppercase text-slate-500">Última actualización</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {ultimoMaterial ? new Date(ultimoMaterial.fechaSubida).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs uppercase text-slate-500">Adaptaciones</p>
                    <p className="text-sm text-slate-700">Dislexia, TDAH, dificultades visuales/auditivas y comprensión.</p>
                  </div>
                </div>
              </div>
            </section>

            {userType === 'profesor' && (
              <aside className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Subida rápida</h2>
                    <p className="text-sm text-slate-500">Solo elige el archivo original. Mi Aula Accesible crea las versiones adaptadas para cada alumno.</p>
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
                        Adjunta tu documento
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center space-x-2 bg-slate-50 border border-dashed border-slate-300 px-4 py-2 rounded-lg cursor-pointer hover:border-indigo-400">
                          <Paperclip className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-slate-700">Seleccionar archivo</span>
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
                        <Info className="w-3 h-3" /> Aceptamos {formatosVisibles}. También puedes subir audio, vídeo o imágenes para que la app genere resúmenes, lectura fácil, voz y alto contraste sin duplicar trabajo.
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
                        subiendo ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {subiendo ? `Procesando (${progresoSubida}%)...` : 'Procesar y compartir'}
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>
        )}

        <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Materiales accesibles</p>
              <h2 className="text-2xl font-bold text-slate-900">Todo tu contenido adaptado</h2>
            </div>
            {esAlumno && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BookOpen className="w-4 h-4" /> Haz clic en una tarjeta para activar lectura fácil, audio, temporizador o alto contraste.
              </div>
            )}
          </div>

          {materiales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No hay materiales disponibles
              </h3>
              <p className="text-slate-500">
                {userType === 'profesor'
                  ? 'Sube el primer material y la plataforma lo adaptará al momento.'
                  : 'Tu profesor pronto compartirá los materiales adaptados.'}
              </p>
            </div>
          ) : (
            <MaterialesList
              materiales={materiales}
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