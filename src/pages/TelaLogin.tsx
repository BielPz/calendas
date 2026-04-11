import { useState } from "react";
import LoginPrestador from "../components/login/LoginPrestador";
import LoginCliente from "../components/login/LoginCliente";
import CabecalhoBranco from "../components/CabecalhoBranco";
import { Link } from "react-router-dom";

function TelaLogin() {
  const [tipo, setTipo] = useState("cliente");

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CabecalhoBranco tipo={tipo} setTipo={setTipo} titulo="Fazer Login" />

      <div className="w-[45%] min-w-[300px] relative">
        <div className={`w-full ${tipo === "cliente" ? "block" : "hidden"}`}>
          <LoginCliente />
        </div>

        <div className={`w-full ${tipo === "prestador" ? "block" : "hidden"}`}>
          <LoginPrestador />
        </div>
      </div>

      <div className="w-[45%] min-w-[300px]">
        <button
          className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-br from-orange-400 to-purple-400 
                cursor-pointer mb-10"
        >
          Continuar
        </button>
        <Link
          to="/esqueci-senha"
          // Arrumar o estilo do link depois
          className="text-black text-sm font-medium
                      hover:bg-gray-800  
                      transition-colors duration-200 px-3 py-1 rounded-lg"
        >
          Esqueci a senha
        </Link>
      </div>
    </div>
  );
}

export default TelaLogin;
