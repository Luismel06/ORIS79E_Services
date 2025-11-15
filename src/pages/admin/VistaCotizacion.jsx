import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../supabase/supabase.config.jsx";
import { Download } from "lucide-react";
import Swal from "sweetalert2";

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
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
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

  th, td {
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
  gap: .5rem;

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

function formatearEstado(estado) {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function VistaCotizacion() {
  const { id } = useParams();
  const [cotizacion, setCotizacion] = useState(null);
  const [detalle, setDetalle] = useState([]);

  useEffect(() => {
    fetchCotizacion();
  }, []);

  async function fetchCotizacion() {
    const { data: cot } = await supabase
      .from("cotizaciones")
      .select("*")
      .eq("id", id)
      .single();

    setCotizacion(cot);

    const { data: det } = await supabase
      .from("detalle_cotizacion")
      .select("*")
      .eq("cotizacion_id", id);

    const { data: productosData } = await supabase
      .from("productos")
      .select("id, nombre, precio, cantidad");

    const detalleConProducto = det?.map((d) => {
      const prod = productosData.find((p) => p.id === d.producto_id);
      return { ...d, producto: prod };
    });

    setDetalle(detalleConProducto || []);
  }

  // ============================
  // 🔥 DESCONTAR INVENTARIO
  // ============================
  async function descontarInventario() {
    for (const d of detalle) {
      const prod = d.producto;
      if (!prod) continue;

      const nuevoStock = prod.cantidad - d.cantidad;

      await supabase
        .from("productos")
        .update({ cantidad: nuevoStock })
        .eq("id", prod.id);
    }
  }

  // ============================
  //  CAMBIO DE ESTADO
  // ============================
  async function cambiarEstado(nuevoEstado) {
    // ⚠️ Si ya está aceptada → no descontar nuevamente
    if (nuevoEstado === "aceptada" && cotizacion.estado === "aceptada") {
      Swal.fire("Ya aceptada", "Esta cotización ya fue aceptada anteriormente.", "info");
      return;
    }

    // ⚠️ Validar stock antes de aceptar
    if (nuevoEstado === "aceptada") {
      for (const d of detalle) {
        if (!d.producto) continue;
        if (d.cantidad > d.producto.cantidad) {
          return Swal.fire(
            "Stock insuficiente",
            `El producto "${d.producto.nombre}" solo tiene ${d.producto.cantidad} unidades disponibles.`,
            "error"
          );
        }
      }
    }

    // 1) Actualizar estado
    const { error } = await supabase
      .from("cotizaciones")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error(error);
      return Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }

    // 2) Descontar inventario SOLO si está aceptada
    if (nuevoEstado === "aceptada") {
      await descontarInventario();
      Swal.fire("Cotización aceptada", "El inventario fue actualizado.", "success");
    } else {
      Swal.fire("Estado actualizado", "", "success");
    }

    fetchCotizacion();
  }

  if (!cotizacion) return <p style={{ padding: "2rem" }}>Cargando...</p>;

  const subtotalProductos = detalle.reduce(
    (acc, d) => acc + Number(d.subtotal || 0),
    0
  );
  const servicioNum = Number(cotizacion.precio_servicio || 0);
  const subtotal = subtotalProductos + servicioNum;
  const total =
    subtotal - (subtotal * Number(cotizacion.descuento || 0)) / 100;

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

  function construirPDF(logoDataUrl) {
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const primary = "#0FA3B1";
    const dark = "#333333";
    const gray = "#555555";
    const lightGray = "#F5F5F5";

    const marginX = 40;
    let y = 50;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginX, y, 70, 70);
    }

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(dark);
    doc.text("ORIS79E SERVICES", 320, y + 15, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(gray);
    doc.text(`Cotización #${cotizacion.id}`, 320, y + 40, { align: "center" });

    y += 100;

    doc.setFillColor(lightGray);
    doc.roundedRect(marginX, y, 515, 110, 6, 6, "F");

    doc.setFontSize(12);
    doc.setTextColor(dark);

    let infoY = y + 20;
    doc.text(`Cliente:`, marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(String(cotizacion.cliente), marginX + 120, infoY);

    doc.setFont("Helvetica", "bold");
    infoY += 20;
    doc.text(`Servicio:`, marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(String(cotizacion.servicio || "-"), marginX + 120, infoY);

    infoY += 20;
    doc.setFont("Helvetica", "bold");
    doc.text(`Estado:`, marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(formatearEstado(cotizacion.estado), marginX + 120, infoY);

    infoY += 20;
    doc.setFont("Helvetica", "bold");
    doc.text(`Fecha:`, marginX + 15, infoY);
    doc.setFont("Helvetica", "normal");
    doc.text(
      new Date(cotizacion.fecha).toLocaleString(),
      marginX + 120,
      infoY
    );

    y += 130;

    const tableBody = detalle.map((d) => [
      d.producto?.nombre || "-",
      d.cantidad,
      `RD$ ${Number(d.producto?.precio || 0).toFixed(2)}`,
      `RD$ ${Number(d.subtotal || 0).toFixed(2)}`
    ]);

    if (servicioNum > 0) {
      tableBody.push([
        cotizacion.nombre_servicio ||
          `Servicio: ${cotizacion.servicio || "Instalación"}`,
        1,
        `RD$ ${servicioNum.toFixed(2)}`,
        `RD$ ${servicioNum.toFixed(2)}`
      ]);
    }

    autoTable(doc, {
      startY: y,
      head: [["Concepto", "Cant.", "Precio", "Subtotal"]],
      body: tableBody,
      theme: "striped",
      styles: {
        fontSize: 11,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: primary,
        textColor: "#FFFFFF",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#f0f8f8",
      },
    });

    const tableEnd = doc.lastAutoTable.finalY + 20;

    doc.setFillColor("#FFFFFF");
    doc.roundedRect(marginX, tableEnd, 515, 100, 6, 6, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(dark);

    let ty = tableEnd + 25;

    doc.text("Subtotal:", marginX + 20, ty);
    doc.text(`RD$ ${subtotal.toFixed(2)}`, marginX + 420, ty, {
      align: "right",
    });

    ty += 25;
    doc.text("Descuento:", marginX + 20, ty);
    doc.text(`${cotizacion.descuento}%`, marginX + 420, ty, {
      align: "right",
    });

    ty += 30;
    doc.setFontSize(16);
    doc.setTextColor(primary);
    doc.text("TOTAL:", marginX + 20, ty);
    doc.text(`RD$ ${total.toFixed(2)}`, marginX + 420, ty, {
      align: "right",
    });

    doc.setFontSize(10);
    doc.setTextColor(gray);
    doc.text("Gracias por preferir ORIS79E Services.", marginX, 750);
    doc.text("WhatsApp: +1 (829) 723-6011", marginX, 765);
    doc.text("Email: oriseservice394@gmail.com", marginX, 780);

    return doc;
  }

  async function handleDescargarPDF() {
    const logo = await cargarLogo();
    const doc = construirPDF(logo);
    doc.save(`cotizacion_${cotizacion.id}.pdf`);
  }

  return (
    <Wrapper>
      <Card>
        <Title>ORIS79E SERVICES</Title>
        <p style={{ textAlign: "center", opacity: 0.8 }}>
          Cotización #{cotizacion.id}
        </p>

        <SectionTitle>Información del Cliente</SectionTitle>

        <InfoRow>
          <span><Strong>Cliente:</Strong></span>
          <span>{cotizacion.cliente}</span>
        </InfoRow>

        <InfoRow>
          <span><Strong>Servicio:</Strong></span>
          <span>{cotizacion.servicio || "-"}</span>
        </InfoRow>

        <InfoRow>
          <span><Strong>Estado:</Strong></span>
          <span>
            <EstadoBadge estado={cotizacion.estado || "pendiente"}>
              ● {formatearEstado(cotizacion.estado)}
            </EstadoBadge>
          </span>
        </InfoRow>

        {/* -------------- BOTONES -------------- */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            onClick={() => cambiarEstado("aceptada")}
            style={{
              background: "rgba(46,204,113,0.2)",
              color: "#27ae60",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            ✔ Aceptar
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
              fontWeight: 600
            }}
          >
            ✖ Rechazar
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
              fontWeight: 600
            }}
          >
            🕒 Pendiente
          </button>
        </div>
        {/* ------------------------------------- */}

        <InfoRow>
          <span><Strong>Fecha:</Strong></span>
          <span>{new Date(cotizacion.fecha).toLocaleString()}</span>
        </InfoRow>

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
            {detalle.map((d, i) => (
              <tr key={i}>
                <td>{d.producto?.nombre || "-"}</td>
                <td>{d.cantidad}</td>
                <td>RD${Number(d.producto?.precio || 0).toFixed(2)}</td>
                <td>RD${Number(d.subtotal || 0).toFixed(2)}</td>
              </tr>
            ))}
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

        <SectionTitle>Totales</SectionTitle>

        <TotalBox>
          <TotalRow>
            <span>Subtotal:</span>
            <Strong>RD${subtotal.toFixed(2)}</Strong>
          </TotalRow>

          <TotalRow>
            <span>Descuento:</span>
            <Strong>{cotizacion.descuento}%</Strong>
          </TotalRow>

          <TotalRow>
            <span style={{ fontSize: "1.2rem" }}>TOTAL:</span>
            <Strong style={{ fontSize: "1.2rem" }}>
              RD${total.toFixed(2)}
            </Strong>
          </TotalRow>
        </TotalBox>

        <Button onClick={handleDescargarPDF}>
          <Download size={18} />
          Descargar PDF
        </Button>
      </Card>
    </Wrapper>
  );
}
