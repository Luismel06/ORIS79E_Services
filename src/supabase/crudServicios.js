import { supabase } from "./supabase.config";

export async function mostrarServicios() {
  const { data, error } = await supabase.from("servicios").select("*");
  if (error) console.log(error);
  return data;
}

export async function insertarServicio(servicio) {
  const { error } = await supabase.from("servicios").insert(servicio);
  if (error) console.log(error);
}
