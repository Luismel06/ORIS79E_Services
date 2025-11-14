// src/supabase/crudUsuarios.js
import { supabase } from "./supabase.config";

// 🧩 Insertar un nuevo usuario
export const insertarUsuario = async (nuevoUsuario) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([nuevoUsuario])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error al insertar usuario:", error.message);
    throw error;
  }
};

// 📋 Mostrar todos los usuarios
export const mostrarUsuarios = async () => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error al mostrar usuarios:", error.message);
    return [];
  }
};

// ✏️ Actualizar un usuario existente
export const actualizarUsuario = async (id, camposActualizados) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update(camposActualizados)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error.message);
    throw error;
  }
};

// 🗑️ Eliminar un usuario
export const eliminarUsuario = async (id) => {
  try {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error.message);
    throw error;
  }
};

// 🔍 Buscar usuario por correo (útil para login o asignación)
export const buscarUsuarioPorCorreo = async (email) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Ignorar "no encontrado"
    return data || null;
  } catch (error) {
    console.error("❌ Error al buscar usuario por correo:", error.message);
    return null;
  }
};
