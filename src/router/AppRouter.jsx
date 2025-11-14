import { createBrowserRouter, RouterProvider } from "react-router-dom";

// --- Guards ---
import RouteGuard from "../components/RouteGuard";

// --- Layouts ---
import { ClienteLayout } from "../layouts/ClienteLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { TecnicoLayout } from "../layouts/TecnicoLayout";

// --- Páginas del cliente ---
import Inicio from "../pages/cliente/Inicio";
import Servicios from "../pages/cliente/Servicios";
import Publicaciones from "../pages/cliente/Publicaciones";
import Contacto from "../pages/cliente/Contacto";
import Nosotros from "../pages/cliente/Nosotros";

// --- Páginas del admin ---
import Dashboard from "../pages/admin/Dashboard";
import Usuarios from "../pages/admin/Usuarios";
import Tickets from "../pages/admin/Tickets";
import Productos from "../pages/admin/Productos";
import ServiciosAdmin from "../pages/admin/Servicios";
import PublicacionesAdmin from "../pages/admin/Publicaciones";
import Cotizaciones from "../pages/admin/Cotizaciones";
import VistaCotizacion from "../pages/admin/VistaCotizacion";

// --- Páginas técnico ---
import TicketsTecnico from "../pages/tecnico/TicketsTecnico";
import CalendarioTecnico from "../pages/tecnico/CalendarioTecnico";
import TicketTecnicoDetalle from "../pages/tecnico/TicketTecnicoDetalle";
import DashboardTecnico from "../pages/tecnico/DashboardTecnico";

// --- Login ---
import LoginAdmin from "../pages/admin/LoginAdmin";

// --- Página no autorizado ---
import NoAutorizado from "../pages/NoAutorizado";

// --- Página de error ---
function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "5rem 1rem",
        color: "#00bcd4",
        fontFamily: "sans-serif",
      }}
    >
      <h1>404 - Página no encontrada</h1>
      <p>La ruta solicitada no existe.</p>
      <a
        href="/"
        style={{
          color: "white",
          background: "#00bcd4",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          textDecoration: "none",
          display: "inline-block",
          marginTop: "1rem",
        }}
      >
        Volver al inicio
      </a>
    </div>
  );
}

const router = createBrowserRouter([
  // === CLIENTE ===
  {
    path: "/",
    element: <ClienteLayout />,
    children: [
      { path: "/", element: <Inicio /> },
      { path: "/servicios", element: <Servicios /> },
      { path: "/publicaciones", element: <Publicaciones /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/nosotros", element: <Nosotros /> },
    ],
  },

  // === ADMIN (solo admin) ===
  {
    path: "/admin",
    element: (
      <RouteGuard allowed={["admin"]}>
        <AdminLayout />
      </RouteGuard>
    ),
    children: [
      { path: "/admin", element: <Dashboard /> },
      { path: "/admin/usuarios", element: <Usuarios /> },
      { path: "/admin/tickets", element: <Tickets /> },
      { path: "/admin/productos", element: <Productos /> },
      { path: "/admin/servicios", element: <ServiciosAdmin /> },
      { path: "/admin/publicaciones", element: <PublicacionesAdmin /> },
      { path: "/admin/cotizaciones", element: <Cotizaciones /> },
      { path: "/admin/cotizaciones/:id", element: <VistaCotizacion /> },
    ],
  },

  // === TÉCNICO (solo tecnico) ===
  {
    path: "/tecnico",
    element: (
      <RouteGuard allowed={["tecnico"]}>
        <TecnicoLayout />
      </RouteGuard>
    ),
    children: [
      { path: "/tecnico/dashboard", element: <DashboardTecnico /> },
     { path: "/tecnico/tickets", element: <TicketsTecnico /> },
    { path: "/tecnico/tickets/:id", element: <TicketTecnicoDetalle /> },
    { path: "/tecnico/calendario", element: <CalendarioTecnico /> },
    ],
  },

  // === Login ===
  { path: "/admin/login", element: <LoginAdmin /> },
  { path: "/login", element: <LoginAdmin /> },

  // === No autorizado ===
  { path: "/no-autorizado", element: <NoAutorizado /> },

  // === Error 404 ===
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
