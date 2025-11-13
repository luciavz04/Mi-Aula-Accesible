# 🧠 EduAdapt – Plataforma Educativa Accesible

**EduAdapt** es una página web creada con **React (Create React App)** que tiene como objetivo facilitar la labor docente, permitiendo a los profesores registrar alumnos, crear clases y subir **materiales adaptados** a diversas necesidades educativas:

* Dislexia
* TDAH (Trastorno por Déficit de Atención con Hiperactividad)
* Discapacidad visual
* Discapacidad auditiva
* Mejora de la comprensión lectora
* Otras necesidades específicas.

El proyecto utiliza **Firebase Firestore** como **base de datos en la nube** para almacenar de forma segura toda la información de alumnos, clases y materiales.

---

## 🚀 Guía Rápida para la Ejecución del Proyecto

Sigue estos pasos para poner en marcha el proyecto **EduAdapt** en tu entorno local. No se requiere experiencia previa con React o Firebase.

---

### 🧩 1. Instalación de Node.js

Para ejecutar el proyecto de React, necesitas tener instalado **Node.js** (que incluye el gestor de paquetes `npm`).

1.  Descarga el instalador desde el sitio oficial: 👉 [https://nodejs.org](https://nodejs.org)
2.  Instala con las opciones por defecto.
3.  **Verifica la instalación** abriendo tu terminal (Símbolo del Sistema, PowerShell o Terminal) y ejecutando:

    ```bash
    node -v
    npm -v
    ```
    Si ves los números de versión (ej. `v20.10.0`), todo es correcto. ✅

---

### 📦 2. Instalación de Dependencias del Proyecto

Una vez que tengas Node.js, debes descargar todas las librerías necesarias (React, Firebase, etc.).

1.  Abre Visual Studio Code (o tu IDE preferido).
2.  Abre la terminal integrada (o la externa) y **asegúrate de estar en la carpeta raíz del proyecto** (donde se encuentra el archivo `package.json`).
3.  Ejecuta el siguiente comando:

    ```bash
    npm install
    ```
    > **Nota:** Este paso solo es necesario la primera vez que clonas el proyecto o si las dependencias cambian.

---

### 🔥 3. Conexión con Firebase (Configuración Inicial)

El archivo `src/firebase.js` es crucial, ya que establece la conexión con la base de datos Firestore.

1.  Accede a la Consola de Firebase: [https://console.firebase.google.com](https://console.firebase.google.com)
2.  Abre tu proyecto (o crea uno) llamado **EduAdapt**.
3.  Ve a **Configuración del proyecto** (icono de rueda dentada) → **Tus apps** → **Web** (`</>`).
4.  Copia el bloque de configuración que Firebase te proporciona (se verá similar a esto):

    ```javascript
    const firebaseConfig = {
      apiKey: "TU_API_KEY",
      authDomain: "TU_AUTH_DOMAIN",
      projectId: "TU_PROJECT_ID",
      storageBucket: "TU_STORAGE_BUCKET",
      messagingSenderId: "TU_SENDER_ID",
      appId: "TU_APP_ID"
    };
    ```

5.  Abre o crea el archivo **`src/firebase.js`** en tu proyecto y pégalo utilizando el siguiente formato:

    ```javascript
    // src/firebase.js
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
      // Pega aquí tu configuración copiada
      apiKey: "TU_API_KEY",
      authDomain: "TU_AUTH_DOMAIN",
      projectId: "TU_PROJECT_ID",
      storageBucket: "TU_STORAGE_BUCKET",
      messagingSenderId: "TU_SENDER_ID",
      appId: "TU_APP_ID"
    };

    // Inicializa Firebase
    const app = initializeApp(firebaseConfig);
    // Exporta la conexión a Firestore (la base de datos)
    export const db = getFirestore(app);
    ```

6.  Guarda los cambios y la conexión estará lista. ✅

---

### ▶️ 4. Ejecución de la Aplicación

Para iniciar el servidor de desarrollo y ver la plataforma en tu navegador:

1.  En la terminal del proyecto, ejecuta:

    ```bash
    npm start
    ```
2.  Esto abrirá automáticamente la aplicación en tu navegador:
    👉 **http://localhost:3000**

    > **Consejo:** El servidor se reiniciará y la página se actualizará automáticamente cada vez que guardes un archivo. Para detener el servidor, pulsa `Ctrl + C` en la terminal.

---

## 👩‍🏫 Cómo Usar la Plataforma

El flujo de trabajo principal está diseñado para el docente:

### Paso 1️⃣ — Acceso como Profesor

* Desde la pantalla principal de **EduAdapt**, haz clic en el botón **“Soy Profesor”**.
* Si no tienes una cuenta, selecciona **“Crear Cuenta”** y completa el registro para acceder al panel.

### Paso 2️⃣ — Panel del Profesor

Una vez dentro, el profesor tiene acceso a las siguientes funcionalidades clave:

| Función | Descripción | Almacenamiento |
| :--- | :--- | :--- |
| 🧾 **Registrar alumnos** | Permite guardar datos de nuevos alumnos (nombre, apellidos, usuario, DNI y contraseña). | Firebase |
| 🏫 **Crear clases** | Asigna un nombre a la clase y selecciona alumnos ya registrados para incluirlos en ella. | Firebase |
| 📚 **Ver clases creadas** | Muestra un listado de todas las clases creadas por el profesor. | N/A |

Al hacer clic en una clase listada, el profesor puede **ver los alumnos asignados** o **añadir materiales** adaptados.