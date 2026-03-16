# NexuStoreRD v4.9 — Sistema de Gestión
by Jeffrey Vargas

## Archivos del proyecto
- `src/App.js` — Login con Firebase Auth + sincronización Firestore
- `src/NexuStoreRD.jsx` — Sistema completo adaptado para Firebase
- `src/firebase.js` — Configuración de Firebase
- `firestore.rules` — Reglas de seguridad de Firestore
- `package.json` — Dependencias del proyecto

---

## PASO 1 — Crear usuarios en Firebase

1. Ve a https://console.firebase.google.com
2. Selecciona el proyecto **NexuStoreRD**
3. Menú izquierdo → **Authentication** → pestaña **"Usuarios"**
4. Click **"Agregar usuario"**
5. Ingresa el correo y contraseña del Usuario 1
6. Repite para el Usuario 2

---

## PASO 2 — Configurar reglas de Firestore

1. En Firebase Console → **Firestore Database** → pestaña **"Reglas"**
2. Borra todo el contenido actual
3. Pega el contenido del archivo `firestore.rules`
4. Click **"Publicar"**

---

## PASO 3 — Subir a GitHub

1. Crea cuenta en https://github.com
2. Nuevo repositorio → nombre: `nexustorerd` → Público
3. Sube todos estos archivos manteniendo la estructura:
   ```
   nexustorerd/
   ├── src/
   │   ├── App.js
   │   ├── NexuStoreRD.jsx
   │   ├── firebase.js
   │   └── index.js
   ├── package.json
   ├── firestore.rules
   └── README.md
   ```

---

## PASO 4 — Publicar en Vercel (link web gratis)

1. Ve a https://vercel.com
2. Regístrate con tu cuenta de GitHub
3. Click **"New Project"** → importa el repositorio `nexustorerd`
4. En **Framework Preset** selecciona **"Create React App"**
5. Click **"Deploy"**
6. En ~2 minutos Vercel te da un link tipo: `nexustorerd.vercel.app`
7. ¡Comparte ese link con tu socio!

---

## Cómo funciona

- Ambos entran al mismo link desde sus casas
- Cada quien inicia sesión con su usuario y contraseña
- Cualquier cambio que haga uno se refleja en el otro en menos de 2 segundos
- Los datos están guardados en Firebase (Google), no en la computadora
- Botón "SALIR" en la esquina superior derecha para cerrar sesión

---

## Soporte
Sistema desarrollado con React + Firebase Firestore + Firebase Auth
Plan Spark de Firebase (gratuito) — sin costo mensual
