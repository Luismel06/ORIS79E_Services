import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// === ESTILOS ===
const Card = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 2rem;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 18px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  background: #000;
  height: 380px;
  overflow: hidden;
  touch-action: pan-y;
`;

const Slide = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  transition: opacity 0.4s ease;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.45);
  color: white;
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  z-index: 5;
  transition: 0.2s;

  &:hover {
    background: rgba(0,0,0,0.7);
  }

  ${({ $left }) => $left && `left: 10px;`}
  ${({ $right }) => $right && `right: 10px;`}
`;

const Indicators = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.border};
    &.active {
      background: ${({ theme }) => theme.accent};
    }
  }
`;

const Content = styled.div`
  padding: 1.2rem 1.4rem;
  text-align: left;

  h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.accent};
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.text};
    line-height: 1.4;
  }

  small {
    margin-top: 0.8rem;
    display: inline-block;
    opacity: 0.7;
    font-size: 0.82rem;
  }
`;

// === COMPONENTE ===
export default function PublicacionCard({
  titulo,
  descripcion,
  fecha,
  imagenes_publicacion,
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const endX = useRef(0);
  const imagenes = imagenes_publicacion?.map((i) => i.url) || [];
  // 🌀 Slider automático cada 3 segundos
useEffect(() => {
  if (imagenes.length <= 1) return; // No autodeslizar si solo hay 1 imagen

  const interval = setInterval(() => {
    setIndex((prev) => (prev + 1) % imagenes.length);
  }, 3000);

  return () => clearInterval(interval);
}, [imagenes.length]);

  const fechaFormateada = new Date(fecha).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const next = () => setIndex((prev) => (prev + 1) % imagenes.length);
  const prev = () => setIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);

  // Swipe táctil
  const touchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const touchMove = (e) => {
    endX.current = e.touches[0].clientX;
  };
  const touchEnd = () => {
    const diff = endX.current - startX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) prev();
      else next();
    }
  };

  if (!imagenes.length) return null;

  return (
    <Card>
      {/* IMAGEN estilo Instagram */}
      <ImageWrapper
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={touchEnd}
      >
        {imagenes.map((url, i) => (
          <Slide key={i} src={url} $active={i === index} />
        ))}

        {imagenes.length > 1 && (
          <>
            <ArrowButton $left onClick={prev}>
              <ChevronLeft size={22} />
            </ArrowButton>
            <ArrowButton $right onClick={next}>
              <ChevronRight size={22} />
            </ArrowButton>
          </>
        )}
      </ImageWrapper>

      {/* Indicadores tipo Instagram */}
      {imagenes.length > 1 && (
        <Indicators>
          {imagenes.map((_, i) => (
            <span key={i} className={i === index ? "active" : ""} />
          ))}
        </Indicators>
      )}

      {/* Contenido */}
      <Content>
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
        <small>{fechaFormateada}</small>
      </Content>
    </Card>
  );
}
