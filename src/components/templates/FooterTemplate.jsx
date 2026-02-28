import styled from "styled-components";
import { Mail, Phone, MapPin, Instagram, X } from "lucide-react";

const TikTokIcon = ({ size = 20 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.navBackground};
  color: ${({ theme }) => theme.text};
  width: 100%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border-top: 2px solid ${({ theme }) => theme.accent};
  transition: background 0.3s ease, color 0.3s ease;
`;

const FooterTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3rem;
  text-align: center;
`;

const InfoBlock = styled.div`
  max-width: 300px;

  h3 {
    color: ${({ theme }) => theme.accent};
    margin-bottom: 0.8rem;
  }

  p,
  a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
    font-size: 0.95rem;
    line-height: 1.4;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1rem;

  a {
    color: ${({ theme }) => theme.accent};
    transition: color 0.3s, transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: ${({ theme }) => theme.text};
      transform: scale(1.1);
    }
  }
`;

const Copy = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  text-align: center;
  margin-top: 2rem;
`;

export default function FooterTemplate() {
  return (
    <FooterWrapper>
      <FooterTop>
        <InfoBlock>
          <h3>Contacto</h3>
          <p>
            <Phone size={14} /> 849-577-6011
          </p>
          <p>
            <Mail size={14} /> Oriseservice394@gmail.com
          </p>
        </InfoBlock>

        <InfoBlock>
          <h3>Dirección</h3>
          <p>
            <MapPin size={14} /> Calle Marginado Las Américas
          </p>
        </InfoBlock>

        <InfoBlock>
          <h3>Síguenos</h3>
          <SocialIcons>
            <a
              href="https://www.instagram.com/oris79e/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.tiktok.com/@oris79e"
              target="_blank"
              rel="noreferrer"
            >
              <TikTokIcon size={20} />
            </a>
            <a
              href="https://x.com/ORIS79E"
              target="_blank"
              rel="noreferrer"
            >
              <X size={20} />
            </a>

          </SocialIcons>
        </InfoBlock>
      </FooterTop>

      <Copy>
        © {new Date().getFullYear()} ORIS79E Service — Todos los derechos reservados.
      </Copy>
    </FooterWrapper>
  );
}
