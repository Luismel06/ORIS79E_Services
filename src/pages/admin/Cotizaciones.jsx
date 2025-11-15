import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import Swal from "sweetalert2";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin: 0.5rem 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.7rem;
  margin: 0.5rem 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
    transform: scale(1.03);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 1.5rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  th {
    background: ${({ theme }) => theme.cardBackground};
  }

  tr:hover {
    background: ${({ theme }) => theme.hover};
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

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function Cotizaciones() {
  const [cliente, setCliente] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [servicio, setServicio] = useState("");
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [nombreServicio, setNombreServicio] = useState("");
  const [precioServicio, setPrecioServicio] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServicios();
    fetchProductos();
    fetchCotizaciones();
  }, []);

  async function fetchServicios() {
    const { data, error } = await supabase.from("servicios").select("*");
    if (!error) setServicios(data);
  }

  async function fetchProductos() {
    const { data, error } = await supabase.from("productos").select("*");
    if (!error) setProductos(data);
  }

  async function fetchCotizaciones() {
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setCotizaciones(data);
  }

  // ==========================
  // 🚨 Validación de STOCK
  // ==========================
  function agregarProducto() {
    if (!productoSeleccionado) return;

    const prod = productos.find(
      (p) => p.id === parseInt(productoSeleccionado)
    );
    if (!prod) return;

    const cant = Number(cantidad) || 1;

    if (cant > prod.cantidad) {
      Swal.fire(
        "Cantidad inválida",
        `Solo tienes ${prod.cantidad} unidades disponibles en inventario.`,
        "warning"
      );
      return;
    }

    setDetalle([
      ...detalle,
      {
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio),
        cantidad: cant,
        stockDisponible: prod.cantidad,
      },
    ]);
  }

  function eliminarProducto(index) {
    const nuevo = [...detalle];
    nuevo.splice(index, 1);
    setDetalle(nuevo);
  }

  function calcularTotal() {
    const subtotalProductos = detalle.reduce((acc, item) => {
      const precio = Number(item.precio);
      const cant = Number(item.cantidad);
      if (isNaN(precio) || isNaN(cant)) return acc;
      return acc + precio * cant;
    }, 0);

    const servicioNum = Number(precioServicio) || 0;
    const base = subtotalProductos + servicioNum;

    const desc = Number(descuento) || 0;
    const total = base - (base * desc) / 100;

    return isNaN(total) ? 0 : total;
  }

  async function guardarCotizacion(e) {
    e.preventDefault();

    if (!cliente || !servicio) {
      Swal.fire("Faltan datos", "Debes llenar cliente y servicio", "warning");
      return;
    }

    if (detalle.length === 0 && !precioServicio) {
      Swal.fire(
        "Sin datos",
        "Debes agregar al menos un producto o un precio de servicio",
        "warning"
      );
      return;
    }

    const total = calcularTotal();

    if (total <= 0) {
      Swal.fire(
        "Total inválido",
        "El total calculado debe ser mayor que cero",
        "error"
      );
      return;
    }

    const { data: cot, error } = await supabase
      .from("cotizaciones")
      .insert([
        {
          cliente,
          total,
          descuento: Number(descuento) || 0,
          servicio,
          nombre_servicio: nombreServicio || null,
          precio_servicio: Number(precioServicio) || 0,
          fecha: new Date().toISOString(),
          estado: "pendiente",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo guardar la cotización", "error");
      return;
    }

    for (const d of detalle) {
      await supabase.from("detalle_cotizacion").insert([
        {
          cotizacion_id: cot.id,
          producto_id: d.id,
          cantidad: d.cantidad,
          subtotal: d.precio * d.cantidad,
        },
      ]);
    }

    Swal.fire("Éxito", "Cotización guardada correctamente", "success");

    setCliente("");
    setServicio("");
    setDetalle([]);
    setProductoSeleccionado("");
    setCantidad(1);
    setDescuento(0);
    setNombreServicio("");
    setPrecioServicio(0);
    fetchCotizaciones();
  }

  // ===================================================
  // (SIN CAMBIOS) — ELIMINAR COTIZACIÓN
  // ===================================================
  async function eliminarCotizacion(id) {
    const result = await Swal.fire({
      title: "¿Eliminar cotización?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    // Primero eliminar detalles
    await supabase
      .from("detalle_cotizacion")
      .delete()
      .eq("cotizacion_id", id);

    // Luego la cotización
    await supabase.from("cotizaciones").delete().eq("id", id);

    setCotizaciones((prev) => prev.filter((c) => c.id !== id));

    Swal.fire("Eliminada", "La cotización ha sido eliminada.", "success");
  }

  return (
    <Wrapper>
      <Form onSubmit={guardarCotizacion}>
        <h2 style={{ color: "#00bcd4" }}>Nueva Cotización</h2>

        <label>Cliente</label>
        <Input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre del cliente"
        />

        <label>Servicio</label>
        <Select
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
        >
          <option value="">Seleccione un servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </Select>

        <label>Producto</label>
        <Select
          value={productoSeleccionado}
          onChange={(e) => setProductoSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} - RD${p.precio} (Stock: {p.cantidad})
            </option>
          ))}
        </Select>

        <label>Cantidad</label>
        <Input
          type="number"
          value={isNaN(cantidad) ? "" : cantidad}
          min="1"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              setCantidad("");
            } else {
              const num = parseInt(v);
              setCantidad(isNaN(num) ? 1 : num);
            }
          }}
        />

        <Button type="button" onClick={agregarProducto}>
          Agregar producto
        </Button>

        {detalle.length > 0 && (
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th>Quitar</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, i) => (
                <tr key={i}>
                  <td>{d.nombre}</td>
                  <td>{d.cantidad}</td>
                  <td>RD${d.precio}</td>
                  <td>RD${(d.precio * d.cantidad).toFixed(2)}</td>
                  <td>
                    <Trash2
                      size={20}
                      className="delete-btn"
                      onClick={() => eliminarProducto(i)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Divider />

        <label>Descripción del servicio (instalación)</label>
        <Input
          placeholder="Ej: Instalación completa de cámaras"
          value={nombreServicio}
          onChange={(e) => setNombreServicio(e.target.value)}
        />

        <label>Precio del servicio</label>
        <Input
          type="number"
          value={precioServicio === 0 ? "" : precioServicio}
          onChange={(e) =>
            setPrecioServicio(
              e.target.value === "" ? 0 : Number(e.target.value)
            )
          }
        />

        <Divider />

        <label>Descuento (%)</label>
        <Input
          type="number"
          value={isNaN(descuento) ? "" : descuento}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              setDescuento(0);
            } else {
              const num = parseFloat(v);
              setDescuento(isNaN(num) ? 0 : num);
            }
          }}
        />

        <Button type="submit">Guardar cotización</Button>
      </Form>

      <h3>Historial de cotizaciones</h3>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Total</th>
            <th>Estado</th>
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
              <td>RD${c.total}</td>
              <td>
                <EstadoBadge estado={c.estado || "pendiente"}>
                  ● {formatearEstado(c.estado)}
                </EstadoBadge>
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
    </Wrapper>
  );
}
