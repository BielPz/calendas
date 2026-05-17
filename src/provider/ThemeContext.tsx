import { createContext, useContext, useEffect, useState } from "react";

// Interface para definir o tipo do contexto de tema
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Contexto para gerenciar o tema (claro/escuro) da aplicação
const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// Componente provedor do tema, que envolve a aplicação e fornece o estado do tema
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const temaSalvo = localStorage.getItem("tema");
    if (temaSalvo) return temaSalvo === "dark";
    return false;
  });

  // Efeito colateral para aplicar a classe de tema ao elemento raiz e armazenar a preferência do usuário no localStorage
  useEffect(() => {
    console.log("darkMode:", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("tema", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Função para alternar entre os modos claro e escuro
  return (
    <ThemeContext.Provider
      value={{ darkMode, toggleDarkMode: () => setDarkMode((prev) => !prev) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
