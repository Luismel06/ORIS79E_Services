import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const PageTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.accent};
  font-size: clamp(1.2rem, 2vw, 1.55rem);
`;

const PageDescription = styled.p`
  margin: 0;
  font-size: 0.94rem;
  opacity: 0.82;
`;

const FormCard = styled.form`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: clamp(1rem, 2vw, 1.35rem);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
`;

const Section = styled.section`
  margin-top: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  flex-wrap: wrap;

  h3 {
    margin: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.55rem;
  color: ${({ theme }) => theme.accent};
  font-size: 1.03rem;
`;

const Description = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Grid5 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.7rem;
  align-items: end;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.66rem 0.72rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.66rem 0.72rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  border: none;
  border-radius: 10px;
  padding: 0.66rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  background: ${({ theme }) => theme.accent};
  color: #fff;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const GhostButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 1.2rem 0;
`;

const InlineActions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;

  button {
    flex: 1 1 190px;
  }
`;

const ToggleRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.92rem;
`;

const MutedText = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  opacity: 0.8;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.7rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  th {
    background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .delete-btn {
    cursor: pointer;
    color: #d9534f;
    transition: 0.2s;
  }

  .delete-btn:hover {
    color: #ff0000;
  }
`;

const TotalsCard = styled.div`
  margin-top: 0.8rem;
  padding: 0.95rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.35rem 0;
  font-size: 0.92rem;

  @media (max-width: 450px) {
    flex-direction: column;
    gap: 0.15rem;
  }
`;

const SubmitRow = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;

  button {
    width: 100%;
  }

  @media (min-width: 640px) {
    button {
      width: auto;
      min-width: 220px;
    }
  }
`;

const MobileOnly = styled.div`
  display: none;

  @media (max-width: 820px) {
    display: block;
  }
`;

const DesktopOnly = styled.div`
  @media (max-width: 820px) {
    display: none;
  }
`;

const LineCardList = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const LineCard = styled.article`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.8rem;
  background: ${({ theme }) => theme.cardBackground};
  display: grid;
  gap: 0.35rem;
`;

const LineTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
`;

const LineTitle = styled.strong`
  font-size: 0.94rem;
`;

const LineMeta = styled.p`
  margin: 0;
  font-size: 0.83rem;
  opacity: 0.8;
`;

const HistoryTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.accent};
`;

const HistoryCard = styled.article`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 0.85rem;
  background: ${({ theme }) => theme.cardBackground};
  display: grid;
  gap: 0.45rem;
`;

const HistoryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.88rem;

  span:first-child {
    opacity: 0.75;
  }
`;

const HistoryActions = styled.div`
  display: flex;
  gap: 0.45rem;
  justify-content: flex-end;
`;

const IconCircleButton = styled.button`
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.accent};
    border-color: ${({ theme }) => theme.accent};
  }
`;

const DeleteIconButton = styled(IconCircleButton)`
  color: #d9534f;

  &:hover {
    color: #ff0000;
    border-color: rgba(217, 83, 79, 0.55);
  }
`;

const EstadoBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  background-color: ${({ estado }) =>
    estado === "aceptada"
      ? "rgba(46, 204, 113, 0.18)"
      : estado === "rechazada"
      ? "rgba(231, 76, 60, 0.15)"
      : "rgba(241, 196, 15, 0.18)"};

  color: ${({ estado }) =>
    estado === "aceptada"
      ? "#27ae60"
      : estado === "rechazada"
      ? "#c0392b"
      : "#b7950b"};
`;

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

const CUENTA_BANCO_EMPRESA =
  import.meta.env.VITE_EMPRESA_CUENTA_BANCO?.trim() || "";
const BANCO_EMPRESA = import.meta.env.VITE_EMPRESA_BANCO?.trim() || "";
const TITULAR_CUENTA_EMPRESA =
  import.meta.env.VITE_EMPRESA_TITULAR_CUENTA?.trim() || "";

export default function Cotizaciones() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");
  const [ciudadCliente, setCiudadCliente] = useState("");
  const [documentoCliente, setDocumentoCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [sectorCliente, setSectorCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [servicio, setServicio] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [nombreServicio, setNombreServicio] = useState("");
  const [precioServicio, setPrecioServicio] = useState(0);
  const [usaAnticipo, setUsaAnticipo] = useState(false);
  const [numeroCuentaBanco, setNumeroCuentaBanco] = useState(
    CUENTA_BANCO_EMPRESA
  );
  const [nombreCuentaBanco, setNombreCuentaBanco] = useState(
    TITULAR_CUENTA_EMPRESA
  );
  const [bancoCuentaBanco, setBancoCuentaBanco] = useState(BANCO_EMPRESA);
  const [servicioSugerido, setServicioSugerido] = useState("");

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState("");
  const [servicios, setServicios] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  const [productos, setProductos] = useState([]);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadCatalogo, setCantidadCatalogo] = useState(1);
  const [precioCatalogo, setPrecioCatalogo] = useState(0);

  const [manualCategoria, setManualCategoria] = useState("");
  const [manualModelo, setManualModelo] = useState("");
  const [manualMarca, setManualMarca] = useState("");
  const [manualProveedor, setManualProveedor] = useState("");
  const [manualConcepto, setManualConcepto] = useState("");
  const [manualCantidad, setManualCantidad] = useState(1);
  const [manualPrecio, setManualPrecio] = useState(0);

  const [detalle, setDetalle] = useState([]);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  async function cargarDatosIniciales() {
    await Promise.all([
      fetchServicios(),
      fetchSolicitudes(),
      fetchCotizaciones(),
      fetchProductos(),
    ]);
  }

  async function fetchServicios() {
    const { data, error } = await supabase.from("servicios").select("id, nombre");
    if (!error) setServicios(data || []);
  }

  async function fetchSolicitudes() {
    const { data, error } = await supabase
      .from("solicitudes")
      .select(
        "id, cliente, servicio_id, estado, numero_caso, tipo_cliente, cedula, empresa_rnc, empresa_nombre, direccion, ciudad, telefono, sector, email"
      );
    if (!error) setSolicitudes(data || []);
  }

  async function fetchCotizaciones() {
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setCotizaciones(data || []);
  }

  async function fetchProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio, categoria, modelo, marca, proveedor");
    if (!error) setProductos(data || []);
  }

  const categorias = useMemo(
    () => Array.from(new Set((productos || []).map((p) => p.categoria || "Otros"))),
    [productos]
  );

  const marcasFiltradas = useMemo(
    () =>
      Array.from(
        new Set(
          (productos || [])
            .filter((p) =>
              categoriaSeleccionada
                ? (p.categoria || "Otros") === categoriaSeleccionada
                : true
            )
            .map((p) => p.marca || p.proveedor || "Sin marca")
        )
      ),
    [productos, categoriaSeleccionada]
  );

  const productosFiltrados = useMemo(
    () =>
      (productos || []).filter((p) => {
        const cat = p.categoria || "Otros";
        const marca = p.marca || p.proveedor || "Sin marca";
        if (categoriaSeleccionada && cat !== categoriaSeleccionada) return false;
        if (marcaSeleccionada && marca !== marcaSeleccionada) return false;
        return true;
      }),
    [productos, categoriaSeleccionada, marcaSeleccionada]
  );

  const subtotalConceptos = useMemo(
    () => detalle.reduce((acc, item) => acc + toNumber(item.subtotal), 0),
    [detalle]
  );

  const precioServicioNum = toNumber(precioServicio);
  const descuentoNum = Math.max(0, toNumber(descuento));
  const baseTotal = subtotalConceptos + precioServicioNum;
  const totalActual = Math.max(0, baseTotal - (baseTotal * descuentoNum) / 100);
  const anticipoActual = usaAnticipo ? Number((totalActual * 0.5).toFixed(2)) : 0;
  const pendienteActual = usaAnticipo
    ? Number((totalActual - anticipoActual).toFixed(2))
    : 0;

  function getNombreServicioDesdeSolicitud(solicitud) {
    if (!solicitud?.servicio_id) return "";
    const s = servicios.find((svc) => svc.id === solicitud.servicio_id);
    return s?.nombre || "";
  }

  function limpiarLineaManual() {
    setManualCategoria("");
    setManualModelo("");
    setManualMarca("");
    setManualProveedor("");
    setManualConcepto("");
    setManualCantidad(1);
    setManualPrecio(0);
  }

  function agregarConceptoManual() {
    const descripcion = manualConcepto.trim();
    const cantidad = toNumber(manualCantidad);
    const precio = toNumber(manualPrecio);

    if (!descripcion) {
      Swal.fire("Falta descripcion", "Escribe la descripcion del producto o material.", "warning");
      return;
    }

    if (cantidad <= 0) {
      Swal.fire("Cantidad invalida", "La cantidad debe ser mayor que cero.", "warning");
      return;
    }

    if (precio <= 0) {
      Swal.fire("Precio invalido", "El precio unitario debe ser mayor que cero.", "warning");
      return;
    }

    const subtotal = cantidad * precio;

    setDetalle((prev) => [
      ...prev,
      {
        idLocal: `${Date.now()}-${Math.random()}`,
        origen: "manual",
        producto_id: null,
        categoria: manualCategoria.trim() || "Sin categoria",
        modelo: manualModelo.trim() || "Sin modelo",
        descripcion,
        marca: manualMarca.trim() || "Sin marca",
        proveedor: manualProveedor.trim() || "Sin proveedor",
        cantidad,
        precio_unitario: precio,
        subtotal,
      },
    ]);

    limpiarLineaManual();
  }

  function agregarDesdeCatalogo() {
    if (!productoSeleccionado) {
      Swal.fire("Selecciona producto", "Debes elegir un producto del catalogo.", "warning");
      return;
    }

    const prod = productos.find((p) => p.id === Number(productoSeleccionado));
    if (!prod) {
      Swal.fire("Producto invalido", "No se encontro el producto seleccionado.", "error");
      return;
    }

    const cantidad = toNumber(cantidadCatalogo);
    const precio = toNumber(precioCatalogo) || toNumber(prod.precio);

    if (cantidad <= 0) {
      Swal.fire("Cantidad invalida", "La cantidad debe ser mayor que cero.", "warning");
      return;
    }

    if (precio <= 0) {
      Swal.fire("Precio invalido", "El precio unitario debe ser mayor que cero.", "warning");
      return;
    }

    setDetalle((prev) => [
      ...prev,
      {
        idLocal: `${Date.now()}-${Math.random()}`,
        origen: "catalogo",
        producto_id: prod.id,
        categoria: prod.categoria || "Otros",
        modelo: prod.modelo || "Sin modelo",
        descripcion: prod.nombre,
        marca: prod.marca || "Sin marca",
        proveedor: prod.proveedor || "Sin proveedor",
        cantidad,
        precio_unitario: precio,
        subtotal: cantidad * precio,
      },
    ]);

    setProductoSeleccionado("");
    setCantidadCatalogo(1);
    setPrecioCatalogo(0);
  }

  function eliminarLinea(idLocal) {
    setDetalle((prev) => prev.filter((item) => item.idLocal !== idLocal));
  }

  async function insertarCotizacionConFallback(payloadCotizacion) {
    const payload = { ...payloadCotizacion };
    const columnasRemovidas = [];
    const columnasCompat = [
      "cliente_direccion",
      "cliente_ciudad",
      "cliente_documento",
      "cliente_telefono",
      "cliente_sector",
      "cliente_email",
      "numero_cuenta_banco",
      "nombre_cuenta_banco",
      "banco_cuenta_banco",
    ];
    let ultimoError = null;

    for (let intento = 0; intento <= columnasCompat.length; intento++) {
      const { data, error } = await supabase
        .from("cotizaciones")
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        return { cot: data, error: null, columnasRemovidas };
      }

      ultimoError = error;
      const msg = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();

      if (!msg.includes("column")) break;

      const faltante = columnasCompat.find(
        (col) =>
          msg.includes(col) &&
          Object.prototype.hasOwnProperty.call(payload, col)
      );

      if (!faltante) break;

      delete payload[faltante];
      columnasRemovidas.push(faltante);
    }

    return { cot: null, error: ultimoError, columnasRemovidas };
  }

  async function insertarItemsCotizacionConFallback(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return { error: null, columnasRemovidas: [] };
    }

    let payload = items.map((item) => ({ ...item }));
    const columnasRemovidas = [];
    const columnasCompat = ["categoria", "modelo", "marca", "proveedor"];
    let ultimoError = null;

    for (let intento = 0; intento <= columnasCompat.length; intento++) {
      const { error } = await supabase.from("cotizacion_items").insert(payload);
      if (!error) {
        return { error: null, columnasRemovidas };
      }

      ultimoError = error;
      const msg = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();

      if (!msg.includes("column")) break;

      const faltante = columnasCompat.find(
        (col) =>
          msg.includes(col) &&
          payload.some((item) => Object.prototype.hasOwnProperty.call(item, col))
      );

      if (!faltante) break;

      payload = payload.map((item) => {
        const clone = { ...item };
        delete clone[faltante];
        return clone;
      });
      columnasRemovidas.push(faltante);
    }

    return { error: ultimoError, columnasRemovidas };
  }

  async function guardarCotizacion(e) {
    e.preventDefault();

    if (!cliente.trim() || !servicio.trim()) {
      Swal.fire("Faltan datos", "Debes completar cliente y tipo de servicio.", "warning");
      return;
    }

    if (detalle.length === 0 && precioServicioNum <= 0) {
      Swal.fire(
        "Sin conceptos",
        "Agrega al menos una linea o define un precio de servicio.",
        "warning"
      );
      return;
    }

    if (totalActual <= 0) {
      Swal.fire("Total invalido", "El total calculado debe ser mayor que cero.", "error");
      return;
    }

    const cuentaBanco = numeroCuentaBanco.trim();
    const titularCuenta = nombreCuentaBanco.trim();
    const bancoCuenta = bancoCuentaBanco.trim();
    if (usaAnticipo && (!cuentaBanco || !titularCuenta || !bancoCuenta)) {
      Swal.fire(
        "Datos bancarios requeridos",
        "Debes indicar banco, titular y numero de cuenta para el plan 50/50.",
        "warning"
      );
      return;
    }

    let montoAnticipo = 0;
    let montoPendiente = 0;
    if (usaAnticipo) {
      montoAnticipo = anticipoActual;
      montoPendiente = pendienteActual;
    }

    const payloadCotizacion = {
      cliente: cliente.trim(),
      cliente_direccion: direccionCliente.trim() || null,
      cliente_ciudad: ciudadCliente.trim() || null,
      cliente_documento: documentoCliente.trim() || null,
      cliente_telefono: telefonoCliente.trim() || null,
      cliente_sector: sectorCliente.trim() || null,
      cliente_email: emailCliente.trim() || null,
      total: Number(totalActual.toFixed(2)),
      descuento: descuentoNum,
      servicio: servicio.trim(),
      nombre_servicio: nombreServicio.trim() || null,
      precio_servicio: precioServicioNum,
      fecha: new Date().toISOString(),
      estado: "pendiente",
      usa_anticipo: usaAnticipo,
      monto_anticipo: montoAnticipo,
      monto_pendiente: montoPendiente,
      numero_cuenta_banco: usaAnticipo ? cuentaBanco : null,
      nombre_cuenta_banco: usaAnticipo ? titularCuenta : null,
      banco_cuenta_banco: usaAnticipo ? bancoCuenta : null,
      solicitud_id: solicitudSeleccionada ? Number(solicitudSeleccionada) : null,
    };

    const {
      cot,
      error: errorCot,
      columnasRemovidas,
    } = await insertarCotizacionConFallback(payloadCotizacion);

    if (columnasRemovidas.length > 0) {
      console.warn(
        `Faltan columnas en cotizaciones (${columnasRemovidas.join(
          ", "
        )}). Ejecuta las migraciones SQL.`
      );
    }

    if (errorCot || !cot) {
      console.error(errorCot);
      Swal.fire("Error", "No se pudo guardar la cotizacion.", "error");
      return;
    }

    if (detalle.length > 0) {
      const payloadItems = detalle.map((item) => ({
        cotizacion_id: cot.id,
        producto_id: item.producto_id || null,
        nombre_producto: item.descripcion || item.nombre || "",
        categoria: item.categoria || null,
        modelo: item.modelo || null,
        marca: item.marca || null,
        proveedor: item.proveedor || null,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
      }));

      const {
        error: errorItems,
        columnasRemovidas: columnasItemsRemovidas,
      } = await insertarItemsCotizacionConFallback(payloadItems);

      if (columnasItemsRemovidas.length > 0) {
        console.warn(
          `Faltan columnas en cotizacion_items (${columnasItemsRemovidas.join(
            ", "
          )}). Ejecuta las migraciones SQL.`
        );
      }

      if (errorItems) {
        console.error(errorItems);
        await supabase.from("cotizaciones").delete().eq("id", cot.id);
        Swal.fire(
          "Error",
          "No se pudo guardar el detalle de la cotizacion. Intenta de nuevo.",
          "error"
        );
        return;
      }
    }

    Swal.fire("Exito", "Cotizacion guardada correctamente.", "success");

    setCliente("");
    setDireccionCliente("");
    setCiudadCliente("");
    setDocumentoCliente("");
    setTelefonoCliente("");
    setSectorCliente("");
    setEmailCliente("");
    setServicio("");
    setDescuento(0);
    setNombreServicio("");
    setPrecioServicio(0);
    setUsaAnticipo(false);
    setNumeroCuentaBanco(CUENTA_BANCO_EMPRESA);
    setNombreCuentaBanco(TITULAR_CUENTA_EMPRESA);
    setBancoCuentaBanco(BANCO_EMPRESA);
    setServicioSugerido("");
    setSolicitudSeleccionada("");
    setDetalle([]);
    setCategoriaSeleccionada("");
    setMarcaSeleccionada("");
    setProductoSeleccionado("");
    setCantidadCatalogo(1);
    setPrecioCatalogo(0);
    limpiarLineaManual();
    fetchCotizaciones();
  }

  async function eliminarCotizacion(id) {
    const result = await Swal.fire({
      title: "Eliminar cotizacion?",
      text: "Esta accion no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    await supabase.from("cotizacion_items").delete().eq("cotizacion_id", id);
    await supabase.from("detalle_cotizacion").delete().eq("cotizacion_id", id);
    await supabase.from("cotizaciones").delete().eq("id", id);

    setCotizaciones((prev) => prev.filter((c) => c.id !== id));
    Swal.fire("Eliminada", "La cotizacion ha sido eliminada.", "success");
  }

  function textoAnticipo(cotizacion) {
    if (!cotizacion.usa_anticipo) return "No";
    return `Inicial: RD$${toNumber(cotizacion.monto_anticipo).toFixed(
      2
    )} / Restante: RD$${toNumber(cotizacion.monto_pendiente).toFixed(2)}${
      cotizacion.banco_cuenta_banco ? ` / Banco: ${cotizacion.banco_cuenta_banco}` : ""
    }${cotizacion.nombre_cuenta_banco ? ` / Titular: ${cotizacion.nombre_cuenta_banco}` : ""}${
      cotizacion.numero_cuenta_banco ? ` / Cuenta: ${cotizacion.numero_cuenta_banco}` : ""
    }`;
  }

  return (
    <Wrapper>
      <PageHeader>
        <PageTitle>Cotizaciones</PageTitle>
        <PageDescription>
          Crea propuestas por bloques y revisa el historial de forma rapida desde
          escritorio o telefono.
        </PageDescription>
      </PageHeader>

      <FormCard onSubmit={guardarCotizacion}>
        <Section>
          <SectionTitle>Nueva cotizacion</SectionTitle>
          <Description>
            Completa datos del cliente, agrega conceptos y guarda todo en un solo flujo.
          </Description>

          <Grid>
            <div>
              <Label>Cliente</Label>
              <Input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <Label>Tipo de servicio</Label>
              <Input
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                placeholder="Ej: Instalacion de camaras IP"
              />
            </div>

            <div>
              <Label>Servicio sugerido (opcional)</Label>
              <Select
                value={servicioSugerido}
                onChange={(e) => {
                  const value = e.target.value;
                  setServicioSugerido(value);
                  if (value && !servicio.trim()) setServicio(value);
                }}
              >
                <option value="">Seleccion manual</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.nombre}>
                    {s.nombre}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Vincular solicitud / ticket</Label>
              <Select
                value={solicitudSeleccionada}
                onChange={(e) => {
                  const value = e.target.value;
                  setSolicitudSeleccionada(value);
                  if (!value) return;

                  const solicitud = solicitudes.find((sol) => sol.id === Number(value));
                  if (!solicitud) return;

                  if (!cliente.trim() && solicitud.cliente) {
                    setCliente(solicitud.cliente);
                  }

                  const nombreServ = getNombreServicioDesdeSolicitud(solicitud);
                  if (!servicio.trim() && nombreServ) {
                    setServicio(nombreServ);
                  }

                  const documento =
                    solicitud.tipo_cliente === "empresa"
                      ? solicitud.empresa_rnc
                      : solicitud.cedula || solicitud.empresa_rnc || "";

                  if (!direccionCliente.trim() && solicitud.direccion) {
                    setDireccionCliente(solicitud.direccion);
                  }
                  if (!ciudadCliente.trim() && solicitud.ciudad) {
                    setCiudadCliente(solicitud.ciudad);
                  }
                  if (!documentoCliente.trim() && documento) {
                    setDocumentoCliente(documento);
                  }
                  if (!telefonoCliente.trim() && solicitud.telefono) {
                    setTelefonoCliente(solicitud.telefono);
                  }
                  if (!sectorCliente.trim() && solicitud.sector) {
                    setSectorCliente(solicitud.sector);
                  }
                  if (!emailCliente.trim() && solicitud.email) {
                    setEmailCliente(solicitud.email);
                  }
                }}
              >
                <option value="">Sin solicitud ligada</option>
                {solicitudes.map((sol) => (
                  <option key={sol.id} value={sol.id}>
                    {`#${sol.id} - ${sol.numero_caso || "SIN CASO"} - ${
                      sol.cliente || "Sin nombre"
                    } - ${getNombreServicioDesdeSolicitud(sol) || "Servicio"} - ${
                      sol.estado || "Agendado"
                    } - ${
                      sol.tipo_cliente === "empresa"
                        ? `RNC: ${sol.empresa_rnc || "-"}`
                        : `Cedula: ${sol.cedula || "-"}`
                    }`}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Direccion</Label>
              <Input
                value={direccionCliente}
                onChange={(e) => setDireccionCliente(e.target.value)}
                placeholder="Direccion del cliente"
              />
            </div>

            <div>
              <Label>Ciudad</Label>
              <Input
                value={ciudadCliente}
                onChange={(e) => setCiudadCliente(e.target.value)}
                placeholder="Ciudad"
              />
            </div>

            <div>
              <Label>RNC/Cedula</Label>
              <Input
                value={documentoCliente}
                onChange={(e) => setDocumentoCliente(e.target.value)}
                placeholder="Documento del cliente"
              />
            </div>

            <div>
              <Label>Tel</Label>
              <Input
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                placeholder="Telefono"
              />
            </div>

            <div>
              <Label>Sector</Label>
              <Input
                value={sectorCliente}
                onChange={(e) => setSectorCliente(e.target.value)}
                placeholder="Sector"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                placeholder="Correo del cliente"
              />
            </div>
          </Grid>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Agregar concepto manual</SectionTitle>
          <Grid5>
            <div>
              <Label>Categoria</Label>
              <Input
                value={manualCategoria}
                onChange={(e) => setManualCategoria(e.target.value)}
                placeholder="Ej: Camaras"
              />
            </div>

            <div>
              <Label>Modelo</Label>
              <Input
                value={manualModelo}
                onChange={(e) => setManualModelo(e.target.value)}
                placeholder="Ej: DS-2CD1043G0-I"
              />
            </div>

            <div>
              <Label>Descripcion</Label>
              <Input
                value={manualConcepto}
                onChange={(e) => setManualConcepto(e.target.value)}
                placeholder="Ej: Camara IP 4MP exterior"
              />
            </div>

            <div>
              <Label>Marca</Label>
              <Input
                value={manualMarca}
                onChange={(e) => setManualMarca(e.target.value)}
                placeholder="Ej: Hikvision"
              />
            </div>

            <div>
              <Label>Proveedor</Label>
              <Input
                value={manualProveedor}
                onChange={(e) => setManualProveedor(e.target.value)}
                placeholder="Ej: Distribuidora XYZ"
              />
            </div>

            <div>
              <Label>Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={manualCantidad}
                onChange={(e) => setManualCantidad(e.target.value === "" ? 1 : e.target.value)}
              />
            </div>

            <div>
              <Label>Precio unitario (RD$)</Label>
              <Input
                type="number"
                min="0"
                value={manualPrecio}
                onChange={(e) => setManualPrecio(e.target.value === "" ? 0 : e.target.value)}
              />
            </div>
          </Grid5>

          <InlineActions>
            <Button type="button" onClick={agregarConceptoManual}>
              Agregar linea manual
            </Button>
            <GhostButton type="button" onClick={limpiarLineaManual}>
              Limpiar campos
            </GhostButton>
          </InlineActions>
        </Section>

        <Divider />

        <Section>
          <SectionHeader>
            <SectionTitle>Catalogo (opcional)</SectionTitle>
            <GhostButton type="button" onClick={() => setMostrarCatalogo((prev) => !prev)}>
              {mostrarCatalogo ? "Ocultar catalogo" : "Usar catalogo"}
            </GhostButton>
          </SectionHeader>

          {mostrarCatalogo && (
            <>
              <Grid>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={categoriaSeleccionada}
                    onChange={(e) => {
                      setCategoriaSeleccionada(e.target.value);
                      setMarcaSeleccionada("");
                      setProductoSeleccionado("");
                    }}
                  >
                    <option value="">Todas</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Marca</Label>
                  <Select
                    value={marcaSeleccionada}
                    onChange={(e) => {
                      setMarcaSeleccionada(e.target.value);
                      setProductoSeleccionado("");
                    }}
                    disabled={!categoriaSeleccionada && categorias.length > 0}
                  >
                    <option value="">Todas</option>
                    {marcasFiltradas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Descripcion</Label>
                  <Select
                    value={productoSeleccionado}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductoSeleccionado(value);
                      const prod = productos.find((p) => p.id === Number(value));
                      if (prod) setPrecioCatalogo(toNumber(prod.precio));
                    }}
                  >
                    <option value="">Selecciona producto</option>
                    {productosFiltrados.map((p) => (
                      <option key={p.id} value={p.id}>
                        {(p.categoria || "-")} | {(p.modelo || "-")} | {p.nombre} |{" "}
                        {(p.marca || "-")} | {(p.proveedor || "-")} - RD$
                        {toNumber(p.precio).toFixed(2)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={cantidadCatalogo}
                    onChange={(e) =>
                      setCantidadCatalogo(e.target.value === "" ? 1 : e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Precio unitario (editable)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={precioCatalogo}
                    onChange={(e) =>
                      setPrecioCatalogo(e.target.value === "" ? 0 : e.target.value)
                    }
                  />
                </div>
              </Grid>

              <InlineActions>
                <Button type="button" onClick={agregarDesdeCatalogo}>
                  Agregar desde catalogo
                </Button>
              </InlineActions>
            </>
          )}
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Conceptos agregados</SectionTitle>

          <DesktopOnly>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Modelo</th>
                    <th>Descripcion</th>
                    <th>Marca</th>
                    <th>Proveedor</th>
                    <th>Cant.</th>
                    <th>Precio u.</th>
                    <th>Subtotal</th>
                    <th>Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.length === 0 ? (
                    <tr>
                      <td colSpan={9}>Aun no hay lineas agregadas.</td>
                    </tr>
                  ) : (
                    detalle.map((item) => (
                      <tr key={item.idLocal}>
                        <td>{item.categoria || "-"}</td>
                        <td>{item.modelo || "-"}</td>
                        <td>{item.descripcion || item.nombre || "-"}</td>
                        <td>{item.marca || "-"}</td>
                        <td>{item.proveedor || "-"}</td>
                        <td>{item.cantidad}</td>
                        <td>RD${toNumber(item.precio_unitario).toFixed(2)}</td>
                        <td>RD${toNumber(item.subtotal).toFixed(2)}</td>
                        <td>
                          <Trash2
                            size={18}
                            className="delete-btn"
                            onClick={() => eliminarLinea(item.idLocal)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </DesktopOnly>

          <MobileOnly>
            {detalle.length === 0 ? (
              <MutedText>Aun no hay lineas agregadas.</MutedText>
            ) : (
              <LineCardList>
                {detalle.map((item) => (
                  <LineCard key={item.idLocal}>
                    <LineTop>
                      <LineTitle>{item.descripcion || item.nombre || "-"}</LineTitle>
                      <DeleteIconButton
                        type="button"
                        onClick={() => eliminarLinea(item.idLocal)}
                        title="Quitar linea"
                      >
                        <Trash2 size={16} />
                      </DeleteIconButton>
                    </LineTop>
                    <LineMeta>
                      {(item.categoria || "-")} | {(item.modelo || "-")} |{" "}
                      {(item.marca || "-")} | {(item.proveedor || "-")}
                    </LineMeta>
                    <HistoryRow>
                      <span>Cantidad</span>
                      <strong>{item.cantidad}</strong>
                    </HistoryRow>
                    <HistoryRow>
                      <span>Precio unitario</span>
                      <strong>RD${toNumber(item.precio_unitario).toFixed(2)}</strong>
                    </HistoryRow>
                    <HistoryRow>
                      <span>Subtotal</span>
                      <strong>RD${toNumber(item.subtotal).toFixed(2)}</strong>
                    </HistoryRow>
                  </LineCard>
                ))}
              </LineCardList>
            )}
          </MobileOnly>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Totales y condiciones</SectionTitle>
          <Grid>
            <div>
              <Label>Descripcion del servicio (instalacion)</Label>
              <Input
                value={nombreServicio}
                onChange={(e) => setNombreServicio(e.target.value)}
                placeholder="Ej: Instalacion y configuracion completa"
              />
            </div>

            <div>
              <Label>Precio del servicio (RD$)</Label>
              <Input
                type="number"
                min="0"
                value={precioServicio}
                onChange={(e) => setPrecioServicio(e.target.value === "" ? 0 : e.target.value)}
              />
            </div>

            <div>
              <Label>Descuento (%)</Label>
              <Input
                type="number"
                min="0"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value === "" ? 0 : e.target.value)}
              />
            </div>

            <div>
              <Label>Pago parcial</Label>
              <ToggleRow>
                <input
                  type="checkbox"
                  checked={usaAnticipo}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUsaAnticipo(checked);
                    if (!checked) {
                      setNumeroCuentaBanco(CUENTA_BANCO_EMPRESA);
                      setNombreCuentaBanco(TITULAR_CUENTA_EMPRESA);
                      setBancoCuentaBanco(BANCO_EMPRESA);
                      return;
                    }
                    if (!numeroCuentaBanco.trim() && CUENTA_BANCO_EMPRESA) {
                      setNumeroCuentaBanco(CUENTA_BANCO_EMPRESA);
                    }
                    if (!nombreCuentaBanco.trim() && TITULAR_CUENTA_EMPRESA) {
                      setNombreCuentaBanco(TITULAR_CUENTA_EMPRESA);
                    }
                    if (!bancoCuentaBanco.trim() && BANCO_EMPRESA) {
                      setBancoCuentaBanco(BANCO_EMPRESA);
                    }
                  }}
                />
                <span>Permitir 50% inicial / 50% restante</span>
              </ToggleRow>
            </div>
          </Grid>

          {usaAnticipo && (
            <Section>
              <Label>Datos de cuenta de la empresa (donde deposita el cliente)</Label>
              <Grid>
                <div>
                  <Label>Banco</Label>
                  <Input
                    value={bancoCuentaBanco}
                    onChange={(e) => setBancoCuentaBanco(e.target.value)}
                    placeholder={BANCO_EMPRESA || "Ej: Banco Popular"}
                  />
                </div>
                <div>
                  <Label>Titular de la cuenta</Label>
                  <Input
                    value={nombreCuentaBanco}
                    onChange={(e) => setNombreCuentaBanco(e.target.value)}
                    placeholder={TITULAR_CUENTA_EMPRESA || "Ej: ORIS79E SERVICES"}
                  />
                </div>
                <div>
                  <Label>Numero de cuenta</Label>
                  <Input
                    value={numeroCuentaBanco}
                    onChange={(e) => setNumeroCuentaBanco(e.target.value)}
                    placeholder={CUENTA_BANCO_EMPRESA || "Ej: 1234567890"}
                  />
                </div>
              </Grid>
              <MutedText>
                Estos datos son de ORIS79E Services para recibir el pago inicial del 50%.
              </MutedText>
            </Section>
          )}

          <TotalsCard>
            <Row>
              <span>Subtotal conceptos:</span>
              <strong>RD${subtotalConceptos.toFixed(2)}</strong>
            </Row>
            <Row>
              <span>Servicio:</span>
              <strong>RD${precioServicioNum.toFixed(2)}</strong>
            </Row>
            <Row>
              <span>Descuento:</span>
              <strong>{descuentoNum}%</strong>
            </Row>
            <Row>
              <span>Total estimado:</span>
              <strong>RD${totalActual.toFixed(2)}</strong>
            </Row>
            {usaAnticipo && (
              <>
                <Row>
                  <span>Anticipo (50%):</span>
                  <strong>RD${anticipoActual.toFixed(2)}</strong>
                </Row>
                <Row>
                  <span>Pendiente (50%):</span>
                  <strong>RD${pendienteActual.toFixed(2)}</strong>
                </Row>
              </>
            )}
          </TotalsCard>
        </Section>

        <SubmitRow>
          <Button type="submit">Guardar cotizacion</Button>
        </SubmitRow>
      </FormCard>

      <Section>
        <HistoryTitle>Historial de cotizaciones</HistoryTitle>

        <DesktopOnly>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Ticket</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Anticipo</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan={9}>No hay cotizaciones registradas.</td>
                  </tr>
                ) : (
                  cotizaciones.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.cliente}</td>
                      <td>{c.servicio}</td>
                      <td>{c.solicitud_id ? `#${c.solicitud_id}` : "-"}</td>
                      <td>
                        RD$
                        {toNumber(c.total).toLocaleString("es-DO", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <EstadoBadge estado={c.estado || "pendiente"}>
                          {formatearEstado(c.estado)}
                        </EstadoBadge>
                      </td>
                      <td>{textoAnticipo(c)}</td>
                      <td>{new Date(c.fecha).toLocaleDateString()}</td>
                      <td>
                        <HistoryActions>
                          <IconCircleButton
                            type="button"
                            title="Ver cotizacion"
                            onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}
                          >
                            <Eye size={16} />
                          </IconCircleButton>
                          <DeleteIconButton
                            type="button"
                            title="Eliminar cotizacion"
                            onClick={() => eliminarCotizacion(c.id)}
                          >
                            <Trash2 size={16} />
                          </DeleteIconButton>
                        </HistoryActions>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrap>
        </DesktopOnly>

        <MobileOnly>
          {cotizaciones.length === 0 ? (
            <MutedText>No hay cotizaciones registradas.</MutedText>
          ) : (
            <LineCardList>
              {cotizaciones.map((c) => (
                <HistoryCard key={c.id}>
                  <LineTop>
                    <LineTitle>
                      #{c.id} - {c.cliente || "Sin cliente"}
                    </LineTitle>
                    <EstadoBadge estado={c.estado || "pendiente"}>
                      {formatearEstado(c.estado)}
                    </EstadoBadge>
                  </LineTop>

                  <HistoryRow>
                    <span>Servicio</span>
                    <strong>{c.servicio || "-"}</strong>
                  </HistoryRow>
                  <HistoryRow>
                    <span>Ticket</span>
                    <strong>{c.solicitud_id ? `#${c.solicitud_id}` : "-"}</strong>
                  </HistoryRow>
                  <HistoryRow>
                    <span>Total</span>
                    <strong>
                      RD$
                      {toNumber(c.total).toLocaleString("es-DO", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </HistoryRow>
                  <HistoryRow>
                    <span>Fecha</span>
                    <strong>{new Date(c.fecha).toLocaleDateString()}</strong>
                  </HistoryRow>
                  <LineMeta>{textoAnticipo(c)}</LineMeta>

                  <HistoryActions>
                    <IconCircleButton
                      type="button"
                      title="Ver cotizacion"
                      onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}
                    >
                      <Eye size={16} />
                    </IconCircleButton>
                    <DeleteIconButton
                      type="button"
                      title="Eliminar cotizacion"
                      onClick={() => eliminarCotizacion(c.id)}
                    >
                      <Trash2 size={16} />
                    </DeleteIconButton>
                  </HistoryActions>
                </HistoryCard>
              ))}
            </LineCardList>
          )}
        </MobileOnly>
      </Section>
    </Wrapper>
  );
}
