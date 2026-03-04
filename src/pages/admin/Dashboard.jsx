// src/pages/admin/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { supabase } from "../../supabase/supabase.config.jsx";
import {
  Award,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DollarSign,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Page = styled.section`
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

const Shell = styled.div`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  gap: clamp(0.85rem, 1.8vw, 1.15rem);
`;

const Hero = styled.header`
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: clamp(1rem, 2.5vw, 1.6rem);
  background:
    radial-gradient(circle at 90% 12%, rgba(0, 188, 212, 0.22), transparent 45%),
    radial-gradient(circle at 12% 90%, rgba(0, 188, 212, 0.1), transparent 42%),
    linear-gradient(
      145deg,
      ${({ theme }) => theme.cardBackground} 0%,
      ${({ theme }) => theme.cardBackground} 60%,
      rgba(0, 188, 212, 0.08) 100%
    );
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.08);
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const HeroCopy = styled.div`
  max-width: 760px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.26rem 0.56rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 188, 212, 0.35);
  background: rgba(0, 188, 212, 0.12);
  color: ${({ theme }) => theme.accent};
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  margin: 0.65rem 0 0;
  color: ${({ theme }) => theme.accent};
  font-size: clamp(1.22rem, 2.8vw, 2.05rem);
`;

const HeroSubtitle = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.text};
  opacity: 0.88;
  line-height: 1.45;
  max-width: 72ch;
`;

const HeroMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.55rem;
  min-width: min(100%, 460px);
`;

const MetaCard = styled.div`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  padding: 0.65rem 0.75rem;
  min-width: 0;
`;

const MetaLabel = styled.p`
  margin: 0;
  opacity: 0.72;
  font-size: 0.78rem;
`;

const MetaValue = styled.p`
  margin: 0.2rem 0 0;
  font-size: 0.89rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PrimaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryCard = styled.article`
  border-radius: 16px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === "quote" ? "rgba(0, 188, 212, 0.32)" : "rgba(0, 188, 212, 0.42)"};
  background: ${({ $tone, theme }) =>
    $tone === "quote"
      ? `linear-gradient(160deg, ${theme.cardBackground} 0%, rgba(0, 188, 212, 0.08) 100%)`
      : `linear-gradient(160deg, ${theme.cardBackground} 0%, rgba(0, 188, 212, 0.14) 100%)`};
  padding: clamp(0.9rem, 2vw, 1.2rem);
`;

const PrimaryTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
`;

const PrimaryTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.62rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 188, 212, 0.34);
  background: rgba(0, 188, 212, 0.1);
  color: ${({ theme }) => theme.accent};
  font-size: 0.76rem;
  font-weight: 700;
`;

const PrimaryValue = styled.p`
  margin: 0.75rem 0 0;
  font-size: clamp(1.25rem, 2.9vw, 2rem);
  line-height: 1.05;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  overflow-wrap: anywhere;
`;

const PrimaryHint = styled.p`
  margin: 0.45rem 0 0;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.76;
`;

const Section = styled.section`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  padding: clamp(0.85rem, 2.1vw, 1.2rem);
`;

const SectionHeader = styled.div`
  margin-bottom: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.9rem;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.accent};
`;

const SectionHint = styled.span`
  font-size: 0.82rem;
  opacity: 0.72;
`;

const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: 0.7rem;
`;

const TileCard = styled.article`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  padding: 0.78rem;
  min-height: 104px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 0.62rem;
`;

const TileIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.accent};
  background: rgba(0, 188, 212, 0.13);
  border: 1px solid rgba(0, 188, 212, 0.3);
`;

const TileContent = styled.div`
  min-width: 0;
`;

const TileLabel = styled.p`
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.74;
`;

const TileValue = styled.p`
  margin: 0.24rem 0 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  overflow-wrap: anywhere;
`;

const TileFootnote = styled.p`
  margin: 0.16rem 0 0;
  font-size: 0.78rem;
  opacity: 0.66;
`;

const AnalyticsGrid = styled.section`
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 0.9rem;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
  }
`;

const ChartPanel = styled.section`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  padding: clamp(0.85rem, 2vw, 1.2rem);
`;

const ChartHead = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const ChartTitle = styled.h3`
  margin: 0;
  font-size: 0.97rem;
  color: ${({ theme }) => theme.accent};
`;

const ChartHint = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
`;

const ChartArea = styled.div`
  width: 100%;
  height: 310px;

  @media (max-width: 600px) {
    height: 250px;
  }
`;

const ActivityPanel = styled.section`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  padding: clamp(0.85rem, 2vw, 1.2rem);
`;

const ActivityList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.58rem;
`;

const ActivityItem = styled.li`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 11px;
  background: ${({ theme }) => theme.background};
  padding: 0.72rem 0.78rem;
`;

const ActivityTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const ActivityClient = styled.strong`
  color: ${({ theme }) => theme.accent};
  font-size: 0.9rem;
`;

const ActivityDate = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
`;

const ActivityBottom = styled.div`
  margin-top: 0.42rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.18rem 0.55rem;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid
    ${({ $tone }) => {
      if ($tone === "success") return "rgba(22, 163, 74, 0.4)";
      if ($tone === "warning") return "rgba(245, 158, 11, 0.5)";
      if ($tone === "danger") return "rgba(220, 38, 38, 0.45)";
      return "rgba(100, 116, 139, 0.45)";
    }};
  background: ${({ $tone }) => {
    if ($tone === "success") return "rgba(22, 163, 74, 0.16)";
    if ($tone === "warning") return "rgba(245, 158, 11, 0.17)";
    if ($tone === "danger") return "rgba(220, 38, 38, 0.14)";
    return "rgba(100, 116, 139, 0.16)";
  }};
  color: ${({ $tone }) => {
    if ($tone === "success") return "#15803d";
    if ($tone === "warning") return "#b45309";
    if ($tone === "danger") return "#b91c1c";
    return "#475569";
  }};
`;

const ActivityText = styled.p`
  margin: 0;
  font-size: 0.84rem;
  opacity: 0.74;
`;

const Empty = styled.p`
  margin: 0;
  opacity: 0.76;
  font-size: 0.9rem;
`;

function toMoney(value) {
  return `RD$ ${Number(value || 0).toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function toCount(value) {
  return Number(value || 0).toLocaleString("es-DO");
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function stateTone(estado = "") {
  const normalized = String(estado).toLowerCase();
  if (normalized.includes("acept")) return "success";
  if (normalized.includes("pend")) return "warning";
  if (normalized.includes("rechaz") || normalized.includes("cancel")) return "danger";
  return "neutral";
}

function yAxisLabel(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${Math.round(number / 1000)}k`;
  return number.toLocaleString("es-DO");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const [stats, setStats] = useState({
    usuarios: 0,
    servicios: 0,
    productos: 0,
    solicitudes: 0,
    totalVendido: 0,
    ventasMes: 0,
    productoTop: "-",
  });

  const [statsCot, setStatsCot] = useState({
    totalCotizado: 0,
    cotizacionesMes: 0,
    pendientes: 0,
    aceptadas: 0,
    rechazadas: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/admin/login", { replace: true });
      } else {
        setUser(data.user);
        cargarDatos();
      }
    };

    checkSession();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      const [
        { count: usuarios },
        { count: servicios },
        { count: productos },
        solicitudesData,
        cotData,
        detalleVentasData,
      ] = await Promise.all([
        supabase.from("usuarios").select("*", { count: "exact", head: true }),
        supabase.from("servicios").select("*", { count: "exact", head: true }),
        supabase.from("productos").select("*", { count: "exact", head: true }),
        supabase.from("solicitudes").select("cliente, estado, fecha"),
        supabase.from("cotizaciones").select("total, estado, fecha"),
        supabase.from("productos").select("nombre, cantidad, precio"),
      ]);

      const totalVendido =
        cotData.data
          ?.filter((cotizacion) => cotizacion.estado === "aceptada")
          .reduce((acc, cotizacion) => acc + Number(cotizacion.total || 0), 0) || 0;

      const mesActual = new Date().getMonth();

      const ventasAceptadasMes =
        cotData.data?.filter(
          (cotizacion) =>
            cotizacion.estado === "aceptada" &&
            new Date(cotizacion.fecha).getMonth() === mesActual
        ) || [];

      const totalMes = ventasAceptadasMes.reduce(
        (acc, cotizacion) => acc + Number(cotizacion.total || 0),
        0
      );

      const productoTop =
        detalleVentasData.data?.reduce(
          (maximo, producto) =>
            producto.cantidad > (maximo?.cantidad || 0) ? producto : maximo,
          {}
        )?.nombre || "Sin datos";

      const estadoCounts = solicitudesData.data?.reduce((acc, solicitud) => {
        acc[solicitud.estado] = (acc[solicitud.estado] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.entries(estadoCounts || {}).map(
        ([estado, cantidad]) => ({ estado, cantidad })
      );

      const totalCotizado =
        cotData.data?.reduce(
          (acc, cotizacion) => acc + Number(cotizacion.total || 0),
          0
        ) || 0;

      const cotizacionesMes =
        cotData.data?.filter(
          (cotizacion) => new Date(cotizacion.fecha).getMonth() === mesActual
        ).length || 0;

      const pendientes =
        cotData.data?.filter((cotizacion) => cotizacion.estado === "pendiente")
          .length || 0;

      const aceptadas =
        cotData.data?.filter((cotizacion) => cotizacion.estado === "aceptada")
          .length || 0;

      const rechazadas =
        cotData.data?.filter((cotizacion) => cotizacion.estado === "rechazada")
          .length || 0;

      setStatsCot({
        totalCotizado,
        cotizacionesMes,
        pendientes,
        aceptadas,
        rechazadas,
      });

      const ventasPorMes = Array(12).fill(0);
      cotData.data?.forEach((venta) => {
        const mes = new Date(venta.fecha).getMonth();
        ventasPorMes[mes] += Number(venta.total || 0);
      });

      const ventasMensualesData = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ].map((mes, index) => ({
        mes,
        total: ventasPorMes[index],
      }));

      const actividadesRecientes = solicitudesData.data
        ?.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)
        .map((solicitud) => ({
          cliente: solicitud.cliente,
          estado: solicitud.estado,
          fecha: solicitud.fecha,
        }));

      setStats({
        usuarios,
        servicios,
        productos,
        solicitudes: solicitudesData.data?.length || 0,
        totalVendido,
        ventasMes: totalMes,
        productoTop,
      });

      setChartData(formattedData);
      setVentasMensuales(ventasMensualesData);
      setActividades(actividadesRecientes || []);
      setLastSync(new Date());
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const tasaAceptacion = useMemo(() => {
    const total = statsCot.aceptadas + statsCot.pendientes + statsCot.rechazadas;
    if (!total) return 0;
    return Math.round((statsCot.aceptadas / total) * 100);
  }, [statsCot]);

  const metricCards = useMemo(
    () => [
      {
        id: "usuarios",
        label: "Usuarios",
        value: toCount(stats.usuarios),
        footnote: "cuentas activas",
        icon: Users,
      },
      {
        id: "servicios",
        label: "Servicios",
        value: toCount(stats.servicios),
        footnote: "servicios disponibles",
        icon: Wrench,
      },
      {
        id: "productos",
        label: "Productos",
        value: toCount(stats.productos),
        footnote: "productos registrados",
        icon: Boxes,
      },
      {
        id: "solicitudes",
        label: "Solicitudes",
        value: toCount(stats.solicitudes),
        footnote: "tickets creados",
        icon: ClipboardList,
      },
      {
        id: "ventas-mes",
        label: "Ventas del Mes",
        value: toMoney(stats.ventasMes),
        footnote: "solo cotizaciones aceptadas",
        icon: TrendingUp,
      },
      {
        id: "cot-mes",
        label: "Cotizaciones Mes",
        value: toCount(statsCot.cotizacionesMes),
        footnote: "ciclo comercial actual",
        icon: DollarSign,
      },
      {
        id: "pendientes",
        label: "Pendientes",
        value: toCount(statsCot.pendientes),
        footnote: "por seguimiento",
        icon: Clock3,
      },
      {
        id: "rechazadas",
        label: "Rechazadas",
        value: toCount(statsCot.rechazadas),
        footnote: "requieren revisión",
        icon: XCircle,
      },
      {
        id: "top",
        label: "Producto Top",
        value: stats.productoTop || "Sin datos",
        footnote: "mayor volumen actual",
        icon: Award,
      },
    ],
    [stats, statsCot]
  );

  return (
    <Page>
      <Shell>
        <Hero>
          <HeroTop>
            <HeroCopy>
              <HeroBadge>Panel Administrador</HeroBadge>
              <HeroTitle>Dashboard Comercial</HeroTitle>
              <HeroSubtitle>
                Vista consolidada de ventas, cotizaciones y actividad operativa.
                Esta versión prioriza lectura rápida y una navegación clara desde
                móvil y escritorio.
              </HeroSubtitle>
            </HeroCopy>

            <HeroMetaGrid>
              <MetaCard>
                <MetaLabel>Usuario activo</MetaLabel>
                <MetaValue>{user?.email || "-"}</MetaValue>
              </MetaCard>
              <MetaCard>
                <MetaLabel>Última actualización</MetaLabel>
                <MetaValue>{formatDateTime(lastSync)}</MetaValue>
              </MetaCard>
              <MetaCard>
                <MetaLabel>Tasa de aceptación</MetaLabel>
                <MetaValue>{tasaAceptacion}%</MetaValue>
              </MetaCard>
            </HeroMetaGrid>
          </HeroTop>
        </Hero>

        <PrimaryGrid>
          <PrimaryCard>
            <PrimaryTop>
              <PrimaryTag>
                <CheckCircle2 size={14} />
                Ventas confirmadas
              </PrimaryTag>
            </PrimaryTop>
            <PrimaryValue>{toMoney(stats.totalVendido)}</PrimaryValue>
            <PrimaryHint>
              {toCount(statsCot.aceptadas)} cotizaciones aceptadas en total
            </PrimaryHint>
          </PrimaryCard>

          <PrimaryCard $tone="quote">
            <PrimaryTop>
              <PrimaryTag>
                <DollarSign size={14} />
                Cotizaciones emitidas
              </PrimaryTag>
            </PrimaryTop>
            <PrimaryValue>{toMoney(statsCot.totalCotizado)}</PrimaryValue>
            <PrimaryHint>
              {toCount(statsCot.pendientes)} pendientes y {toCount(statsCot.rechazadas)}{" "}
              rechazadas por trabajar
            </PrimaryHint>
          </PrimaryCard>
        </PrimaryGrid>

        <Section>
          <SectionHeader>
            <SectionTitle>Resumen operativo</SectionTitle>
            <SectionHint>Indicadores clave del negocio</SectionHint>
          </SectionHeader>

          <TileGrid>
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <TileCard key={card.id}>
                  <TileIcon>
                    <Icon size={16} />
                  </TileIcon>
                  <TileContent>
                    <TileLabel>{card.label}</TileLabel>
                    <TileValue title={card.value}>{card.value}</TileValue>
                    <TileFootnote>{card.footnote}</TileFootnote>
                  </TileContent>
                </TileCard>
              );
            })}
          </TileGrid>
        </Section>

        <AnalyticsGrid>
          <ChartPanel>
            <ChartHead>
              <ChartTitle>Ventas Mensuales</ChartTitle>
              <ChartHint>Evolución acumulada del año</ChartHint>
            </ChartHead>
            <ChartArea>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7dce2" />
                  <XAxis dataKey="mes" stroke="#8793a1" />
                  <YAxis stroke="#8793a1" tickFormatter={yAxisLabel} />
                  <Tooltip
                    formatter={(value) => toMoney(value)}
                    contentStyle={{ borderRadius: 10, border: "1px solid #d7dce2" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#00bcd4"
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: "#00bcd4" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartArea>
          </ChartPanel>

          <ChartPanel>
            <ChartHead>
              <ChartTitle>Estado de Solicitudes</ChartTitle>
              <ChartHint>Distribución por estado actual</ChartHint>
            </ChartHead>
            <ChartArea>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7dce2" />
                  <XAxis dataKey="estado" stroke="#8793a1" />
                  <YAxis allowDecimals={false} stroke="#8793a1" />
                  <Tooltip
                    formatter={(value) => `${value} registro(s)`}
                    contentStyle={{ borderRadius: 10, border: "1px solid #d7dce2" }}
                  />
                  <Bar dataKey="cantidad" fill="#00bcd4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartArea>
          </ChartPanel>
        </AnalyticsGrid>

        <ActivityPanel>
          <SectionHeader>
            <SectionTitle>Actividad reciente</SectionTitle>
            <SectionHint>Últimas 5 solicitudes</SectionHint>
          </SectionHeader>

          {actividades?.length > 0 ? (
            <ActivityList>
              {actividades.map((actividad, index) => (
                <ActivityItem key={`${actividad.cliente}-${index}`}>
                  <ActivityTop>
                    <ActivityClient>
                      {actividad.cliente || "Cliente sin nombre"}
                    </ActivityClient>
                    <ActivityDate>{formatDateTime(actividad.fecha)}</ActivityDate>
                  </ActivityTop>
                  <ActivityBottom>
                    <StatusBadge $tone={stateTone(actividad.estado)}>
                      {actividad.estado || "Sin estado"}
                    </StatusBadge>
                    <ActivityText>Seguimiento generado desde tickets.</ActivityText>
                  </ActivityBottom>
                </ActivityItem>
              ))}
            </ActivityList>
          ) : (
            <Empty>No hay registros recientes.</Empty>
          )}
        </ActivityPanel>
      </Shell>
    </Page>
  );
}
