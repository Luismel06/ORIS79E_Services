import { supabase } from "./supabase.config";

export async function mostrarProductos() {
  const { data, error } = await supabase.from("productos").select("*");
  if (error) console.log(error);
  return data;
}

export async function insertarProducto(producto) {
  const { error } = await supabase.from("productos").insert(producto);
  if (error) console.log(error);
}

export async function eliminarProducto(id) {
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) console.log(error);
}
