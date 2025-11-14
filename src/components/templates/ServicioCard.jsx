import styled from "styled-components";

const Card = styled.div`
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1.5rem;
  width: 100%;
  max-width: 340px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, background 0.3s ease;

  &:hover {
    transform: scale(1.03);
    border-color: ${({ theme }) => theme.accent};
  }

  h3 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  span {
    display: inline-block;
    margin-top: 0.7rem;
    font-weight: 600;
    color: ${({ theme }) => theme.accent};
  }
`;

export default function ServicioCard({ nombre, descripcion, precio }) {
  return (
    <Card>
      <h3>{nombre}</h3>
      <p>{descripcion}</p>
      <span>RD${precio}</span>
    </Card>
  );
}
