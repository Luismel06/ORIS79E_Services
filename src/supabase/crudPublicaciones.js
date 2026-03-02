import { supabase } from "./supabase.config";

// Obtener publicaciones con sus imágenes
export async function mostrarPublicaciones() {
  const { data, error } = await supabase
    .from("publicaciones")
    .select(`
      id,
      titulo,
      descripcion,
      fecha,
      imagenes_publicacion (url)
    `)
    .order("fecha", { ascending: false });

  if (error) console.error("Error al cargar publicaciones:", error.message);
  console.log("📸 Datos desde Supabase:", data);
  return data;
}
