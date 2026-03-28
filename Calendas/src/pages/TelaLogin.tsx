import { useState } from "react";
import LoginCliente from "../../Calendas/src/components/LoginCliente";
import LoginPrestador from "../../Calendas/src/components/LoginPrestador";
import CabecalhoBranco from "../../Calendas/src/components/CabecalhoBranco";

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
                cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default TelaLogin;
