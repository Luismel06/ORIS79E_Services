import { supabase } from "./supabase.config.jsx";

export async function actualizarEstadoCotizacion(id, estado) {
  const { error } = await supabase
    .from("cotizaciones")
    .update({ estado })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando estado:", error);
    return false;
  }

  return true;
}
