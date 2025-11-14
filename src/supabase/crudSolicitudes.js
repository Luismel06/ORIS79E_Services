// 📁 supabase/crudSolicitudes.jsx
import { supabase } from "./supabase.config";

// 🔹 Insertar una nueva solicitud
export const insertarSolicitud = async (solicitud) => {
  const { data, error } = await supabase.from("solicitudes").insert([solicitud]);
  if (error) {
    console.error("❌ Error insertando solicitud:", error.message);
    throw error;
  }
  return data;
};

// 🔹 Obtener todas las solicitudes
export const obtenerSolicitudes = async () => {
  const { data, error } = await supabase
    .from("solicitudes")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) console.error("❌ Error obteniendo solicitudes:", error.message);
  return data;
};
