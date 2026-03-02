import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/useAuthStore";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
      : "linear-gradient(135deg, #e0f7fa, #b2ebf2, #80deea)"};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 380px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.accent};
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  margin: 0.6rem 0;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: 0.3s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  &::before {
    margin-right: 0.75em;
  }
  &::after {
    margin-left: 0.75em;
  }
`;

const BackButton = styled.button`
  margin-top: 1rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

function normalizarRol(rol = "") {
  const limpio = String(rol)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (limpio === "admin" || limpio === "administrador") return "admin";
  if (limpio === "tecnico" || limpio === "tecnica") return "tecnico";
  return "none";
}

function traducirErrorAuth(error) {
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return "Correo o contrasena incorrectos.";
  }
  if (msg.includes("email not confirmed")) {
    return "Debes confirmar el correo antes de iniciar sesion.";
  }
  if (msg.includes("too many requests")) {
    return "Demasiados intentos. Espera un momento e intenta de nuevo.";
  }
  return error?.message || "No se pudo iniciar sesion.";
}

export default function LoginAdmin() {
  const navigate = useNavigate();
  const cargarSesion = useAuthStore((state) => state.cargarSesion);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const validarRolYRedirigir = useCallback(async (emailUsuario) => {
    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("rol")
      .ilike("email", emailUsuario)
      .maybeSingle();

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al validar el usuario",
        text: "No se pudo verificar tu rol. Intenta de nuevo.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (!usuario?.rol) {
      await supabase.auth.signOut();
      await cargarSesion();
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Tu cuenta existe en Auth, pero no esta registrada en la tabla usuarios.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    const rol = normalizarRol(usuario.rol);
    if (rol === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    if (rol === "tecnico") {
      navigate("/tecnico/tickets", { replace: true });
      return;
    }

    await supabase.auth.signOut();
    await cargarSesion();
    Swal.fire({
      icon: "warning",
      title: "Rol no valido",
      text: `El rol "${usuario.rol}" no tiene acceso al sistema.`,
      confirmButtonColor: "#00bcd4",
    });
  }, [cargarSesion, navigate]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.email) return;
      await cargarSesion();
      await validarRolYRedirigir(data.user.email);
    };
    checkSession();
  }, [cargarSesion, validarRolYRedirigir]);

  const handleLoginConCorreo = async (e) => {
    e.preventDefault();
    const correo = email.trim();
    if (!correo || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Debes ingresar correo y contrasena.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    setLoadingLogin(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password,
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "No se pudo iniciar sesion",
          text: traducirErrorAuth(error),
          confirmButtonColor: "#00bcd4",
        });
        return;
      }

      const userEmail = data?.user?.email || correo;
      await cargarSesion();
      await validarRolYRedirigir(userEmail);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
      },
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al iniciar sesion con Google.",
        confirmButtonColor: "#00bcd4",
      });
      setLoadingGoogle(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Acceso al panel</Title>
        <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Inicia sesion para acceder a tu cuenta.
        </p>

        <form onSubmit={handleLoginConCorreo}>
          <Input
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loadingLogin}>
            {loadingLogin ? "Iniciando..." : "Iniciar sesion"}
          </Button>
        </form>

        <Divider>o</Divider>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={{ width: "20px", marginRight: "8px", verticalAlign: "middle" }}
          />
          {loadingGoogle ? "Redirigiendo..." : "Acceder con Google"}
        </Button>

        <BackButton onClick={() => navigate("/")}>Volver al inicio</BackButton>
      </Card>
    </Container>
  );
}
