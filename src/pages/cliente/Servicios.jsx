import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import emailjs from "emailjs-com";
import { supabase } from "../../supabase/supabase.config";
import { insertarSolicitud } from "../../supabase/crudSolicitudes";

// 🎨 === ESTILOS ===
const Container = styled.section`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 6rem 1rem 4rem;
  text-align: center;
`;

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

// 🎯 === COMPONENTE PRINCIPAL ===
export default function Servicios() {
  const [tab, setTab] = useState("disponibles");
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // 🔹 Cargar servicios desde Supabase
  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("servicios").select("*");
      if (error) {
        console.error("❌ Error al cargar servicios:", error);
      } else {
        setServicios(data);
      }
      setLoading(false);
    };
    fetchServicios();
  }, []);

  // 🔄 Alternar formulario
  const toggleFormulario = (id) => {
    setServicioSeleccionado(servicioSeleccionado === id ? null : id);
  };

  // 🧾 Generar número de caso único
  const generarNumeroCaso = () =>
    "CASE-" + Math.floor(100000 + Math.random() * 900000);

  // ✉️ Enviar correo de confirmación
const enviarCorreoConfirmacion = async (nombre, email, numero_caso, servicio) => {
  try {
    await emailjs.send(
      "service_kfvhwxq", // ✅ tu Service ID
      "template_iy48pw3", // ✅ tu Template ID
      {
        nombre,
        email,
        numero_caso,
        servicio,
      },
      "yoOeYAk8XPOIvEhbf" // ✅ tu Public Key
    );
    console.log("✅ Correo enviado correctamente");
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
  }
};

// 🚀 Enviar solicitud a Supabase
const handleSubmit = async (e, s) => {
  e.preventDefault();
  const numero_caso = generarNumeroCaso();

  const cliente = e.target.cliente.value.trim();
  const email = e.target.email.value.trim();
  const telefono = e.target.telefono.value.trim();
  const descripcion = e.target.descripcion.value.trim();

  // ✅ Validar formato del email antes de continuar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Swal.fire({
      icon: "warning",
      title: "Correo electrónico no válido",
      text: "Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).",
      confirmButtonColor: "#00bcd4",
    });
    return;
  }

  const nuevaSolicitud = {
    cliente,
    email, // ✅ Guardamos email
    telefono,
    descripcion,
    servicio_id: s.id,
    estado: "Solicitud enviada",
    tecnico_asignado: "",
    chat_link: "",
    numero_caso,
  };

  try {
    await insertarSolicitud(nuevaSolicitud);

    // Enviar correo de confirmación al cliente
    await enviarCorreoConfirmacion(cliente, email, numero_caso);

    Swal.fire({
      icon: "success",
      title: "Solicitud enviada correctamente",
      html: `
        <p>Tu número de caso es:</p>
        <h3 style="color:#00bcd4; font-weight:700;">${numero_caso}</h3>
        <p>También te enviamos un correo de confirmación con los detalles.</p>
      `,
      confirmButtonColor: "#00bcd4",
    });

    e.target.reset();
    setServicioSeleccionado(null);
  } catch (error) {
    console.error("❌ Error al registrar solicitud:", error.message);
    Swal.fire({
      icon: "error",
      title: "Error al enviar la solicitud",
      text: "Por favor, intenta nuevamente más tarde.",
      confirmButtonColor: "#00bcd4",
    });
  }
};

  return (
    <Container>
      <h2 style={{ color: "#00bcd4", marginBottom: "1rem" }}>Nuestros Servicios</h2>

      <Tabs>
        <TabButton $active={tab === "disponibles"} onClick={() => setTab("disponibles")}>
          Servicios disponibles
        </TabButton>
      </Tabs>

      {loading ? (
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
                  {servicioSeleccionado === s.id ? "Cerrar formulario" : "Solicitar servicio"}
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
                    <Input name="cliente" placeholder="Tu nombre completo" required />
                    <Input name="email" type="email" placeholder="Tu correo electrónico" required />
                    <Input name="telefono" placeholder="Tu número de teléfono" required />
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
      )}
    </Container>
  );
}
