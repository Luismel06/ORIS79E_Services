import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import Swal from "sweetalert2";
import {
  ClipboardList,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { supabase } from "../supabase/supabase.config.jsx";
import logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";

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

const NAV_ITEMS = [
  { path: "/admin", title: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/usuarios", title: "Usuarios", icon: Users },
  { path: "/admin/servicios", title: "Servicios", icon: Wrench },
  { path: "/admin/productos", title: "Productos", icon: ShoppingBag },
  { path: "/admin/tickets", title: "Tickets", icon: ClipboardList },
  { path: "/admin/publicaciones", title: "Publicaciones", icon: FileText },
  { path: "/admin/cotizaciones", title: "Cotizaciones", icon: DollarSign },
];

function obtenerTitulo(pathname) {
  if (pathname.startsWith("/admin/cotizaciones/")) return "Detalle de cotizacion";
  if (pathname.startsWith("/admin/tickets")) return "Gestion de tickets";
  const item = NAV_ITEMS.find((nav) => nav.path === pathname);
  return item?.title || "Panel administrador";
}

const NoPaddingGlobal = createGlobalStyle`
  html, body, #root {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 100%;
    overflow-x: hidden;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  gap: 1rem;
`;

const SpinningLogo = styled.img`
  width: 90px;
  height: 90px;
  animation: ${spin} 2.5s linear infinite;
  filter: drop-shadow(0 0 10px ${({ theme }) => theme.accent});
`;

const LoadingText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
`;

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Sidebar = styled.aside`
  width: 250px;
  min-height: 100vh;
  background: ${({ theme }) => theme.cardBackground};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 1200;

  @media (max-width: 960px) {
    position: fixed;
    left: 0;
    width: min(280px, 84vw);
    transform: ${({ $open }) =>
      $open ? "translateX(0)" : "translateX(calc(-100% - 20px))"};
    transition: transform 0.25s ease;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  }
`;

const SidebarHeader = styled.div`
  padding: 1rem 1rem 0.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;

  img {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  div {
    line-height: 1.15;
  }

  strong {
    display: block;
    font-size: 0.92rem;
    color: ${({ theme }) => theme.accent};
  }

  span {
    font-size: 0.76rem;
    opacity: 0.78;
  }
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: none;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: rgba(0, 188, 212, 0.15);
    color: ${({ theme }) => theme.accent};
  }

  @media (max-width: 960px) {
    display: grid;
  }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  gap: 0.35rem;
`;

const NavButton = styled.button`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? "rgba(0, 188, 212, 0.4)" : "transparent"};
  background: ${({ $active }) =>
    $active ? "rgba(0, 188, 212, 0.16)" : "transparent"};
  color: ${({ $active, theme }) => ($active ? theme.accent : theme.text)};
  border-radius: 10px;
  padding: 0.7rem 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-align: left;
  transition: 0.2s;

  &:hover {
    background: rgba(0, 188, 212, 0.14);
    color: ${({ theme }) => theme.accent};
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.75rem 1.1rem;
  background: ${({ theme }) => theme.cardBackground};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (max-width: 560px) {
    padding: 0.65rem 0.75rem;
  }
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
`;

const MenuButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: none;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: rgba(0, 188, 212, 0.14);
    color: ${({ theme }) => theme.accent};
  }

  @media (max-width: 960px) {
    display: grid;
  }
`;

const CurrentTitle = styled.h1`
  margin: 0;
  font-size: clamp(1rem, 2.2vw, 1.32rem);
  color: ${({ theme }) => theme.accent};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
`;

const Email = styled.span`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.85;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 700px) {
    display: none;
  }
`;

const ActionIconButton = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    color: ${({ theme }) => theme.accent};
    border-color: ${({ theme }) => theme.accent};
  }
`;

const LogoutButton = styled.button`
  border: none;
  background: ${({ theme }) => theme.accent};
  color: #fff;
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 560px) {
    span {
      display: none;
    }
    padding: 0.55rem 0.65rem;
  }
`;

const PageViewport = styled.section`
  flex: 1;
  overflow: auto;
  padding: 1rem 1.2rem 1.4rem;

  @media (max-width: 560px) {
    padding: 0.75rem 0.75rem 1rem;
  }
`;

const Backdrop = styled.button`
  position: fixed;
  inset: 0;
  border: none;
  background: rgba(5, 10, 20, 0.55);
  z-index: 1100;
  display: none;

  @media (max-width: 960px) {
    display: ${({ $open }) => ($open ? "block" : "none")};
  }
`;

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const userEmail = data.user.email;
      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("email", userEmail)
        .single();

      if (perfilError || !perfil) {
        await supabase.from("usuarios").insert([{ email: userEmail, rol: "tecnico" }]);
        navigate("/tecnico/tickets", { replace: true });
        return;
      }

      const rol = normalizarRol(perfil.rol);
      if (rol === "admin") {
        setUser(data.user);
        setCheckingAuth(false);
        return;
      }

      if (rol === "tecnico") {
        navigate("/tecnico/tickets", { replace: true });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Tu rol no tiene permisos para acceder a esta seccion.",
        confirmButtonColor: "#00bcd4",
      });
      navigate("/", { replace: true });
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const currentPath = location.pathname;
  const currentTitle = useMemo(() => obtenerTitulo(currentPath), [currentPath]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sb-coyghdbczlwnvfjvrdao-auth-token");
    sessionStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  if (checkingAuth) {
    return (
      <LoadingScreen>
        <SpinningLogo src={logo} alt="ORIS79E Services Logo" />
        <LoadingText>Verificando credenciales...</LoadingText>
      </LoadingScreen>
    );
  }

  return (
    <>
      <NoPaddingGlobal />

      <Backdrop
        type="button"
        aria-label="Cerrar menu lateral"
        $open={menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <Shell>
        <Sidebar $open={menuOpen}>
          <SidebarHeader>
            <Brand>
              <img src={logo} alt="ORIS79E Services" />
              <div>
                <strong>ORIS79E</strong>
                <span>Panel Admin</span>
              </div>
            </Brand>
            <CloseButton
              type="button"
              aria-label="Cerrar menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={20} />
            </CloseButton>
          </SidebarHeader>

          <NavList>
            {NAV_ITEMS.map(({ path, title, icon: Icon }) => {
              const isActive =
                path === "/admin/cotizaciones"
                  ? currentPath.startsWith("/admin/cotizaciones")
                  : currentPath === path;

              return (
                <NavButton
                  key={path}
                  type="button"
                  $active={isActive}
                  onClick={() => navigate(path)}
                >
                  <Icon size={18} />
                  <span>{title}</span>
                </NavButton>
              );
            })}
          </NavList>
        </Sidebar>

        <Main>
          <TopBar>
            <TopLeft>
              <MenuButton
                type="button"
                aria-label="Abrir menu"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Menu size={20} />
              </MenuButton>
              <CurrentTitle>{currentTitle}</CurrentTitle>
            </TopLeft>

            <TopRight>
              <Email>{user?.email}</Email>
              <ActionIconButton
                type="button"
                onClick={toggleTheme}
                title="Cambiar tema"
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </ActionIconButton>

              <LogoutButton type="button" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Salir</span>
              </LogoutButton>
            </TopRight>
          </TopBar>

          <PageViewport>
            <Outlet />
          </PageViewport>
        </Main>
      </Shell>
    </>
  );
}
