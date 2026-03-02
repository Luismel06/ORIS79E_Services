import { create } from "zustand";
import { supabase } from "../supabase/supabase.config.jsx";

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

export const useAuthStore = create((set) => ({
  user: null,
  rol: "none",
  loading: true,

  loginGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.log("Error iniciando Google:", error);
    }
  },

  cargarSesion: async () => {
    try {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        set({ user: null, rol: "none", loading: false });
        return;
      }

      const { data: usuarioBD } = await supabase
        .from("usuarios")
        .select("id, rol")
        .ilike("email", data.user.email)
        .single();

      if (!usuarioBD) {
        set({
          user: data.user,
          rol: "none",
          loading: false,
        });
        return;
      }

      set({
        user: data.user,
        rol: normalizarRol(usuarioBD?.rol),
        loading: false,
      });
    } catch (error) {
      console.log("Error cargando sesion:", error);
      set({ user: null, rol: "none", loading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, rol: "none", loading: false });
  },
}));
