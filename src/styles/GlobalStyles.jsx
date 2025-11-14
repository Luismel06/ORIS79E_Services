import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  mode: "light",
  background: "#f5f7fb",
  text: "#0b1b2b",
  cardBackground: "#fff",
  accent: "#00bcd4",
  border: "rgba(0,0,0,0.15)",
};

export const darkTheme = {
  mode: "dark",
  background: "#0c0f14",
  text: "#e4eaf0",
  cardBackground: "#0f1620",
  accent: "#00bcd4",
  border: "rgba(255,255,255,0.12)",
};

export const device = {
  mobile: "(max-width: 600px)",
  tablet: "(max-width: 900px)",
  laptop: "(max-width: 1200px)",
};


export const GlobalStyles = createGlobalStyle`
  /* 🧱 Reset y configuración base */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

 body {
  margin: 0;
  padding: 0;
  font-family: "Inter", sans-serif;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  transition: background-color 0.25s, color 0.25s;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Inter", sans-serif;
  font-weight: 700;
}


  a {
    color: ${({ theme }) => theme.text};
    text-decoration: none;
  }

  ::selection {
    background-color: ${({ theme }) => theme.accent};
    color: #ffffff;
  }

  /* 🌀 Animación reutilizable (por ejemplo, para loaders) */
  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
