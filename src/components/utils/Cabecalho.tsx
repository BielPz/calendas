import { useState } from "react";
import imgLogo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import imgLogout from "../images/logout.png";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/provider/ThemeContext";

interface Props {
  perfil?: boolean;
  none?: boolean;
  nome?: string;
  fotoPerfil?: string;
}

function Cabecalho({ perfil, none, nome, fotoPerfil }: Props) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    await signOut(getAuth());
    navigate("/login");
  };

  const iniciais = nome
    ? nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="w-full z-50 flex justify-center">
      <div className="w-[95%] border-b border-white flex items-center py-2 px-3">
        <img
          src={imgLogo}
          alt="logo"
          className="w-24 cursor-pointer"
          onClick={() => {
            perfil === undefined && none === undefined
              ? (window.location.href = "/")
              : navigate("/feed");
          }}
        />
        <button
          onClick={toggleDarkMode}
          className="ml-4 p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          {darkMode ? <Sun size={20} color="white" /> : <Moon size={20} />}
        </button>
        {perfil === undefined && none === undefined && (
          <div className="ml-auto flex gap-3">
            <Link
              to="/login"
              className="text-white text-sm font-medium
                        hover:bg-gray-800 dark:hover:bg-gray-600  
                        transition-colors duration-200 px-3 py-1 rounded-lg"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="text-white text-sm font-medium
                        hover:bg-gray-800 dark:hover:bg-gray-600
                        transition-colors duration-200 px-3 py-1 rounded-lg"
            >
              Cadastrar
            </Link>
          </div>
        )}

        {perfil !== undefined && (
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/perfil"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className={`flex items-center transition-all duration-300 overflow-hidden
                bg-gray-800 dark:bg-gray-600 rounded-full p-1
                ${hovered ? "gap-2" : "gap-0"}
              `}
            >
              <span
                className={`text-white text-sm font-medium whitespace-nowrap transition-all duration-300
                  ${hovered ? "max-w-40 opacity-100 pl-1" : "max-w-0 opacity-0"}
                `}
              >
                {nome || "Perfil"}
              </span>
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gray-700">
                {fotoPerfil ? (
                  <img
                    src={fotoPerfil}
                    alt="perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {iniciais}
                  </span>
                )}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className=" hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-300 w-9 h-9 hover:w-11 hover:h-11 rounded-full flex items-center justify-center"
            >
              <img src={imgLogout} alt="Sair" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cabecalho;
