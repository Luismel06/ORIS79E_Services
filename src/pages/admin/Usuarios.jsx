import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import {
  CalendarDays,
  Mail,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  Wrench,
} from "lucide-react";
import {
  insertarUsuario,
  mostrarUsuarios,
  eliminarUsuario,
} from "../../supabase/crudUsuarios";

const Page = styled.section`
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
  display: grid;
  gap: 0.9rem;
`;

const Hero = styled.header`
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: clamp(0.95rem, 2.2vw, 1.35rem);
  background:
    radial-gradient(circle at 92% 8%, rgba(0, 188, 212, 0.2), transparent 46%),
    linear-gradient(
      150deg,
      ${({ theme }) => theme.cardBackground} 0%,
      ${({ theme }) => theme.cardBackground} 56%,
      rgba(0, 188, 212, 0.08) 100%
    );
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.12rem, 2.5vw, 1.6rem);
  color: ${({ theme }) => theme.accent};
`;

const HeroText = styled.p`
  margin: 0.38rem 0 0;
  opacity: 0.82;
  max-width: 70ch;
  line-height: 1.42;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(115px, 1fr));
  gap: 0.5rem;
  min-width: min(100%, 410px);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  padding: 0.52rem 0.62rem;
`;

const StatLabel = styled.p`
  margin: 0;
  opacity: 0.72;
  font-size: 0.76rem;
`;

const StatValue = styled.p`
  margin: 0.2rem 0 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(280px, 350px) minmax(0, 1fr);
  gap: 0.9rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBackground};
  padding: clamp(0.85rem, 2.1vw, 1.25rem);
`;

const CardHead = styled.div`
  margin-bottom: 0.8rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.02rem;
  color: ${({ theme }) => theme.accent};
`;

const CardHint = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.84rem;
  opacity: 0.75;
`;

const Field = styled.div`
  margin-bottom: 0.6rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.84rem;
  font-weight: 600;
`;

const BaseInput = styled.input`
  width: 100%;
  min-width: 0;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 0.62rem 0.72rem;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.16);
  }
`;

const Select = styled.select`
  width: 100%;
  min-width: 0;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 0.62rem 0.72rem;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.16);
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 0.74rem 0.95rem;
  background: ${({ theme }) => theme.accent};
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  transition: 0.2s;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 0.55rem;
  margin-bottom: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  padding: 0 0.65rem;
`;

const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  padding: 0.62rem 0;
  font-size: 0.9rem;

  &:focus {
    outline: none;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;

  @media (max-width: 860px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;

  th,
  td {
    padding: 0.72rem 0.68rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    font-size: 0.88rem;
  }

  th {
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.accent};
    font-weight: 700;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody tr:hover {
    background: rgba(0, 188, 212, 0.06);
  }
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.76rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.2rem 0.52rem;
  border: 1px solid
    ${({ $role }) =>
      $role === "admin" ? "rgba(0, 188, 212, 0.5)" : "rgba(100, 116, 139, 0.45)"};
  background: ${({ $role }) =>
    $role === "admin" ? "rgba(0, 188, 212, 0.14)" : "rgba(100, 116, 139, 0.16)"};
  color: ${({ $role }) => ($role === "admin" ? "#008496" : "#475569")};
`;

const DeleteButton = styled.button`
  border: 1px solid rgba(220, 38, 38, 0.35);
  color: #c62828;
  background: rgba(220, 38, 38, 0.08);
  border-radius: 8px;
  padding: 0.38rem 0.52rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(220, 38, 38, 0.15);
  }
`;

const MobileList = styled.div`
  display: none;

  @media (max-width: 860px) {
    display: grid;
    gap: 0.6rem;
  }
`;

const MobileCard = styled.article`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.background};
  padding: 0.72rem;
`;

const MobileTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const MobileName = styled.strong`
  color: ${({ theme }) => theme.accent};
  font-size: 0.92rem;
`;

const MobileRows = styled.div`
  display: grid;
  gap: 0.35rem;
  margin-top: 0.55rem;
`;

const MobileRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  font-size: 0.86rem;

  span:first-child {
    opacity: 0.72;
  }

  span:last-child {
    text-align: right;
    word-break: break-word;
  }
`;

const Empty = styled.div`
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.1rem;
  text-align: center;
  opacity: 0.78;
  font-size: 0.9rem;
`;

function normalizeRole(rol = "") {
  const raw = String(rol || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (raw === "admin" || raw === "administrador") return "admin";
  if (raw === "tecnico" || raw === "tecnica") return "tecnico";
  return "otro";
}

function roleLabel(rol = "") {
  const normalized = normalizeRole(rol);
  if (normalized === "admin") return "Administrador";
  if (normalized === "tecnico") return "Tecnico";
  return rol || "Sin rol";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Usuarios() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("tecnico");
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");

  const fetchUsuarios = async () => {
    const data = await mostrarUsuarios();
    setUsuarios(data || []);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const admins = usuarios.filter((u) => normalizeRole(u.rol) === "admin").length;
    const tecnicos = usuarios.filter(
      (u) => normalizeRole(u.rol) === "tecnico"
    ).length;
    return { total, admins, tecnicos };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (usuarios || []).filter((u) => {
      const role = normalizeRole(u.rol);
      const byRole = roleFilter === "todos" ? true : role === roleFilter;
      if (!byRole) return false;
      if (!term) return true;

      return (
        String(u.nombre || "").toLowerCase().includes(term) ||
        String(u.email || "").toLowerCase().includes(term) ||
        String(roleLabel(u.rol)).toLowerCase().includes(term)
      );
    });
  }, [usuarios, search, roleFilter]);

  const handleCrearEmpleado = async () => {
    if (!nombre.trim() || !email.trim()) {
      Swal.fire("Campos incompletos", "Rellena todos los campos.", "warning");
      return;
    }

    try {
      await insertarUsuario({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol,
        creado_en: new Date().toISOString(),
      });

      Swal.fire("Usuario creado", "El nuevo usuario fue agregado.", "success");
      setNombre("");
      setEmail("");
      setRol("tecnico");
      fetchUsuarios();
    } catch (error) {
      Swal.fire("Error", "No se pudo crear el usuario.", "error");
      console.error(error);
    }
  };

  const handleEliminar = async (id, nombreUsuario) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: `¿Seguro que quieres eliminar a "${nombreUsuario}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53935",
      cancelButtonColor: "#9e9e9e",
    });

    if (confirm.isConfirmed) {
      try {
        await eliminarUsuario(id);
        Swal.fire("Eliminado", "Usuario eliminado correctamente.", "success");
        fetchUsuarios();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  return (
    <Page>
      <Hero>
        <HeroTop>
          <div>
            <HeroTitle>Gestion de usuarios</HeroTitle>
            <HeroText>
              Administra accesos del equipo con un panel mas claro: crea cuentas,
              filtra por rol y consulta rapidamente el estado actual de usuarios.
            </HeroText>
          </div>

          <StatGrid>
            <StatCard>
              <StatLabel>Total usuarios</StatLabel>
              <StatValue>{stats.total}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Administradores</StatLabel>
              <StatValue>{stats.admins}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Tecnicos</StatLabel>
              <StatValue>{stats.tecnicos}</StatValue>
            </StatCard>
          </StatGrid>
        </HeroTop>
      </Hero>

      <ContentGrid>
        <Card>
          <CardHead>
            <CardTitle>Agregar Usuario</CardTitle>
            <CardHint>Crea nuevos accesos para el equipo.</CardHint>
          </CardHead>

          <Field>
            <Label>Nombre completo</Label>
            <BaseInput
              placeholder="Ej: Juan Perez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Field>

          <Field>
            <Label>Correo electronico</Label>
            <BaseInput
              type="email"
              placeholder="Ej: juanperez@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <Label>Rol</Label>
            <Select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="tecnico">Tecnico</option>
              <option value="administrador">Administrador</option>
            </Select>
          </Field>

          <PrimaryButton onClick={handleCrearEmpleado}>
            <UserPlus size={18} />
            Crear usuario
          </PrimaryButton>
        </Card>

        <Card>
          <CardHead>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardHint>
              {usuariosFiltrados.length} resultado(s) de {usuarios.length}
            </CardHint>
          </CardHead>

          <Toolbar>
            <SearchBox>
              <Search size={16} />
              <SearchInput
                placeholder="Buscar por nombre, email o rol"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchBox>

            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filtrar por rol"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="tecnico">Tecnicos</option>
            </Select>
          </Toolbar>

          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((u) => {
                    const role = normalizeRole(u.rol);
                    return (
                      <tr key={u.id}>
                        <td>
                          <UserCell>
                            <UsersIcon size={16} />
                            <strong>{u.nombre || "-"}</strong>
                          </UserCell>
                        </td>
                        <td>{u.email || "-"}</td>
                        <td>
                          <RoleBadge $role={role}>
                            {role === "admin" ? (
                              <Shield size={13} />
                            ) : (
                              <Wrench size={13} />
                            )}
                            {roleLabel(u.rol)}
                          </RoleBadge>
                        </td>
                        <td>{formatDate(u.creado_en)}</td>
                        <td>
                          <DeleteButton
                            onClick={() => handleEliminar(u.id, u.nombre)}
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </DeleteButton>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">
                      <Empty>No hay usuarios que coincidan con el filtro.</Empty>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrap>

          <MobileList>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((u) => {
                const role = normalizeRole(u.rol);
                return (
                  <MobileCard key={u.id}>
                    <MobileTop>
                      <MobileName>{u.nombre || "-"}</MobileName>
                      <RoleBadge $role={role}>{roleLabel(u.rol)}</RoleBadge>
                    </MobileTop>

                    <MobileRows>
                      <MobileRow>
                        <span>
                          <Mail size={14} style={{ verticalAlign: "middle" }} /> Email
                        </span>
                        <span>{u.email || "-"}</span>
                      </MobileRow>
                      <MobileRow>
                        <span>
                          <CalendarDays size={14} style={{ verticalAlign: "middle" }} />{" "}
                          Fecha
                        </span>
                        <span>{formatDate(u.creado_en)}</span>
                      </MobileRow>
                    </MobileRows>

                    <DeleteButton
                      onClick={() => handleEliminar(u.id, u.nombre)}
                      title="Eliminar usuario"
                      style={{ marginTop: "0.6rem", width: "100%" }}
                    >
                      <Trash2 size={16} />
                    </DeleteButton>
                  </MobileCard>
                );
              })
            ) : (
              <Empty>No hay usuarios que coincidan con el filtro.</Empty>
            )}
          </MobileList>
        </Card>
      </ContentGrid>
    </Page>
  );
}
