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
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 750px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.accent};
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
  font-size: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

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
  font-size: 1.1rem;
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
        supabase.from("productos").select("id, nombre, precio, categoria, marca, modelo"),
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

    const editDet = (detalleConProducto || [])
      .filter((d) => d.producto_id)
      .map((d) => ({
        producto_id: d.producto_id,
        cantidad: Number(d.cantidad || 0),
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
  const tieneLineasManuales = detalle.some(
    (d) => !d.producto_id && String(d.nombre_producto || "").trim() !== ""
  );

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

    const clienteNombre =
      (solicitud?.tipo_cliente === "empresa" && solicitud?.empresa_nombre) ||
      solicitud?.cliente ||
      cotizacion?.cliente ||
      "-";
    const clienteDireccion = solicitud?.direccion || "-";
    const clienteCiudad = solicitud?.ciudad || "-";
    const clienteSector = solicitud?.sector || "-";
    const clienteTelefono = solicitud?.telefono || "-";
    const clienteEmail = solicitud?.email || "-";
    const clienteDocumentoLabel =
      solicitud?.tipo_cliente === "empresa"
        ? "RNC"
        : solicitud?.tipo_cliente === "persona"
        ? "Cedula"
        : "RNC/Cedula";
    const clienteDocumento =
      solicitud?.tipo_cliente === "empresa"
        ? solicitud?.empresa_rnc || "-"
        : solicitud?.cedula || solicitud?.empresa_rnc || "-";

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
      const referencia =
        d.producto?.modelo ||
        d.modelo ||
        (d.producto_id ? `PROD-${d.producto_id}` : `ITEM-${index + 1}`);

      return {
        cantidad,
        referencia,
        descripcion: d.nombre_producto || d.producto?.nombre || "-",
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

    // Tomar datos desde la solicitud (ticket) cuando existan
const clienteNombre =
  (solicitud?.tipo_cliente === "empresa" &&
    solicitud?.empresa_nombre) ||
  solicitud?.cliente ||
  cotizacion.cliente ||
  "-";

const clienteRnc =
  (solicitud?.tipo_cliente === "empresa" && solicitud?.empresa_rnc) ||
  solicitud?.cedula ||
  solicitud?.empresa_rnc ||
  "-";

const clienteDireccion = solicitud?.direccion || "-";
const clienteTelefono = solicitud?.telefono || "-";
const clienteCorreo = solicitud?.email || "-";

const clienteLines = [
  `Nombre o razón social: ${clienteNombre}`,
  `RNC / ID: ${clienteRnc}`,
  `Dirección: ${clienteDireccion}`,
  `Teléfono: ${clienteTelefono}`,
  `Correo electrónico: ${clienteCorreo}`,
];


    const lineHeight = 14;

    proveedorLines.forEach((line, idx) => {
      doc.text(line, marginX, y + idx * lineHeight);
    });

    clienteLines.forEach((line, idx) => {
      doc.text(line, 320, y + idx * lineHeight);
    });

    const tableY = y + proveedorLines.length * lineHeight + 20;

    // TABLA DE ITEMS
    const body = detalle.map((d, index) => {
      const cantidad = Number(d.cantidad || 0);
      const subtotal = Number(d.subtotal || 0);
      const unit = cantidad > 0 ? subtotal / cantidad : 0;

      return [
        `#${d.producto_id || index + 1}`,
        d.nombre_producto || d.producto?.nombre || "-",
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
      { producto_id: primerProducto.id, cantidad: 1 },
    ]);
  }

  function actualizarLinea(index, campo, valor) {
    setEditDetalle((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]:
                campo === "cantidad"
                  ? Number(valor) < 1
                    ? 1
                    : Number(valor)
                  : valor,
            }
          : item
      )
    );
  }

  function eliminarLinea(index) {
    setEditDetalle((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardarEdicion() {
    if (!cotizacion) return;
    if (tieneLineasManuales) {
      Swal.fire(
        "Edicion limitada",
        "Esta cotizacion tiene lineas manuales. Editala desde la pantalla de creacion para evitar perder datos.",
        "warning"
      );
      return;
    }

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
      if (!item.producto_id) {
        Swal.fire(
          "Producto inválido",
          "Hay una línea sin producto seleccionado.",
          "warning"
        );
        return;
      }
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
      const prod = productos.find((p) => p.id === item.producto_id);
      const price = prod ? Number(prod.precio) : 0;
      const cant = Number(item.cantidad || 0);
      const sub = price * cant;
      subtotalProd += sub;

      detallesAInsertar.push({
        producto_id: item.producto_id,
        nombre_producto: prod?.nombre || "Producto",
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
      const { error: errInsertItems } = await supabase
        .from("cotizacion_items")
        .insert(
          detallesAInsertar.map((d) => ({
            cotizacion_id: Number(id),
            ...d,
          }))
        );

      if (errInsertItems) {
        console.error(errInsertItems);
        Swal.fire(
          "Error",
          "No se pudo guardar el nuevo detalle de la cotizacion.",
          "error"
        );
        return;
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
        <p style={{ textAlign: "center", opacity: 0.8 }}>
          {formatearEstado(cotizacion.estado)} - #{cotizacion.id}
        </p>

        <SectionTitle>Informacion del Cliente</SectionTitle>

        <InfoRow>
          <span>
            <Strong>Cliente:</Strong>
          </span>
          <span>{cotizacion.cliente}</span>
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
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => cambiarEstado("aceptada")}
            style={{
              background: "rgba(46,204,113,0.2)",
              color: "#27ae60",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Aceptar
          </button>

          <button
            onClick={() => cambiarEstado("rechazada")}
            style={{
              background: "rgba(231,76,60,0.2)",
              color: "#c0392b",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Rechazar
          </button>

          <button
            onClick={() => cambiarEstado("pendiente")}
            style={{
              background: "rgba(241,196,15,0.2)",
              color: "#b7950b",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Pendiente
          </button>

          <button
            onClick={() => {
              if (!editMode && tieneLineasManuales) {
                Swal.fire(
                  "Edicion limitada",
                  "Esta cotizacion usa conceptos manuales. Por ahora la edicion se hace desde la pantalla de creacion.",
                  "info"
                );
                return;
              }
              setEditMode((prev) => !prev);
            }}
            style={{
              background: "#00bcd4",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {editMode ? "Cancelar edicion" : "Editar cotizacion"}
          </button>
        </div>

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

        <Table>
          <thead>
            <tr>
              <th>Concepto</th>
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
                  <td>{d.nombre_producto || d.producto?.nombre || "-"}</td>
                  <td>{cantidad}</td>
                  <td>RD${precioUnit.toFixed(2)}</td>
                  <td>RD${subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
            {servicioNum > 0 && (
              <tr>
                <td>
                  {cotizacion.nombre_servicio ||
                    `Servicio: ${cotizacion.servicio || "Instalación"}`}
                </td>
                <td>1</td>
                <td>RD${servicioNum.toFixed(2)}</td>
                <td>RD${servicioNum.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* ======= BLOQUE EDICIÓN ======= */}
        {editMode && (
          <>
            <SectionTitle>Editar cotización</SectionTitle>

            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.75,
                marginBottom: "0.8rem",
              }}
            >
              Los cambios se aplican al guardar. No se permite editar cotizaciones
              aceptadas.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Productos:</strong>

              {editDetalle.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <select
                    value={item.producto_id || ""}
                    onChange={(e) =>
                      actualizarLinea(index, "producto_id", Number(e.target.value))
                    }
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - RD${p.precio}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarLinea(index, "cantidad", e.target.value)
                    }
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => eliminarLinea(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#c0392b",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={agregarLineaProducto}
                style={{
                  marginTop: "0.7rem",
                  background: "#00bcd4",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                + Agregar producto
              </button>
            </div>

            <div style={{ display: "grid", gap: "0.6rem" }}>
              <div>
                <label style={{ fontSize: "0.9rem" }}>
                  Descripción del servicio:
                </label>
                <input
                  type="text"
                  value={editNombreServicio}
                  onChange={(e) => setEditNombreServicio(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.9rem" }}>Precio del servicio:</label>
                <input
                  type="number"
                  min="0"
                  value={editPrecioServicio}
                  onChange={(e) =>
                    setEditPrecioServicio(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.9rem" }}>Descuento (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editDescuento}
                  onChange={(e) =>
                    setEditDescuento(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </div>

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
            <span style={{ fontSize: "1.2rem" }}>TOTAL:</span>
            <Strong style={{ fontSize: "1.2rem" }}>
              RD${total.toFixed(2)}
            </Strong>
          </TotalRow>
        </TotalBox>

        <div style={{ marginTop: "2rem" }}>
          <p style={{ marginBottom: "3rem" }}>______________________________</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Firma del cliente</p>
        </div>

        {/* BOTONES PDFs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
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
        </div>
      </Card>
    </Wrapper>
  );
}
