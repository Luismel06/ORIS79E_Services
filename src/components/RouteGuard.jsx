import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function RouteGuard({ children, allowed }) {
  const { user, rol } = useAuthStore();

  // Si no hay sesión, enviarlo al login
  if (!user) return <Navigate to="/login" replace />;

  // Si su rol no está permitido → bloquear
  if (!allowed.includes(rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
