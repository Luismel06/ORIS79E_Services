import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  padding: 2rem;
`;

const FormCard = styled.form`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Section = styled.div`
  margin-top: 1rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.accent};
`;

const Description = styled.p`
  margin-bottom: 0.8rem;
  font-size: 0.92rem;
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
  grid-template-columns: 1fr 1fr 1.8fr 0.8fr 1fr;
  gap: 0.7rem;
  align-items: end;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.88rem;
  margin-bottom: 0.2rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.65rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1rem;
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

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
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
  padding: 0.9rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.inputBackground || theme.cardBackground};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.35rem 0;
  font-size: 0.92rem;
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
  const [manualMarca, setManualMarca] = useState("");
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
        "id, cliente, servicio_id, estado, numero_caso, tipo_cliente, cedula, empresa_rnc, empresa_nombre"
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
      .select("id, nombre, precio, categoria, marca, proveedor");
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
    setManualMarca("");
    setManualConcepto("");
    setManualCantidad(1);
    setManualPrecio(0);
  }

  function agregarConceptoManual() {
    const concepto = manualConcepto.trim();
    const cantidad = toNumber(manualCantidad);
    const precio = toNumber(manualPrecio);

    if (!concepto) {
      Swal.fire("Falta concepto", "Escribe el nombre del equipo o material.", "warning");
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
        marca: manualMarca.trim() || "Sin marca",
        nombre: concepto,
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
        marca: prod.marca || prod.proveedor || "Sin marca",
        nombre: prod.nombre,
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
        nombre_producto: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
      }));

      const { error: errorItems } = await supabase
        .from("cotizacion_items")
        .insert(payloadItems);

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

  return (
    <Wrapper>
      <FormCard onSubmit={guardarCotizacion}>
        <SectionTitle>Nueva Cotizacion</SectionTitle>
        <Description>
          Flujo manual: escribe categoria, marca, concepto, cantidad y precio para cada
          linea. El catalogo queda como opcion secundaria.
        </Description>

        <Section>
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
              <Label>Marca</Label>
              <Input
                value={manualMarca}
                onChange={(e) => setManualMarca(e.target.value)}
                placeholder="Ej: Hikvision"
              />
            </div>

            <div>
              <Label>Equipo / concepto</Label>
              <Input
                value={manualConcepto}
                onChange={(e) => setManualConcepto(e.target.value)}
                placeholder="Ej: Camara IP 4MP exterior"
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

          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.7rem" }}>
            <Button type="button" onClick={agregarConceptoManual}>
              Agregar linea manual
            </Button>
            <GhostButton type="button" onClick={limpiarLineaManual}>
              Limpiar campos
            </GhostButton>
          </div>
        </Section>

        <Divider />

        <Section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SectionTitle style={{ marginBottom: 0 }}>Catalogo (opcional)</SectionTitle>
            <GhostButton
              type="button"
              onClick={() => setMostrarCatalogo((prev) => !prev)}
              style={{ marginTop: 0 }}
            >
              {mostrarCatalogo ? "Ocultar catalogo" : "Usar catalogo"}
            </GhostButton>
          </div>

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
                  <Label>Producto</Label>
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
                        {p.nombre} - RD${toNumber(p.precio).toFixed(2)}
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

              <Button type="button" onClick={agregarDesdeCatalogo} style={{ marginTop: "0.7rem" }}>
                Agregar desde catalogo
              </Button>
            </>
          )}
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Conceptos agregados</SectionTitle>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Marca</th>
                  <th>Concepto</th>
                  <th>Cant.</th>
                  <th>Precio u.</th>
                  <th>Subtotal</th>
                  <th>Quitar</th>
                </tr>
              </thead>
              <tbody>
                {detalle.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Aun no hay lineas agregadas.</td>
                  </tr>
                ) : (
                  detalle.map((item) => (
                    <tr key={item.idLocal}>
                      <td>{item.categoria || "-"}</td>
                      <td>{item.marca || "-"}</td>
                      <td>{item.nombre}</td>
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
        </Section>

        <Divider />

        <Section>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "0.55rem" }}>
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
              </div>
            </div>
          </Grid>

          {usaAnticipo && (
            <div style={{ marginTop: "0.8rem" }}>
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
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", opacity: 0.8 }}>
                Estos datos son de ORIS79E Services para recibir el pago inicial del 50%.
              </p>
            </div>
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

        <Button type="submit" style={{ marginTop: "1rem" }}>
          Guardar cotizacion
        </Button>
      </FormCard>

      <h3>Historial de cotizaciones</h3>
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
            {cotizaciones.map((c) => (
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
                <td>
                  {c.usa_anticipo
                    ? `Inicial: RD$${toNumber(c.monto_anticipo).toFixed(2)} / Restante: RD$${toNumber(
                        c.monto_pendiente
                      ).toFixed(2)}${
                        c.banco_cuenta_banco
                          ? ` / Banco: ${c.banco_cuenta_banco}`
                          : ""
                      }${
                        c.nombre_cuenta_banco
                          ? ` / Titular: ${c.nombre_cuenta_banco}`
                          : ""
                      }${
                        c.numero_cuenta_banco
                          ? ` / Cuenta: ${c.numero_cuenta_banco}`
                          : ""
                      }`
                    : "No"}
                </td>
                <td>{new Date(c.fecha).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Eye
                    size={18}
                    style={{ cursor: "pointer", color: "#00bcd4" }}
                    onClick={() => navigate(`/admin/cotizaciones/${c.id}`)}
                  />
                  <Trash2
                    size={18}
                    className="delete-btn"
                    onClick={() => eliminarCotizacion(c.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Wrapper>
  );
}
