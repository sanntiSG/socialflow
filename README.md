# 🚀 SocialFlow

Plataforma profesional para creadores de contenido, influencers y agencias. Publicá en Instagram, TikTok, YouTube y Facebook desde un solo lugar, con vista previa real de cada red social.

---

## ✨ Características

- 📱 **Vista previa en tiempo real** — TikTok, Instagram Reel, YouTube Short, Facebook Post
- 🌐 **Multi-red simultánea** — Publicá en todas tus redes de una vez
- ⏰ **Publicaciones programadas** — Elegí fecha y hora, se publica automáticamente
- 📊 **Dashboard con métricas** — Estadísticas de actividad y engagement
- 🔐 **Google OAuth** — Login seguro con Google
- 📂 **Almacenamiento mínimo** — Solo archivos de publicaciones programadas (Cloudinary)
- 📱 **100% Responsive** — Funciona en mobile, tablet y desktop

---

## 🛠 Stack

| Parte | Tecnología |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | React + TypeScript + Framer Motion |
| Base de datos | MongoDB Atlas |
| Autenticación | Google OAuth + JWT |
| Almacenamiento | Cloudinary (solo programadas) |
| Deploy Backend | Render |
| Deploy Frontend | Netlify |

---

## 🚀 Inicio rápido

### 1. Clonar e instalar

```bash
git clone <repo>
cd socialflow
npm run install:all
```

### 2. Configurar variables de entorno

**Backend:**
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Editar .env con la URL del backend
```

### 3. Iniciar en desarrollo

```bash
# Desde la raíz (arranca backend y frontend juntos)
npm run dev

# O por separado:
npm run dev:backend   # Puerto 5000
npm run dev:frontend  # Puerto 3000
```

---

## 🔑 Configuración de credenciales

### Google OAuth (obligatorio para login)
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto → APIs & Services → Credentials → OAuth 2.0 Client IDs
3. Authorized JavaScript origins: `http://localhost:3000`
4. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copiar Client ID y Client Secret al `.env`

### MongoDB Atlas
1. Ir a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crear cluster gratuito
3. Database Access → Crear usuario
4. Network Access → Agregar IP (0.0.0.0/0 para acceso universal)
5. Connect → Drivers → Copiar URI al `.env`

### Cloudinary (para publicaciones programadas)
1. Registrarse en [cloudinary.com](https://cloudinary.com) (gratis)
2. Copiar Cloud Name, API Key y API Secret al `.env`

### Redes Sociales (para publicar)
Cada red requiere crear una app en su portal de desarrolladores:

| Red | Portal |
|---|---|
| Facebook/Instagram | https://developers.facebook.com |
| TikTok | https://developers.tiktok.com |
| YouTube | Google Cloud Console (YouTube Data API v3) |

---

## 🌐 Acceso desde red local (otros dispositivos)

Para acceder desde tu teléfono u otro dispositivo en la misma red, y que Google OAuth funcione:

1. Obtener tu IP local:
   - **Windows:** `ipconfig` → IPv4 Address
   - **Mac/Linux:** `ifconfig` → inet

2. Usar `nip.io` para crear un dominio:
   - Frontend: `http://192.168.X.XX.nip.io:3000`
   - Backend: `http://192.168.X.XX.nip.io:5000`

3. Agregar estas URLs en Google Cloud Console:
   - Authorized JavaScript origins: `http://192.168.X.XX.nip.io:3000`
   - Authorized redirect URIs: `http://192.168.X.XX.nip.io:5000/api/auth/google/callback`

4. Actualizar el `.env` del backend:
   ```
   FRONTEND_URL=http://192.168.X.XX.nip.io:3000
   BACKEND_URL=http://192.168.X.XX.nip.io:5000
   ```

---

## 🚀 Despliegue

### Backend en Render
1. Crear cuenta en [render.com](https://render.com)
2. New → Web Service → conectar repositorio GitHub
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && npm start`
5. Agregar todas las variables de entorno del `.env.example`
6. Guardar la URL generada (ej: `https://socialflow-api.onrender.com`)

### Frontend en Netlify
1. Crear cuenta en [netlify.com](https://netlify.com)
2. New site → conectar repositorio GitHub
3. Base directory: `frontend`
4. Build command: `npm run build`
5. Publish directory: `build`
6. Variables de entorno:
   ```
   REACT_APP_API_URL=https://socialflow-api.onrender.com
   ```

---

## 📁 Estructura del proyecto

```
socialflow/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/       # User, Post
│   │   ├── routes/       # auth, posts, stats, networks
│   │   ├── middleware/   # auth JWT/session
│   │   ├── services/     # publisher, scheduler
│   │   └── utils/        # db, cloudinary, passport, jwt
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/   # Sidebar, Layout
│   │   │   └── preview/  # NetworkPreview (TikTok, Instagram, YouTube, Facebook)
│   │   ├── pages/        # Login, Dashboard, Create, Posts, Scheduled, Settings
│   │   ├── context/      # AuthContext
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript types
│   ├── .env.example
│   └── package.json
├── render.yaml
├── netlify.toml
└── README.md
```

---

## 📝 API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/auth/google` | Iniciar OAuth Google |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/logout` | Cerrar sesión |
| POST | `/api/auth/connect-network` | Conectar red social |
| DELETE | `/api/auth/disconnect-network/:net` | Desconectar red |
| POST | `/api/posts` | Crear publicación |
| POST | `/api/posts/upload` | Subir archivo a Cloudinary |
| GET | `/api/posts` | Listar publicaciones |
| DELETE | `/api/posts/:id` | Eliminar publicación |
| GET | `/api/stats/dashboard` | Estadísticas |
| GET | `/api/networks/supported` | Redes soportadas |

---

## 🎨 Previsualizaciones

| Red | Tipo | Vista |
|---|---|---|
| TikTok | Video | Vertical (9:16) estilo TikTok |
| Instagram | Video | Reel vertical |
| Instagram | Imagen | Post cuadrado |
| YouTube | Video | Short vertical |
| Facebook | Imagen/Video | Post estándar |

---

## 📄 Licencia

MIT — Uso libre para proyectos personales y comerciales.
