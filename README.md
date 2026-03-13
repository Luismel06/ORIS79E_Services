# ORIS79E Services

Aplicación web para la gestión de servicios técnicos, tickets y cotizaciones de ORIS79E Services. Incluye portal público, panel administrativo y panel técnico con autenticación por roles.

## Características
- Portal público con páginas de inicio, servicios, publicaciones, contacto y nosotros.
- Solicitud de servicios con validaciones dominicanas (cédula/RNC), consulta de caso y notificaciones por correo.
- Panel administrador con dashboard, usuarios, servicios, productos, publicaciones, tickets y cotizaciones.
- Panel técnico con agenda/calendario, tickets asignados y detalle con evidencias.
- Generación y descarga de cotizaciones en PDF.
- Autenticación y autorización por roles mediante Supabase (email/contraseña y Google OAuth).

## Stack
- React 19 + Vite 7
- React Router
- Supabase JS
- Zustand
- Styled Components + Framer Motion
- Recharts, FullCalendar, React Big Calendar
- jsPDF, pdfmake, jspdf-autotable.

## Requisitos
- Node.js y npm

## Instalación
1. `npm install`
2. Crear `.env` con las variables necesarias.
3. `npm run dev`

## Variables de entorno
Crear un archivo `.env` en la raíz del proyecto:

```dotenv
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_TEMPLATE_ASIGNACION_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
VITE_REDIRECT_URL=...
VITE_EMPRESA_BANCO=...
VITE_EMPRESA_TITULAR_CUENTA=...
VITE_EMPRESA_CUENTA_BANCO=...
VITE_EMPRESA_RPE=...
```

Notas:
- Las variables sin prefijo `VITE_` no se exponen al cliente. Si usas claves sensibles como `SUPABASE_SERVICE_ROLE_KEY`, mantenlas solo en entornos de servidor o scripts internos.
- La URL de redirección de OAuth también debe configurarse en Supabase y en Google Cloud Console.

## Scripts
- `npm run dev` inicia el servidor de desarrollo de Vite.
- `npm run build` genera el bundle de producción.
- `npm run preview` levanta una vista previa del build.
- `npm run lint` ejecuta ESLint.

## Rutas principales
```text
/                       (portal cliente)
/servicios              (solicitud de servicios)
/publicaciones
/contacto
/nosotros
/admin                  (dashboard admin)
/admin/usuarios
/admin/tickets
/admin/productos
/admin/servicios
/admin/publicaciones
/admin/cotizaciones
/admin/cotizaciones/:id
/tecnico/dashboard
/tecnico/tickets
/tecnico/tickets/:id
/tecnico/calendario
/login                  (login admin/tecnico)
```

## Supabase (tablas usadas)
- usuarios
- servicios
- productos
- solicitudes
- cotizaciones
- cotizacion_items
- detalle_cotizacion
- publicaciones
- imagenes_publicacion
- historial_tickets
- tecnico_requests
- tickets_evidencias

## Despliegue
- Proyecto preparado para despliegue SPA (por ejemplo Vercel). Rewrites ya definidos en `vercel.json`.
