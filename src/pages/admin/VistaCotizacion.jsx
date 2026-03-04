import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Download } from "lucide-react";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/useAuthStore.jsx";

const Wrapper = styled.div`
  padding: clamp(0.7rem, 2vw, 1.4rem);
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 860px;
  background: ${({ theme }) => theme.cardBackground};
  padding: clamp(1rem, 2vw, 1.8rem);
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.accent};
`;

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.8;
  margin: 0 0 0.4rem;
`;

const SectionTitle = styled.h3`
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 6px;
`;

const InfoRow = styled.div`
  margin: 0.4rem 0;
  display: flex;
  justify-content: space-between;
  font-size: 0.97rem;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.2rem;
  }
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  min-width: 600px;

  th,
  td {
    padding: 0.8rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.inputBackground};
  }
`;

const TotalBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBackground};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.4rem 0;
  font-size: 1rem;
  gap: 1rem;

  @media (max-width: 560px) {
    flex-direction: column;
    gap: 0.2rem;
  }
`;

const Strong = styled.span`
  font-weight: 700;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  padding: 0.8rem 1.3rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1.5rem;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.55rem;
  margin-top: 0.7rem;
  flex-wrap: wrap;
`;

const ActionChip = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: ${({ $color }) => $color || "#0b1b2b"};
  background: ${({ $background }) => $background || "rgba(0, 188, 212, 0.18)"};
`;

const EditHint = styled.p`
  font-size: 0.9rem;
  opacity: 0.75;
  margin-bottom: 0.8rem;
`;

const EditGroup = styled.div`
  margin-bottom: 1rem;
`;

const EditLine = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.65rem;
  background: ${({ theme }) => theme.inputBackground};
  display: grid;
  grid-template-columns: 1.6fr 1.1fr 1fr 1.8fr 1fr 1.2fr 0.85fr 1fr auto;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-items: end;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 980px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const EditField = styled.div`
  min-width: 0;
`;

const EditFieldLabel = styled.span`
  display: block;
  font-size: 0.76rem;
  font-weight: 600;
  opacity: 0.72;
  margin-bottom: 0.25rem;
`;

const BasicSelect = styled.select`
  width: 100%;
  min-width: 0;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  text-overflow: ellipsis;
`;

const BasicInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
`;

const DeleteLineButton = styled.button`
  background: transparent;
  border: 1px solid rgba(192, 57, 43, 0.35);
  color: #c0392b;
  cursor: pointer;
  border-radius: 8px;
  min-width: 42px;
  min-height: 38px;
  width: 100%;
`;

const AddLineButton = styled.button`
  margin-top: 0.7rem;
  background: ${({ theme }) => theme.accent};
  color: #fff;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const EditLineTools = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 560px) {
    display: grid;
    grid-template-columns: 1fr;
  }
`;

const EditFields = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const EditLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const SignatureBlock = styled.div`
  margin-top: 2rem;
`;

const PdfButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
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

// 🔹 Datos de la empresa para el PDF
const EMPRESA = {
  nombre: "ORIS79E SERVICES",
  rnc: "1-33-56833-2",
  direccion: "Santo Domingo, República Dominicana",
  telefono: "+1 (849) 577-6011",
  email: "oriseservice394@gmail.com",
};
const CUENTA_BANCO_EMPRESA =
  import.meta.env.VITE_EMPRESA_CUENTA_BANCO?.trim() || "";
const BANCO_EMPRESA = import.meta.env.VITE_EMPRESA_BANCO?.trim() || "";
const TITULAR_CUENTA_EMPRESA =
  import.meta.env.VITE_EMPRESA_TITULAR_CUENTA?.trim() || "";

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function VistaCotizacion() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [cotizacion, setCotizacion] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [solicitud, setSolicitud] = useState(null); // 🔗 ticket / solicitud

  // 🔧 Para edición
  const [editMode, setEditMode] = useState(false);
  const [productos, setProductos] = useState([]);
  const [editDetalle, setEditDetalle] = useState([]);
  const [editNombreServicio, setEditNombreServicio] = useState("");
  const [editPrecioServicio, setEditPrecioServicio] = useState(0);
  const [editDescuento, setEditDescuento] = useState(0);
  // Formato moneda RD$ con separador de miles
function formatRD(value) {
  const num = Number(value || 0);
  return `RD$ ${num.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getDetalleDescripcion(item) {
  return item?.nombre_producto || item?.producto?.nombre || "-";
}

function getDetalleReferencia(item, index = 0) {
  const modelo = String(item?.modelo || item?.producto?.modelo || "").trim();
  const modeloNormalizado = modelo.toLowerCase();
  if (
    modelo &&
    modeloNormalizado !== "sin modelo" &&
    modeloNormalizado !== "n/a" &&
    modeloNormalizado !== "na" &&
    modeloNormalizado !== "-"
  ) {
    return modelo;
  }
  return item?.producto_id ? `PROD-${item.producto_id}` : `ITEM-${index + 1}`;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

  useEffect(() => {
    fetchCotizacion();
  }, []);

  async function fetchCotizacion() {
    const { data: cot } = await supabase
      .from("cotizaciones")
      .select("*")
      .eq("id", id)
      .single();

    setCotizacion(cot || null);

    // Leer items manuales primero; fallback a detalle legacy
    const [{ data: items }, { data: detLegacy }, { data: productosData }] =
      await Promise.all([
        supabase
          .from("cotizacion_items")
          .select("*")
          .eq("cotizacion_id", id),
        supabase
          .from("detalle_cotizacion")
          .select("*")
          .eq("cotizacion_id", id),
        supabase
          .from("productos")
          .select("id, nombre, precio, categoria, modelo, marca, proveedor"),
      ]);

    const detalleBase = items && items.length > 0 ? items : detLegacy || [];
    const productosMap = (productosData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const detalleConProducto = (detalleBase || []).map((d, index) => {
      const cantidad = Number(d.cantidad || 0);
      const subtotal = Number(d.subtotal || 0);
      const precioUnit =
        d.precio_unitario != null
          ? Number(d.precio_unitario)
          : cantidad > 0
          ? subtotal / cantidad
          : 0;
      const producto = productosMap[d.producto_id] || null;

      return {
        ...d,
        id: d.id ?? `legacy-${index}`,
        cantidad,
        subtotal,
        precio_unitario: precioUnit,
        nombre_producto: d.nombre_producto || producto?.nombre || "-",
        categoria: d.categoria || producto?.categoria || null,
        modelo: d.modelo || producto?.modelo || null,
        marca: d.marca || producto?.marca || null,
        proveedor: d.proveedor || producto?.proveedor || null,
        producto,
      };
    });

    setDetalle(detalleConProducto || []);
    setProductos(productosData || []);

    // Inicializar campos de edición
    if (cot) {
      setEditNombreServicio(cot.nombre_servicio || "");
      setEditPrecioServicio(Number(cot.precio_servicio || 0));
      setEditDescuento(Number(cot.descuento || 0));
    }

    const editDet = (detalleConProducto || []).map((d) => ({
      producto_id: d.producto_id || null,
      categoria: d.categoria || d.producto?.categoria || "",
      modelo: d.modelo || d.producto?.modelo || "",
      descripcion: getDetalleDescripcion(d),
      marca: d.marca || d.producto?.marca || "",
      proveedor: d.proveedor || d.producto?.proveedor || "",
      cantidad: Number(d.cantidad || 1),
      precio_unitario:
        d.precio_unitario != null
          ? Number(d.precio_unitario)
          : Number(d.subtotal || 0) / Number(d.cantidad || 1),
    }));
    setEditDetalle(editDet);

    // 🔗 Si la cotización tiene solicitud_id, cargamos la solicitud
    if (cot?.solicitud_id) {
      const { data: sol } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("id", cot.solicitud_id)
        .single();

      setSolicitud(sol || null);
    } else {
      setSolicitud(null);
    }
  }

  // -------- TOTALES (con ITBIS 18%) ----------
  const subtotalProductos = detalle.reduce(
    (acc, d) => acc + Number(d.subtotal || 0),
    0
  );
  const servicioNum = cotizacion ? Number(cotizacion.precio_servicio || 0) : 0;
  const base = subtotalProductos + servicioNum;
  const itebis = base * 0.18;
  const descuentoPct = cotizacion ? Number(cotizacion.descuento || 0) : 0;
  const descuentoMonto = (base * descuentoPct) / 100;
  const total = base + itebis - descuentoMonto;

  // Estos solo se usan en el PDF de plan 50/50
  const inicial50 = total * 0.5;
  const restante50 = total - inicial50;
  const cuentaBanco50 = cotizacion
    ? String(cotizacion.numero_cuenta_banco || CUENTA_BANCO_EMPRESA || "").trim()
    : "";
  const titularCuenta50 = cotizacion
    ? String(cotizacion.nombre_cuenta_banco || TITULAR_CUENTA_EMPRESA || "").trim()
    : "";
  const bancoCuenta50 = cotizacion
    ? String(cotizacion.banco_cuenta_banco || BANCO_EMPRESA || "").trim()
    : "";
  // -------------------------------------------

  const clienteNombreVista =
    (solicitud?.tipo_cliente === "empresa" && solicitud?.empresa_nombre) ||
    solicitud?.cliente ||
    cotizacion?.cliente ||
    "-";
  const clienteDireccionVista =
    solicitud?.direccion || cotizacion?.cliente_direccion || "-";
  const clienteCiudadVista = solicitud?.ciudad || cotizacion?.cliente_ciudad || "-";
  const clienteSectorVista = solicitud?.sector || cotizacion?.cliente_sector || "-";
  const clienteTelefonoVista =
    solicitud?.telefono || cotizacion?.cliente_telefono || "-";
  const clienteEmailVista = solicitud?.email || cotizacion?.cliente_email || "-";
  const clienteDocumentoLabelVista =
    solicitud?.tipo_cliente === "empresa"
      ? "RNC"
      : solicitud?.tipo_cliente === "persona"
      ? "Cedula"
      : "RNC/Cedula";
  const clienteDocumentoVista =
    solicitud?.tipo_cliente === "empresa"
      ? solicitud?.empresa_rnc || cotizacion?.cliente_documento || "-"
      : solicitud?.cedula ||
        solicitud?.empresa_rnc ||
        cotizacion?.cliente_documento ||
        "-";

  // -------------- CAMBIO DE ESTADO + STOCK -----------------
  async function cambiarEstado(nuevoEstado) {
    if (!cotizacion) return;

    if (nuevoEstado === cotizacion.estado) {
      Swal.fire("Sin cambios", "La cotizacion ya tiene ese estado.", "info");
      return;
    }

    if (nuevoEstado === "aceptada") {
      if (cotizacion.estado === "aceptada") {
        Swal.fire(
          "Ya aceptada",
          "Esta cotización ya fue aceptada anteriormente. El inventario ya se descontó.",
          "info"
        );
        return;
      }

      const faltantes = [];

      for (const item of detalle) {
        if (!item.producto_id) continue;

        const { data: prod, error } = await supabase
          .from("productos")
          .select("id, nombre, cantidad")
          .eq("id", item.producto_id)
          .single();

        if (error) {
          console.error(error);
          Swal.fire(
            "Error",
            "No se pudo validar el inventario de los productos.",
            "error"
          );
          return;
        }

        const disponible = Number(prod?.cantidad || 0);
        const requerida = Number(item.cantidad || 0);

        if (requerida > disponible) {
          faltantes.push({
            nombre: prod.nombre,
            disponible,
            requerida,
          });
        }
      }

      if (faltantes.length > 0) {
        const msg = faltantes
          .map(
            (f) =>
              `${f.nombre}: requiere ${f.requerida} y solo hay ${f.disponible}`
          )
          .join("\n");

        Swal.fire(
          "Stock insuficiente",
          `No hay inventario suficiente para los siguientes productos:\n\n${msg}`,
          "warning"
        );
        return;
      }

      for (const item of detalle) {
        if (!item.producto_id) continue;

        const { data: prod } = await supabase
          .from("productos")
          .select("cantidad")
          .eq("id", item.producto_id)
          .single();

        const disponible = Number(prod?.cantidad || 0);
        const requerida = Number(item.cantidad || 0);
        const nuevaCantidad = disponible - requerida;

        await supabase
          .from("productos")
          .update({ cantidad: nuevaCantidad })
          .eq("id", item.producto_id);
      }
    }

    const { error } = await supabase
      .from("cotizaciones")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error(error);
      return Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }

    Swal.fire("Estado actualizado", "", "success");
    fetchCotizacion();
  }
  // --------------------------------------------------

  if (!cotizacion) return <p style={{ padding: "2rem" }}>Cargando...</p>;

  async function cargarLogo() {
    try {
      const resp = await fetch("/logo-oris79e.png");
      const blob = await resp.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("No se pudo cargar el logo:", err);
      return null;
    }
  }

  // =================== PDF GENERAL (COTIZ / FACTURA / PLAN 50) ===================
  function construirPDF(logoDataUrl, tipoDoc = "cotizacion") {
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const lineGap = 14;
    const primary = [15, 163, 177];
    const dark = [40, 40, 40];
    const gray = [90, 90, 90];

    const titulo =
      tipoDoc === "factura"
        ? "FACTURA"
        : tipoDoc === "plan50"
        ? "COTIZACION (PLAN 50/50)"
        : "COTIZACION";

    const numeroDoc = String(cotizacion?.id || "").padStart(5, "0");
    const fechaDoc = cotizacion?.fecha ? new Date(cotizacion.fecha) : new Date();
    const fechaDocStr = fechaDoc.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const usuarioDoc = user?.email || "Administrador";

    const clienteNombre = clienteNombreVista;
    const clienteDireccion = clienteDireccionVista;
    const clienteCiudad = clienteCiudadVista;
    const clienteSector = clienteSectorVista;
    const clienteTelefono = clienteTelefonoVista;
    const clienteEmail = clienteEmailVista;
    const clienteDocumentoLabel = clienteDocumentoLabelVista;
    const clienteDocumento = clienteDocumentoVista;

    let y = 40;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginX, y - 6, 58, 58);
    }

    const infoX = logoDataUrl ? marginX + 70 : marginX;
    doc.setTextColor(...dark);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text(EMPRESA.nombre, infoX, y + 6);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...gray);
    doc.text(`Direccion: ${EMPRESA.direccion}`, infoX, y + 20);
    doc.text(`Telefono: ${EMPRESA.telefono}`, infoX, y + 32);
    doc.text(`RNC: ${EMPRESA.rnc}`, infoX, y + 44);

    const rightX = pageWidth - marginX;
    doc.setTextColor(...dark);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(titulo, rightX, y + 6, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`No. de cotizacion: ${numeroDoc}`, rightX, y + 20, {
      align: "right",
    });
    doc.text(`Fecha: ${fechaDocStr}`, rightX, y + 32, { align: "right" });
    doc.text(`Usuario: ${usuarioDoc}`, rightX, y + 44, { align: "right" });

    y += 66;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 18;
    doc.setTextColor(...dark);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Datos del cliente:", marginX, y);
    y += 10;

    const datosCliente = [
      ["Nombre", clienteNombre],
      ["Direccion", clienteDireccion],
      ["Ciudad", clienteCiudad],
      [clienteDocumentoLabel, clienteDocumento],
      ["Tel", clienteTelefono],
      ["Sector", clienteSector],
      ["Email", clienteEmail],
    ];

    doc.setFontSize(10);
    for (const [label, valor] of datosCliente) {
      y += lineGap;
      doc.setFont("Helvetica", "bold");
      doc.text(`${label}:`, marginX, y);
      doc.setFont("Helvetica", "normal");
      doc.text(String(valor || "-"), marginX + 95, y, {
        maxWidth: pageWidth - marginX * 2 - 95,
      });
    }

    y += 20;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Datos de la cotizacion:", marginX, y);

    const itbsRate = 0.18;

    const lineas = detalle.map((d, index) => {
      const cantidad = Number(d.cantidad || 0);
      const subtotalBase = Number(d.subtotal || 0);
      const precioBruto =
        d.precio_unitario != null
          ? Number(d.precio_unitario)
          : cantidad > 0
          ? subtotalBase / cantidad
          : 0;
      const itbsUnit = precioBruto * itbsRate;
      const precioConItbs = precioBruto + itbsUnit;
      const subtotalConItbs = precioConItbs * cantidad;
      const referencia = getDetalleReferencia(d, index);

      return {
        cantidad,
        referencia,
        descripcion: getDetalleDescripcion(d),
        precioBruto,
        itbsUnit,
        precioConItbs,
        subtotalConItbs,
      };
    });

    if (servicioNum > 0) {
      const itbsServicio = servicioNum * itbsRate;
      lineas.push({
        cantidad: 1,
        referencia: "SERVICIO",
        descripcion:
          cotizacion.nombre_servicio || cotizacion.servicio || "Servicio tecnico",
        precioBruto: servicioNum,
        itbsUnit: itbsServicio,
        precioConItbs: servicioNum + itbsServicio,
        subtotalConItbs: servicioNum + itbsServicio,
      });
    }

    if (lineas.length === 0) {
      lineas.push({
        cantidad: 1,
        referencia: "-",
        descripcion: "Sin conceptos cargados",
        precioBruto: 0,
        itbsUnit: 0,
        precioConItbs: 0,
        subtotalConItbs: 0,
      });
    }

    const body = lineas.map((row) => [
      String(row.cantidad),
      String(row.referencia),
      String(row.descripcion),
      formatRD(row.precioBruto),
      formatRD(row.itbsUnit),
      formatRD(row.precioConItbs),
      formatRD(row.subtotalConItbs),
    ]);

    autoTable(doc, {
      startY: y + 8,
      head: [
        [
          "Cantidad",
          "Referencia",
          "Descripcion",
          "Precio Bruto",
          "ITBS",
          "Precio con ITBS",
          "Sub Total",
        ],
      ],
      body,
      theme: "grid",
      styles: {
        fontSize: 8.8,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: primary,
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 50, halign: "center" },
        1: { cellWidth: 72 },
        2: { cellWidth: 150 },
        3: { cellWidth: 70, halign: "right" },
        4: { cellWidth: 60, halign: "right" },
        5: { cellWidth: 75, halign: "right" },
        6: { cellWidth: 55, halign: "right" },
      },
    });

    const subtotalBruto = lineas.reduce(
      (acc, row) => acc + row.precioBruto * row.cantidad,
      0
    );
    const totalItbs = lineas.reduce(
      (acc, row) => acc + row.itbsUnit * row.cantidad,
      0
    );
    const descuentoLocal = (subtotalBruto * descuentoPct) / 100;
    const totalDocumento = subtotalBruto + totalItbs - descuentoLocal;

    let resumeY = doc.lastAutoTable.finalY + 16;
    if (resumeY > pageHeight - 220) {
      doc.addPage();
      resumeY = 60;
    }

    const boxX = pageWidth - 260;
    const boxWidth = 220;
    const boxHeight = tipoDoc === "plan50" ? 170 : 100;
    doc.setDrawColor(210, 210, 210);
    doc.roundedRect(boxX, resumeY, boxWidth, boxHeight, 6, 6, "S");

    let ty = resumeY + 18;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);

    doc.text("Subtotal:", boxX + 10, ty);
    doc.text(formatRD(subtotalBruto), boxX + boxWidth - 10, ty, { align: "right" });
    ty += 16;

    doc.text("ITBS:", boxX + 10, ty);
    doc.text(formatRD(totalItbs), boxX + boxWidth - 10, ty, { align: "right" });
    ty += 16;

    doc.text(`Descuento (${descuentoPct}%):`, boxX + 10, ty);
    doc.text(formatRD(descuentoLocal), boxX + boxWidth - 10, ty, { align: "right" });
    ty += 16;

    doc.setFontSize(11.5);
    doc.setTextColor(...primary);
    doc.text("TOTAL:", boxX + 10, ty);
    doc.text(formatRD(totalDocumento), boxX + boxWidth - 10, ty, {
      align: "right",
    });

    if (tipoDoc === "plan50") {
      const inicial = totalDocumento * 0.5;
      const restante = totalDocumento - inicial;

      doc.setTextColor(...dark);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);

      ty += 18;
      doc.text(`Inicial 50%: ${formatRD(inicial)}`, boxX + 10, ty);
      ty += 14;
      doc.text(`Restante 50%: ${formatRD(restante)}`, boxX + 10, ty);
      ty += 14;
      doc.text(`Banco: ${bancoCuenta50 || "-"}`, boxX + 10, ty, {
        maxWidth: boxWidth - 20,
      });
      ty += 14;
      doc.text(`Titular: ${titularCuenta50 || "-"}`, boxX + 10, ty, {
        maxWidth: boxWidth - 20,
      });
      ty += 14;
      doc.text(`Cuenta: ${cuentaBanco50 || "-"}`, boxX + 10, ty, {
        maxWidth: boxWidth - 20,
      });
    }

    let firmaY = resumeY + boxHeight + 40;
    if (firmaY > pageHeight - 80) {
      doc.addPage();
      firmaY = 90;
    }

    doc.setDrawColor(0, 0, 0);
    doc.line(marginX, firmaY, marginX + 220, firmaY);
    doc.setTextColor(...gray);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Firma del cliente", marginX + 70, firmaY + 14);

    doc.text(`Telefono: ${EMPRESA.telefono}`, marginX, pageHeight - 30);
    doc.text(`RNC: ${EMPRESA.rnc}`, pageWidth - marginX, pageHeight - 30, {
      align: "right",
    });

    return doc;
  }


  // =============== PDF ESPECIAL: ORDEN DE COMPRA ==================
  function construirOrdenCompraPDF() {
    const doc = new jsPDF("p", "pt", "a4");

    const marginX = 40;
    let y = 50;

    const formatMoney = (value) =>
      `RD$ ${Number(value || 0).toLocaleString("es-DO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const fechaStr = new Date(cotizacion.fecha).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const numeroOrden = String(cotizacion.id).padStart(5, "0");

    // TÍTULO
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Orden de Compra", marginX, y + 10);

    doc.setFontSize(11);
    doc.setFont("Helvetica", "normal");
    doc.text(`Fecha: ${fechaStr}`, 400, y);
    doc.text(`Nº de orden: ${numeroOrden}`, 400, y + 18);

    y += 50;

    // DATOS PROVEEDOR / CLIENTE
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Datos del proveedor", marginX, y);
    doc.text("Datos del cliente", 320, y);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    y += 18;

    const proveedorLines = [
      `Nombre o razón social: ${EMPRESA.nombre}`,
      `RNC: ${EMPRESA.rnc}`,
      `Dirección: ${EMPRESA.direccion}`,
      `Teléfono: ${EMPRESA.telefono}`,
      `Correo electrónico: ${EMPRESA.email}`,
    ];

    const clienteLines = [
      `Nombre o razón social: ${clienteNombreVista}`,
      `RNC / ID: ${clienteDocumentoVista}`,
      `Dirección: ${clienteDireccionVista}`,
      `Ciudad: ${clienteCiudadVista}`,
      `Sector: ${clienteSectorVista}`,
      `Teléfono: ${clienteTelefonoVista}`,
      `Correo electrónico: ${clienteEmailVista}`,
    ];


    const lineHeight = 14;

    proveedorLines.forEach((line, idx) => {
      doc.text(line, marginX, y + idx * lineHeight);
    });

    clienteLines.forEach((line, idx) => {
      doc.text(line, 320, y + idx * lineHeight);
    });

    const tableY =
      y + Math.max(proveedorLines.length, clienteLines.length) * lineHeight + 20;

    // TABLA DE ITEMS
    const body = detalle.map((d, index) => {
      const cantidad = Number(d.cantidad || 0);
      const subtotal = Number(d.subtotal || 0);
      const unit = cantidad > 0 ? subtotal / cantidad : 0;

      return [
        getDetalleReferencia(d, index),
        getDetalleDescripcion(d),
        cantidad,
        formatMoney(unit),
        formatMoney(subtotal),
      ];
    });

    if (servicioNum > 0) {
      body.push([
        "SERV",
        cotizacion.nombre_servicio ||
          `Servicio: ${cotizacion.servicio || "Instalación"}`,
        1,
        formatMoney(servicioNum),
        formatMoney(servicioNum),
      ]);
    }

    autoTable(doc, {
      startY: tableY,
      head: [
        ["Ref.", "Descripción", "Cantidad", "Precio unitario", "Precio total"],
      ],
      body,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    const endY = doc.lastAutoTable.finalY + 20;

    // TOTALES ESTILO ORDEN DE COMPRA
    const totalPedido = base; // subtotal productos + servicio
    const montoDescuento = descuentoMonto; // ya calculado sobre base
    const gastosEnvio = 0; // si luego agregas campo en BD lo pones aquí
    const totalConDescuento = totalPedido - montoDescuento + gastosEnvio;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Total pedido", 400, endY);
    doc.text(formatMoney(totalPedido), 540, endY, { align: "right" });

    let ty = endY + 16;

    if (descuentoPct > 0) {
      doc.setFont("Helvetica", "normal");
      doc.text(`Descuento (${descuentoPct}%):`, 400, ty);
      doc.text(`- ${formatMoney(montoDescuento)}`, 540, ty, {
        align: "right",
      });
      ty += 16;
    }

    if (gastosEnvio > 0) {
      doc.text("Gastos de envío:", 400, ty);
      doc.text(formatMoney(gastosEnvio), 540, ty, { align: "right" });
      ty += 16;
    }

    doc.setFont("Helvetica", "bold");
    doc.text("Total a pagar", 400, ty + 4);
    doc.text(formatMoney(totalConDescuento), 540, ty + 4, {
      align: "right",
    });

    // CAMPOS DE ENTREGA + FIRMA
    let bottomY = ty + 50;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    doc.text("Fecha de entrega: ______________________________", marginX, bottomY);
    bottomY += 20;
    doc.text(
      "Dirección de entrega: ___________________________",
      marginX,
      bottomY
    );
    bottomY += 20;
    doc.text("Notas: ________________________________________", marginX, bottomY);

    bottomY += 80;
    doc.line(350, bottomY, 530, bottomY);
    doc.text("Firma del receptor", 390, bottomY + 15);

    return doc;
  }

  async function handleDescargar(tipoDoc = "cotizacion") {
    const logo = await cargarLogo();

    // Para "orden" usamos el PDF especial de orden de compra
    const doc =
      tipoDoc === "orden"
        ? construirOrdenCompraPDF(logo)
        : construirPDF(logo, tipoDoc);

    const prefijo =
      tipoDoc === "factura"
        ? "factura"
        : tipoDoc === "orden"
        ? "orden_compra"
        : tipoDoc === "plan50"
        ? "plan_50_50"
        : "cotizacion";

    doc.save(`${prefijo}_${cotizacion.id}.pdf`);
  }

  // =============== LÓGICA DE EDICIÓN (igual que antes) ===============

  function crearLineaDesdeProducto(producto) {
    return {
      producto_id: producto?.id || null,
      categoria: producto?.categoria || "",
      modelo: producto?.modelo || "",
      descripcion: producto?.nombre || "",
      marca: producto?.marca || "",
      proveedor: producto?.proveedor || "",
      cantidad: 1,
      precio_unitario: toNumber(producto?.precio),
    };
  }

  function agregarLineaProducto() {
    if (!productos || productos.length === 0) {
      Swal.fire(
        "Sin productos",
        "No hay productos registrados para agregar.",
        "warning"
      );
      return;
    }

    const primerProducto = productos[0];

    setEditDetalle((prev) => [
      ...prev,
      crearLineaDesdeProducto(primerProducto),
    ]);
  }

  function agregarLineaManual() {
    setEditDetalle((prev) => [
      ...prev,
      {
        producto_id: null,
        categoria: "",
        modelo: "",
        descripcion: "",
        marca: "",
        proveedor: "",
        cantidad: 1,
        precio_unitario: 0,
      },
    ]);
  }

  function actualizarLinea(index, campo, valor) {
    setEditDetalle((prev) =>
      prev.map((item, i) =>
        i !== index
          ? item
          : (() => {
              if (campo === "producto_id") {
                const idProducto = Number(valor);
                if (!Number.isFinite(idProducto) || idProducto <= 0) {
                  return { ...item, producto_id: null };
                }

                const prod = productos.find((p) => p.id === idProducto);
                if (!prod) {
                  return { ...item, producto_id: idProducto };
                }

                return {
                  ...item,
                  producto_id: idProducto,
                  categoria: prod.categoria || item.categoria || "",
                  modelo: prod.modelo || item.modelo || "",
                  descripcion: prod.nombre || item.descripcion || "",
                  marca: prod.marca || item.marca || "",
                  proveedor: prod.proveedor || item.proveedor || "",
                  precio_unitario:
                    toNumber(prod.precio) || toNumber(item.precio_unitario),
                };
              }

              if (campo === "cantidad") {
                return {
                  ...item,
                  cantidad: Math.max(1, toNumber(valor) || 1),
                };
              }

              if (campo === "precio_unitario") {
                return {
                  ...item,
                  precio_unitario: Math.max(0, toNumber(valor)),
                };
              }

              return { ...item, [campo]: valor };
            })()
      )
    );
  }

  function eliminarLinea(index) {
    setEditDetalle((prev) => prev.filter((_, i) => i !== index));
  }

  async function insertarItemsCotizacionConFallback(detallesAInsertar) {
    if (!Array.isArray(detallesAInsertar) || detallesAInsertar.length === 0) {
      return { error: null, columnasRemovidas: [] };
    }

    let payload = detallesAInsertar.map((d) => ({
      cotizacion_id: Number(id),
      ...d,
    }));
    const columnasCompat = ["categoria", "modelo", "marca", "proveedor"];
    const columnasRemovidas = [];
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

  async function guardarEdicion() {
    if (!cotizacion) return;

    if (cotizacion.estado === "aceptada") {
      Swal.fire(
        "No editable",
        "No se puede editar una cotización que ya está aceptada, para no afectar el inventario.",
        "warning"
      );
      return;
    }

    if (
      editDetalle.length === 0 &&
      (!editPrecioServicio || Number(editPrecioServicio) <= 0)
    ) {
      Swal.fire(
        "Sin conceptos",
        "Debes tener al menos un producto o un servicio con precio.",
        "warning"
      );
      return;
    }

    for (const item of editDetalle) {
      if (!item.cantidad || Number(item.cantidad) <= 0) {
        Swal.fire(
          "Cantidad inválida",
          "Las cantidades deben ser mayores que cero.",
          "warning"
        );
        return;
      }
    }

    let subtotalProd = 0;
    const detallesAInsertar = [];

    for (const item of editDetalle) {
      const descripcion = String(item.descripcion || "").trim();
      const cant = Math.max(1, toNumber(item.cantidad));
      const price = Math.max(0, toNumber(item.precio_unitario));

      if (!descripcion) {
        Swal.fire(
          "Descripcion requerida",
          "Cada linea debe tener una descripcion.",
          "warning"
        );
        return;
      }

      if (price <= 0) {
        Swal.fire(
          "Precio inválido",
          "El precio unitario debe ser mayor que cero.",
          "warning"
        );
        return;
      }

      const sub = cant * price;
      subtotalProd += sub;

      detallesAInsertar.push({
        producto_id: item.producto_id || null,
        nombre_producto: descripcion,
        categoria: item.categoria?.trim() || null,
        modelo: item.modelo?.trim() || null,
        marca: item.marca?.trim() || null,
        proveedor: item.proveedor?.trim() || null,
        cantidad: cant,
        precio_unitario: price,
        subtotal: sub,
      });
    }

    const baseLocal = subtotalProd + Number(editPrecioServicio || 0);
    const descPct = Number(editDescuento || 0);
    const totalLocal = baseLocal - (baseLocal * descPct) / 100;

    if (totalLocal <= 0) {
      Swal.fire(
        "Total inválido",
        "El total calculado debe ser mayor que cero.",
        "error"
      );
      return;
    }

    const { error: errUpdateCot } = await supabase
      .from("cotizaciones")
      .update({
        nombre_servicio: editNombreServicio || null,
        precio_servicio: Number(editPrecioServicio) || 0,
        descuento: descPct,
        total: totalLocal,
      })
      .eq("id", id);

    if (errUpdateCot) {
      console.error(errUpdateCot);
      Swal.fire(
        "Error",
        "No se pudo actualizar la cabecera de la cotización.",
        "error"
      );
      return;
    }

    const [{ error: errDeleteItems }, { error: errDeleteLegacy }] =
      await Promise.all([
        supabase.from("cotizacion_items").delete().eq("cotizacion_id", id),
        supabase.from("detalle_cotizacion").delete().eq("cotizacion_id", id),
      ]);

    if (errDeleteItems || errDeleteLegacy) {
      console.error(errDeleteItems || errDeleteLegacy);
      Swal.fire(
        "Error",
        "No se pudo limpiar el detalle anterior.",
        "error"
      );
      return;
    }

    if (detallesAInsertar.length > 0) {
      const {
        error: errInsertItems,
        columnasRemovidas: columnasItemsRemovidas,
      } = await insertarItemsCotizacionConFallback(detallesAInsertar);

      if (errInsertItems) {
        console.error(errInsertItems);
        Swal.fire(
          "Error",
          "No se pudo guardar el nuevo detalle de la cotizacion.",
          "error"
        );
        return;
      }

      if (columnasItemsRemovidas.length > 0) {
        console.warn(
          `Faltan columnas en cotizacion_items (${columnasItemsRemovidas.join(
            ", "
          )}). Ejecuta las migraciones SQL.`
        );
      }

      const detalleLegacy = detallesAInsertar
        .filter((d) => d.producto_id)
        .map((d) => ({
          cotizacion_id: Number(id),
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          subtotal: d.subtotal,
        }));

      if (detalleLegacy.length > 0) {
        const { error: errInsertLegacy } = await supabase
          .from("detalle_cotizacion")
          .insert(detalleLegacy);

        if (errInsertLegacy) {
          console.error(errInsertLegacy);
          Swal.fire(
            "Error",
            "La cotizacion se actualizo, pero fallo la sincronizacion con detalle legacy.",
            "warning"
          );
        }
      }
    }

    Swal.fire("Cambios guardados", "La cotizacion fue actualizada.", "success");
    setEditMode(false);
    fetchCotizacion();
    return;

  }

  // =================================================

  return (
    <Wrapper>
      <Card>
        <Title>ORIS79E SERVICES</Title>
        <Subtitle>
          {formatearEstado(cotizacion.estado)} - #{cotizacion.id}
        </Subtitle>

        <SectionTitle>Informacion del Cliente</SectionTitle>

        <InfoRow>
          <span>
            <Strong>Cliente:</Strong>
          </span>
          <span>{clienteNombreVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Direccion:</Strong>
          </span>
          <span>{clienteDireccionVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Ciudad:</Strong>
          </span>
          <span>{clienteCiudadVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>{clienteDocumentoLabelVista}:</Strong>
          </span>
          <span>{clienteDocumentoVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Tel:</Strong>
          </span>
          <span>{clienteTelefonoVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Sector:</Strong>
          </span>
          <span>{clienteSectorVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Email:</Strong>
          </span>
          <span>{clienteEmailVista}</span>
        </InfoRow>

        <InfoRow>
          <span>
            <Strong>Servicio:</Strong>
          </span>
          <span>{cotizacion.servicio || "-"}</span>
        </InfoRow>

        {cotizacion.solicitud_id && (
          <InfoRow>
            <span>
              <Strong>Ticket vinculado:</Strong>
            </span>
            <span>#{cotizacion.solicitud_id}</span>
          </InfoRow>
        )}

        <InfoRow>
          <span>
            <Strong>Estado:</Strong>
          </span>
          <span>
            <EstadoBadge estado={cotizacion.estado || "pendiente"}>
              {formatearEstado(cotizacion.estado)}
            </EstadoBadge>
          </span>
        </InfoRow>

        {/* BOTONES ESTADO + EDITAR */}
        <ActionRow>
          <ActionChip
            onClick={() => cambiarEstado("aceptada")}
            $background="rgba(46, 204, 113, 0.2)"
            $color="#27ae60"
          >
            Aceptar
          </ActionChip>

          <ActionChip
            onClick={() => cambiarEstado("rechazada")}
            $background="rgba(231, 76, 60, 0.2)"
            $color="#c0392b"
          >
            Rechazar
          </ActionChip>

          <ActionChip
            onClick={() => cambiarEstado("pendiente")}
            $background="rgba(241, 196, 15, 0.2)"
            $color="#b7950b"
          >
            Pendiente
          </ActionChip>

          <ActionChip
            onClick={() => {
              setEditMode((prev) => !prev);
            }}
            $background="#00bcd4"
            $color="#fff"
          >
            {editMode ? "Cancelar edicion" : "Editar cotizacion"}
          </ActionChip>
        </ActionRow>

        <InfoRow>
          <span>
            <Strong>Fecha:</Strong>
          </span>
          <span>{new Date(cotizacion.fecha).toLocaleString()}</span>
        </InfoRow>

        {cotizacion.usa_anticipo && (
          <InfoRow>
            <span>
              <Strong>Banco 50/50:</Strong>
            </span>
            <span>{bancoCuenta50 || "-"}</span>
          </InfoRow>
        )}

        {cotizacion.usa_anticipo && (
          <InfoRow>
            <span>
              <Strong>Titular 50/50:</Strong>
            </span>
            <span>{titularCuenta50 || "-"}</span>
          </InfoRow>
        )}

        {cotizacion.usa_anticipo && (
          <InfoRow>
            <span>
              <Strong>Cuenta 50/50:</Strong>
            </span>
            <span>{cuentaBanco50 || "-"}</span>
          </InfoRow>
        )}

        <SectionTitle>Conceptos Cotizados</SectionTitle>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Modelo</th>
                <th>Descripcion</th>
                <th>Marca</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, i) => {
                const cantidad = Number(d.cantidad || 0);
                const subtotal = Number(d.subtotal || 0);
                const precioUnit = cantidad > 0 ? subtotal / cantidad : 0;

                return (
                  <tr key={i}>
                    <td>{d.categoria || d.producto?.categoria || "-"}</td>
                    <td>{d.modelo || d.producto?.modelo || "-"}</td>
                    <td>{getDetalleDescripcion(d)}</td>
                    <td>{d.marca || d.producto?.marca || "-"}</td>
                    <td>{d.proveedor || d.producto?.proveedor || "-"}</td>
                    <td>{cantidad}</td>
                    <td>RD${precioUnit.toFixed(2)}</td>
                    <td>RD${subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
              {servicioNum > 0 && (
                <tr>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    {cotizacion.nombre_servicio ||
                      `Servicio: ${cotizacion.servicio || "Instalación"}`}
                  </td>
                  <td>-</td>
                  <td>-</td>
                  <td>1</td>
                  <td>RD${servicioNum.toFixed(2)}</td>
                  <td>RD${servicioNum.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>

        {/* ======= BLOQUE EDICIÓN ======= */}
        {editMode && (
          <>
            <SectionTitle>Editar cotización</SectionTitle>

            <EditHint>
              Los cambios se aplican al guardar. No se permite editar cotizaciones
              aceptadas.
            </EditHint>

            <EditGroup>
              <strong>Lineas de la cotizacion:</strong>

              {editDetalle.map((item, index) => (
                <EditLine key={index}>
                  <EditField>
                    <EditFieldLabel>Producto</EditFieldLabel>
                    <BasicSelect
                      value={item.producto_id || ""}
                      onChange={(e) =>
                        actualizarLinea(index, "producto_id", e.target.value)
                      }
                    >
                      <option value="">Manual (sin producto ligado)</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.categoria || "-")} | {(p.modelo || "-")} | {p.nombre} |{" "}
                          {(p.marca || "-")} | {(p.proveedor || "-")} - RD${p.precio}
                        </option>
                      ))}
                    </BasicSelect>
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Categoria</EditFieldLabel>
                    <BasicInput
                      type="text"
                      value={item.categoria || ""}
                      onChange={(e) =>
                        actualizarLinea(index, "categoria", e.target.value)
                      }
                      placeholder="Categoria"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Modelo</EditFieldLabel>
                    <BasicInput
                      type="text"
                      value={item.modelo || ""}
                      onChange={(e) =>
                        actualizarLinea(index, "modelo", e.target.value)
                      }
                      placeholder="Modelo"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Descripcion</EditFieldLabel>
                    <BasicInput
                      type="text"
                      value={item.descripcion || ""}
                      onChange={(e) =>
                        actualizarLinea(index, "descripcion", e.target.value)
                      }
                      placeholder="Descripcion"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Marca</EditFieldLabel>
                    <BasicInput
                      type="text"
                      value={item.marca || ""}
                      onChange={(e) =>
                        actualizarLinea(index, "marca", e.target.value)
                      }
                      placeholder="Marca"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Proveedor</EditFieldLabel>
                    <BasicInput
                      type="text"
                      value={item.proveedor || ""}
                      onChange={(e) =>
                        actualizarLinea(index, "proveedor", e.target.value)
                      }
                      placeholder="Proveedor"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Cantidad</EditFieldLabel>
                    <BasicInput
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) =>
                        actualizarLinea(index, "cantidad", e.target.value)
                      }
                      placeholder="Cantidad"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Precio unitario</EditFieldLabel>
                    <BasicInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.precio_unitario}
                      onChange={(e) =>
                        actualizarLinea(index, "precio_unitario", e.target.value)
                      }
                      placeholder="Precio"
                    />
                  </EditField>

                  <EditField>
                    <EditFieldLabel>Accion</EditFieldLabel>
                    <DeleteLineButton
                      type="button"
                      onClick={() => eliminarLinea(index)}
                    >
                      Eliminar
                    </DeleteLineButton>
                  </EditField>
                </EditLine>
              ))}

              <EditLineTools>
                <AddLineButton type="button" onClick={agregarLineaProducto}>
                  + Agregar desde catalogo
                </AddLineButton>
                <AddLineButton type="button" onClick={agregarLineaManual}>
                  + Agregar linea manual
                </AddLineButton>
              </EditLineTools>
            </EditGroup>

            <EditFields>
              <div>
                <EditLabel>Descripción del servicio:</EditLabel>
                <BasicInput
                  type="text"
                  value={editNombreServicio}
                  onChange={(e) => setEditNombreServicio(e.target.value)}
                />
              </div>

              <div>
                <EditLabel>Precio del servicio:</EditLabel>
                <BasicInput
                  type="number"
                  min="0"
                  value={editPrecioServicio}
                  onChange={(e) =>
                    setEditPrecioServicio(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div>
                <EditLabel>Descuento (%):</EditLabel>
                <BasicInput
                  type="number"
                  min="0"
                  max="100"
                  value={editDescuento}
                  onChange={(e) =>
                    setEditDescuento(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </div>
            </EditFields>

            <Button onClick={guardarEdicion}>Guardar cambios</Button>
          </>
        )}

        <SectionTitle>Totales</SectionTitle>

        <TotalBox>
          <TotalRow>
            <span>Subtotal (antes de ITBIS):</span>
            <Strong>RD${base.toFixed(2)}</Strong>
          </TotalRow>

          <TotalRow>
            <span>ITBIS (18%):</span>
            <Strong>RD${itebis.toFixed(2)}</Strong>
          </TotalRow>

          <TotalRow>
            <span>Descuento:</span>
            <Strong>
              RD${descuentoMonto.toFixed(2)} ({descuentoPct}%)
            </Strong>
          </TotalRow>

          {cotizacion.usa_anticipo && (
            <>
              <TotalRow>
                <span>Inicial (50%):</span>
                <Strong>RD${inicial50.toFixed(2)}</Strong>
              </TotalRow>
              <TotalRow>
                <span>Restante (50%):</span>
                <Strong>RD${restante50.toFixed(2)}</Strong>
              </TotalRow>
              <TotalRow>
                <span>Banco:</span>
                <Strong>{bancoCuenta50 || "-"}</Strong>
              </TotalRow>
              <TotalRow>
                <span>Titular:</span>
                <Strong>{titularCuenta50 || "-"}</Strong>
              </TotalRow>
              <TotalRow>
                <span>Cuenta:</span>
                <Strong>{cuentaBanco50 || "-"}</Strong>
              </TotalRow>
            </>
          )}

          <TotalRow>
            <Strong>TOTAL:</Strong>
            <Strong>
              RD${total.toFixed(2)}
            </Strong>
          </TotalRow>
        </TotalBox>

        <SignatureBlock>
          <p style={{ marginBottom: "3rem" }}>______________________________</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Firma del cliente</p>
        </SignatureBlock>

        {/* BOTONES PDFs */}
        <PdfButtons>
          <Button onClick={() => handleDescargar("cotizacion")}>
            <Download size={18} />
            Descargar cotización (PDF)
          </Button>
          <Button onClick={() => handleDescargar("factura")}>
            <Download size={18} />
            Descargar factura (PDF)
          </Button>
          <Button onClick={() => handleDescargar("orden")}>
            <Download size={18} />
            Descargar orden de compra (PDF)
          </Button>
          <Button onClick={() => handleDescargar("plan50")}>
            <Download size={18} />
            Descargar plan 50/50 (PDF)
          </Button>
        </PdfButtons>
      </Card>
    </Wrapper>
  );
}
