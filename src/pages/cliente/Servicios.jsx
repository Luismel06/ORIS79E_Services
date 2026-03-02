import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import emailjs from "emailjs-com";
import { supabase } from "../../supabase/supabase.config";
import { insertarSolicitud } from "../../supabase/crudSolicitudes";
import {
  formatearCedula,
  formatearRnc,
  soloDigitos,
  validarCedulaDominicana,
  validarRncDominicano,
} from "../../utils/validacionesRD";

const EMAILJS_SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_kfvhwxq";
const EMAILJS_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_iy48pw3";
const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "yoOeYAk8XPOIvEhbf";

// === ESTILOS ===
const Container = styled.section`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 6rem 1rem 4rem;
  text-align: center;
`;

/* ---- Consulta de caso ---- */
const CaseCard = styled.div`
  max-width: 900px;
  margin: 0 auto 2rem;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  padding: 1.3rem 1.5rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  text-align: left;
`;

const CaseTitle = styled.h3`
  margin: 0 0 0.4rem;
  color: ${({ theme }) => theme.accent};
  font-size: 1rem;
`;

const CaseForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.4rem;
`;

const CaseInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.7rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const CaseButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #fff;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  &:hover {
    opacity: 0.9;
  }
`;

const CaseResultBox = styled.div`
  margin-top: 0.9rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground};
  font-size: 0.9rem;
`;

const CaseRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin: 0.2rem 0;
  span:first-child {
    font-weight: 600;
  }
`;

const CaseStatusTag = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $estado }) =>
    $estado === "Completado" || $estado === "Finalizado"
      ? "rgba(46, 204, 113, 0.18)"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "rgba(26, 188, 156, 0.18)"
      : $estado === "Requiere reprogramacion"
      ? "rgba(243, 156, 18, 0.18)"
      : $estado === "Cliente no se encontraba" ||
        $estado === "Cancelado"
      ? "rgba(231, 76, 60, 0.18)"
      : "rgba(241, 196, 15, 0.18)"};
  color: ${({ $estado }) =>
    $estado === "Completado" || $estado === "Finalizado"
      ? "#27ae60"
      : $estado === "En progreso" || $estado === "En proceso"
      ? "#16a085"
      : $estado === "Requiere reprogramacion"
      ? "#e67e22"
      : $estado === "Cliente no se encontraba" ||
        $estado === "Cancelado"
      ? "#c0392b"
      : "#b7950b"};
`;

/* ---- Tabs y layout principal ---- */
const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  background-color: ${({ $active, theme }) =>
    $active ? theme.accent : theme.cardBackground};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.text)};
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.9;
  }
`;

const Content = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

/* ---- Tarjetas de servicios ---- */
const ServicioCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.background};
  transition: 0.3s;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.cardBackground};
  }

  h3 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 0.95rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const SolicitarBtn = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 0.8rem;
  }
`;

const Formulario = styled(motion.form)`
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  resize: none;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #fff;
  border: none;
  padding: 0.9rem 1.6rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
  &:hover {
    opacity: 0.9;
  }
`;

const TipoClienteRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }
`;

const HelpText = styled.p`
  margin: -0.35rem 0 0.1rem;
  font-size: 0.8rem;
  opacity: 0.75;
`;

// === COMPONENTE PRINCIPAL ===
const BrandsWrapper = styled.div`
  text-align: left;
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
  margin-top: 0.8rem;
`;

const BrandCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.background};
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
`;

const BrandLogo = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.cardBackground};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 0.55rem;
  }
`;

const BrandFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.text};
`;

const BrandName = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  text-align: center;
`;

function normalizarMarca(valor = "") {
  return valor.trim().replace(/\s+/g, " ").toUpperCase();
}

function inicialesMarca(nombre = "") {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizarTexto(valor = "") {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function esServicioInstalacionRedes(nombreServicio = "") {
  const txt = normalizarTexto(nombreServicio);
  return txt.includes("instalacion de redes") || (txt.includes("instalacion") && txt.includes("red"));
}

export default function Servicios() {
  const [tab, setTab] = useState("disponibles");
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [tipoCliente, setTipoCliente] = useState("persona"); // "persona" | "empresa"

  // productos
  const [productos, setProductos] = useState([]);
  const [marcasConfig, setMarcasConfig] = useState([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  // consulta de caso
  const [caseNumero, setCaseNumero] = useState("");
  const [caseResult, setCaseResult] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  // Cargar servicios desde Supabase
  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("servicios").select("*");
      if (error) {
        console.error("Error al cargar servicios:", error);
      } else {
        setServicios(data || []);
      }
      setLoading(false);
    };
    fetchServicios();
  }, []);
  // Cargar productos catalogo
  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("id, marca, proveedor");
      if (error) {
        console.error("Error al cargar productos:", error);
      } else {
        setProductos(data || []);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchMarcas = async () => {
      setLoadingMarcas(true);
      const { data, error } = await supabase
        .from("marcas")
        .select("id, nombre, logo_url, activa, orden")
        .order("orden", { ascending: true })
        .order("nombre", { ascending: true });

      if (error) {
        if (error.code !== "PGRST205") {
          console.error("Error al cargar marcas:", error);
        }
        setMarcasConfig([]);
      } else {
        setMarcasConfig((data || []).filter((m) => m.activa !== false));
      }
      setLoadingMarcas(false);
    };

    fetchMarcas();
  }, []);

  const marcasDesdeProductos = useMemo(() => {
    const map = new Map();
    for (const p of productos || []) {
      const base = (p.marca || p.proveedor || "").trim();
      if (!base) continue;
      const key = normalizarMarca(base);
      if (!map.has(key)) {
        map.set(key, {
          id: `prod-${key}`,
          nombre: base,
          logo_url: null,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [productos]);

  const marcasVisibles =
    marcasConfig.length > 0 ? marcasConfig : marcasDesdeProductos;
  // Alternar formulario
  const toggleFormulario = (id) => {
    setServicioSeleccionado(servicioSeleccionado === id ? null : id);
    setTipoCliente("persona"); // reset al abrir/cerrar
  };
  // Generar numero de caso unico
  const generarNumeroCaso = () =>
    "CASE-" + Math.floor(100000 + Math.random() * 900000);
  // Enviar correo de confirmacion
  const enviarCorreoConfirmacion = async (
    nombre,
    email,
    numero_caso,
    servicio
  ) => {
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          nombre,
          email,
          numero_caso,
          servicio,
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }
  };

  // Enviar solicitud a Supabase
  const handleSubmit = async (e, s) => {
    e.preventDefault();
    const form = e.currentTarget;
    const numero_caso = generarNumeroCaso();
    const requiereTipoInstalacion = esServicioInstalacionRedes(s?.nombre || "");

    const cliente = form.cliente.value.trim();
    const email = form.email.value.trim();
    const telefono = form.telefono.value.trim();
    const descripcion = form.descripcion.value.trim();
    const tipoInstalacion = requiereTipoInstalacion
      ? (form.tipo_instalacion?.value || "").trim()
      : "";
    const direccion = form.direccion.value.trim();
    const ciudad = form.ciudad.value.trim();
    const sector = form.sector.value.trim();
    const tipo_cliente = form.tipo_cliente.value;

    const cedula =
      tipo_cliente === "persona"
        ? soloDigitos(form.cedula.value.trim())
        : null;
    const empresa_nombre =
      tipo_cliente === "empresa" ? form.empresa_nombre.value.trim() : null;
    const empresa_rnc =
      tipo_cliente === "empresa"
        ? soloDigitos(form.empresa_rnc.value.trim())
        : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Correo electronico no valido",
        text: "Introduce un correo valido (ejemplo@dominio.com).",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (!direccion) {
      Swal.fire({
        icon: "warning",
        title: "Direccion requerida",
        text: "Indica la direccion donde se realizara el servicio.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (!ciudad) {
      Swal.fire({
        icon: "warning",
        title: "Ciudad requerida",
        text: "Indica la ciudad donde se realizara el servicio.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (!sector) {
      Swal.fire({
        icon: "warning",
        title: "Sector requerido",
        text: "Indica el sector donde se realizara el servicio.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (requiereTipoInstalacion && !tipoInstalacion) {
      Swal.fire({
        icon: "warning",
        title: "Tipo de instalacion requerido",
        text: "Selecciona el tipo de instalacion que deseas.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (tipo_cliente === "persona" && !validarCedulaDominicana(cedula)) {
      Swal.fire({
        icon: "warning",
        title: "Cedula invalida",
        text: "La cedula ingresada no es valida para Republica Dominicana.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    if (tipo_cliente === "empresa") {
      if (!empresa_nombre) {
        Swal.fire({
          icon: "warning",
          title: "Empresa requerida",
          text: "Debes ingresar el nombre o razon social.",
          confirmButtonColor: "#00bcd4",
        });
        return;
      }

      if (!validarRncDominicano(empresa_rnc)) {
        Swal.fire({
          icon: "warning",
          title: "RNC invalido",
          text: "El RNC ingresado no es valido para Republica Dominicana.",
          confirmButtonColor: "#00bcd4",
        });
        return;
      }
    }

    const nuevaSolicitud = {
      cliente,
      email,
      telefono,
      descripcion,
      tipo_instalacion: requiereTipoInstalacion ? tipoInstalacion : null,
      direccion,
      ciudad,
      sector,
      servicio_id: s.id,
      estado: "Solicitud enviada",
      tecnico_asignado: "",
      chat_link: "",
      numero_caso,
      tipo_cliente,
      cedula: tipo_cliente === "persona" ? cedula : null,
      empresa_nombre: tipo_cliente === "empresa" ? empresa_nombre : null,
      empresa_rnc: tipo_cliente === "empresa" ? empresa_rnc : null,
    };

    try {
      let payload = { ...nuevaSolicitud };
      const columnasRemovidas = [];
      const columnasCompat = ["cedula", "ciudad", "sector", "tipo_instalacion"];

      for (let intento = 0; intento <= columnasCompat.length; intento++) {
        try {
          await insertarSolicitud(payload);
          break;
        } catch (errorInsert) {
          const msg = `${errorInsert?.message || ""} ${
            errorInsert?.details || ""
          }`.toLowerCase();

          if (!msg.includes("column")) {
            throw errorInsert;
          }

          const faltante = columnasCompat.find(
            (col) =>
              msg.includes(col) &&
              Object.prototype.hasOwnProperty.call(payload, col)
          );

          if (!faltante) {
            throw errorInsert;
          }

          delete payload[faltante];
          columnasRemovidas.push(faltante);

          if (intento === columnasCompat.length) {
            throw errorInsert;
          }
        }
      }

      await enviarCorreoConfirmacion(cliente, email, numero_caso, s.nombre);

      if (columnasRemovidas.length > 0) {
        console.warn(
          `Faltan columnas en solicitudes (${columnasRemovidas.join(
            ", "
          )}). Ejecuta la migracion SQL.`
        );
      }

      Swal.fire({
        icon: "success",
        title: "Solicitud enviada correctamente",
        html: `
        <p>Tu numero de caso es:</p>
        <h3 style="color:#00bcd4; font-weight:700;">${numero_caso}</h3>
        <p>Tambien te enviamos un correo de confirmacion con los detalles.</p>
      `,
        confirmButtonColor: "#00bcd4",
      });

      form.reset();
      setServicioSeleccionado(null);
      setTipoCliente("persona");
    } catch (error) {
      console.error("Error al registrar solicitud:", error?.message || error);
      Swal.fire({
        icon: "error",
        title: "Error al enviar la solicitud",
        text: "Por favor, intenta nuevamente mas tarde.",
        confirmButtonColor: "#00bcd4",
      });
    }
  };
  // Consulta de caso por numero
  const handleBuscarCaso = async (e) => {
    e.preventDefault();
    const valor = caseNumero.trim();
    const valorMayus = valor.toUpperCase();
    const valorNumerico = soloDigitos(valor);
    if (!valor) {
      Swal.fire({
        icon: "info",
        title: "Ingresa numero de caso, cedula o RNC",
        text: "Ejemplo: CASE-123456, 00112345678 o 131234567",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    setCaseLoading(true);
    setCaseResult(null);

    try {
      // 1) Buscar por numero de caso exacto (CASE-XXXXXX)
      let { data, error } = await supabase
        .from("solicitudes")
        .select("*, servicios(nombre)")
        .eq("numero_caso", valorMayus)
        .maybeSingle();

      // 2) Si no aparece, intentar por cedula (11 digitos)
      if ((!data || error) && valorNumerico.length === 11) {
        const { data: porCedula, error: errCed } = await supabase
          .from("solicitudes")
          .select("*, servicios(nombre)")
          .eq("cedula", valorNumerico)
          .order("fecha", { ascending: false })
          .limit(1);

        if (!errCed && Array.isArray(porCedula) && porCedula.length > 0) {
          data = porCedula[0];
          error = null;
        }
      }

      // 3) Si no aparece, intentar por RNC (9 digitos)
      if ((!data || error) && valorNumerico.length === 9) {
        const { data: porRnc, error: errRnc } = await supabase
          .from("solicitudes")
          .select("*, servicios(nombre)")
          .eq("empresa_rnc", valorNumerico)
          .order("fecha", { ascending: false })
          .limit(1);

        if (!errRnc && Array.isArray(porRnc) && porRnc.length > 0) {
          data = porRnc[0];
          error = null;
        }
      }

      // 4) Si puso solo numeros y no encontro por documento, probar por id
      if ((!data || error) && /^[0-9]+$/.test(valor)) {
        const idNum = Number(valorNumerico);
        const resp = await supabase
          .from("solicitudes")
          .select("*, servicios(nombre)")
          .eq("id", idNum)
          .maybeSingle();
        data = resp.data;
      }

      if (!data) {
        setCaseResult({ notFound: true });
      } else {
        const estadoFinal =
          data.estado_solicitud || data.estado || "Agendado";
        const documentoTipo = data.tipo_cliente === "empresa" ? "RNC" : "Cedula";
        const documentoValor =
          data.tipo_cliente === "empresa"
            ? data.empresa_rnc || "-"
            : data.cedula || "-";

        setCaseResult({
          numero_caso: data.numero_caso || `CASE-${data.id}`,
          cliente: data.cliente,
          servicio_nombre: data.servicios?.nombre || "No especificado",
          documento_tipo: documentoTipo,
          documento_valor: documentoValor,
          estado: estadoFinal,
          fecha_creacion: data.fecha
            ? new Date(data.fecha).toLocaleString()
            : "-",
          fecha_agendada: data.fecha_agendada
            ? new Date(data.fecha_agendada).toLocaleDateString()
            : "-",
          hora_agendada: data.hora_agendada || "-",
          tecnico: data.tecnico_asignado || "Pendiente de asignar",
          direccion: data.direccion || "-",
          ciudad: data.ciudad || "-",
          sector: data.sector || "-",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al consultar el caso",
        text: "Intenta nuevamente en unos minutos.",
        confirmButtonColor: "#00bcd4",
      });
    } finally {
      setCaseLoading(false);
    }
  };

  return (
    <Container>
      <h2 style={{ color: "#00bcd4", marginBottom: "1rem" }}>
        Nuestros Servicios
      </h2>
      {/* CONSULTA DE CASO */}
      <CaseCard>
        <CaseTitle>Consulta el estado de tu caso</CaseTitle>
        <p style={{ fontSize: "0.85rem", opacity: 0.8, margin: 0 }}>
          Ingresa tu numero de caso, cedula o RNC para ver el estado actual.
          Ejemplos: <strong>CASE-123456</strong>, <strong>00112345678</strong>,{" "}
          <strong>131234567</strong>.
        </p>

        <CaseForm onSubmit={handleBuscarCaso}>
          <CaseInput
            placeholder="CASE-123456, Cedula o RNC"
            value={caseNumero}
            onChange={(e) => setCaseNumero(e.target.value)}
          />
          <CaseButton type="submit">
            {caseLoading ? "Buscando..." : "Ver estado"}
          </CaseButton>
        </CaseForm>

        {caseResult && (
          <CaseResultBox>
            {caseResult.notFound ? (
              <div style={{ fontSize: "0.9rem" }}>
                No encontramos resultados con ese numero de caso, cedula o RNC.
                Verifica que lo hayas escrito correctamente.
              </div>
            ) : (
              <>
                <CaseRow>
                  <span>Numero de caso:</span>
                  <span>{caseResult.numero_caso}</span>
                </CaseRow>
                <CaseRow>
                  <span>Cliente:</span>
                  <span>{caseResult.cliente}</span>
                </CaseRow>
                <CaseRow>
                  <span>Servicio:</span>
                  <span>{caseResult.servicio_nombre}</span>
                </CaseRow>
                <CaseRow>
                  <span>{caseResult.documento_tipo}:</span>
                  <span>{caseResult.documento_valor}</span>
                </CaseRow>
                <CaseRow>
                  <span>Estado:</span>
                  <span>
                    <CaseStatusTag $estado={caseResult.estado}>
                      {caseResult.estado}
                    </CaseStatusTag>
                  </span>
                </CaseRow>
                <CaseRow>
                  <span>Creado:</span>
                  <span>{caseResult.fecha_creacion}</span>
                </CaseRow>
                <CaseRow>
                  <span>Fecha agendada:</span>
                  <span>{caseResult.fecha_agendada}</span>
                </CaseRow>
                <CaseRow>
                  <span>Hora agendada:</span>
                  <span>{caseResult.hora_agendada}</span>
                </CaseRow>
                <CaseRow>
                  <span>Tecnico asignado:</span>
                  <span>{caseResult.tecnico}</span>
                </CaseRow>
                <CaseRow>
                  <span>Direccion de trabajo:</span>
                  <span>{caseResult.direccion}</span>
                </CaseRow>
                <CaseRow>
                  <span>Ciudad:</span>
                  <span>{caseResult.ciudad}</span>
                </CaseRow>
                <CaseRow>
                  <span>Sector:</span>
                  <span>{caseResult.sector}</span>
                </CaseRow>
              </>
            )}
          </CaseResultBox>
        )}
      </CaseCard>

      {/* TABS */}
      <Tabs>
        <TabButton
          $active={tab === "disponibles"}
          onClick={() => setTab("disponibles")}
        >
          Servicios disponibles
        </TabButton>
        <TabButton $active={tab === "marcas"} onClick={() => setTab("marcas")}>
          Marcas con las que trabajamos
        </TabButton>
      </Tabs>

      {/* TAB SERVICIOS */}
      {tab === "disponibles" &&
        (loading ? (
          <p>Cargando servicios...</p>
        ) : servicios.length === 0 ? (
          <p>No hay servicios disponibles por el momento.</p>
        ) : (
          <Content initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {servicios.map((s) => (
              <ServicioCard key={s.id}>
                <CardHeader>
                  <div>
                    <h3>{s.nombre}</h3>
                    <p>{s.descripcion}</p>
                  </div>
                  <SolicitarBtn onClick={() => toggleFormulario(s.id)}>
                    {servicioSeleccionado === s.id
                      ? "Cerrar formulario"
                      : "Solicitar servicio"}
                  </SolicitarBtn>
                </CardHeader>

                <AnimatePresence>
                  {servicioSeleccionado === s.id && (
                    <Formulario
                      onSubmit={(e) => handleSubmit(e, s)}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Tipo de cliente */}
                      <TipoClienteRow>
                        <span>Quien solicita el servicio?</span>
                        <label>
                          <input
                            type="radio"
                            name="tipo_cliente"
                            value="persona"
                            checked={tipoCliente === "persona"}
                            onChange={() => setTipoCliente("persona")}
                          />
                          Persona
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="tipo_cliente"
                            value="empresa"
                            checked={tipoCliente === "empresa"}
                            onChange={() => setTipoCliente("empresa")}
                          />
                          Empresa
                        </label>
                      </TipoClienteRow>

                      {tipoCliente === "persona" && (
                        <>
                          <Input
                            name="cedula"
                            placeholder="Cedula (ej: 001-1234567-8)"
                            maxLength={13}
                            required={tipoCliente === "persona"}
                            onInput={(ev) => {
                              ev.target.value = formatearCedula(ev.target.value);
                            }}
                          />
                          <HelpText>
                            Se valida automaticamente con el algoritmo oficial de
                            cedula dominicana.
                          </HelpText>
                        </>
                      )}

                      {tipoCliente === "empresa" && (
                        <>
                          <Input
                            name="empresa_nombre"
                            placeholder="Nombre o razon social de la empresa"
                            required={tipoCliente === "empresa"}
                          />
                          <Input
                            name="empresa_rnc"
                            placeholder="RNC (ej: 1-31-12345-6)"
                            required={tipoCliente === "empresa"}
                            maxLength={12}
                            onInput={(ev) => {
                              ev.target.value = formatearRnc(ev.target.value);
                            }}
                          />
                          <HelpText>
                            El RNC se valida automaticamente antes de enviar la
                            solicitud.
                          </HelpText>
                        </>
                      )}

                      <Input
                        name="cliente"
                        placeholder="Tu nombre completo"
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Tu correo electronico"
                        required
                      />
                      <Input
                        name="telefono"
                        placeholder="Tu numero de telefono"
                        required
                      />
                      <Input
                        name="direccion"
                        placeholder="Direccion donde se realizara el servicio"
                        required
                      />
                      <Input
                        name="ciudad"
                        placeholder="Ciudad"
                        required
                      />
                      <Input
                        name="sector"
                        placeholder="Sector"
                        required
                      />
                      {esServicioInstalacionRedes(s.nombre) && (
                        <>
                          <Input
                            as="select"
                            name="tipo_instalacion"
                            defaultValue=""
                            required
                          >
                            <option value="" disabled>
                              Selecciona tipo de instalacion
                            </option>
                            <option value="Camaras de seguridad">
                              Camaras de seguridad
                            </option>
                            <option value="Cableado">Cableado</option>
                            <option value="Redes">Redes</option>
                          </Input>
                          <HelpText>
                            Elige que tipo de instalacion deseas para este servicio.
                          </HelpText>
                        </>
                      )}
                      <TextArea
                        name="descripcion"
                        rows="3"
                        placeholder={`Describe brevemente el servicio de "${s.nombre}" que necesitas...`}
                        required
                      />
                      <Button type="submit">Enviar solicitud</Button>
                    </Formulario>
                  )}
                </AnimatePresence>
              </ServicioCard>
            ))}
          </Content>
        ))}

      {/* TAB MARCAS */}
      {tab === "marcas" && (
        <Content initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BrandsWrapper>
            <h3
              style={{
                textAlign: "left",
                marginTop: 0,
                marginBottom: "0.6rem",
                color: "#00bcd4",
              }}
            >
              Marcas de productos con las que trabajamos
            </h3>
            <p
              style={{
                fontSize: "0.88rem",
                opacity: 0.82,
                textAlign: "left",
                marginBottom: "0.9rem",
              }}
            >
              Mostramos primero las marcas configuradas por la empresa. Si aun no
              se han cargado logos, usamos las marcas detectadas en el catalogo.
            </p>

            {loadingMarcas && marcasVisibles.length === 0 ? (
              <p>Cargando marcas...</p>
            ) : marcasVisibles.length === 0 ? (
              <p>No hay marcas configuradas aun.</p>
            ) : (
              <BrandsGrid>
                {marcasVisibles.map((marca) => (
                  <BrandCard key={marca.id}>
                    <BrandLogo>
                      {marca.logo_url ? (
                        <img
                          src={marca.logo_url}
                          alt={`Logo ${marca.nombre}`}
                          loading="lazy"
                        />
                      ) : (
                        <BrandFallback>{inicialesMarca(marca.nombre)}</BrandFallback>
                      )}
                    </BrandLogo>
                    <BrandName>{marca.nombre}</BrandName>
                  </BrandCard>
                ))}
              </BrandsGrid>
            )}
          </BrandsWrapper>
        </Content>
      )}

    </Container>
  );
}


