import { useEffect } from "react";
import { ThemeProviderApp } from "./context/ThemeContext";
import AppRouter from "./router/AppRouter";
import { useAuthStore } from "./store/useAuthStore";

export default function App() {
  const cargarSesion = useAuthStore((state) => state.cargarSesion);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    cargarSesion();
  }, []);

  // Mientras carga sesión, mostrar una pantalla suave
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#00bcd4",
          fontSize: "1.2rem",
        }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <ThemeProviderApp>
      <AppRouter />
    </ThemeProviderApp>
  );
}
