import { useState } from "react";
import CabecalhoBranco from "../../Calendas/src/components/CabecalhoBranco";
import CadastroCliente from "../components/CadastroRafa/CadastroCliente";
import CadastroPrestador from "../components/CadastroRafa/CadastroPrestador";

function TelaCadastroRafa() {
  const [tipo, setTipo] = useState("cliente");
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CabecalhoBranco
        tipo={tipo}
        setTipo={setTipo}
        titulo={"Fazer Cadastro"}
      />

      <div className="w-[45%] min-w-[300px] relative">
        <div className={`w-full ${tipo === "cliente" ? "block" : "hidden"}`}>
          <CadastroCliente />
        </div>

        <div className={`w-full ${tipo === "prestador" ? "block" : "hidden"}`}>
          <CadastroPrestador />
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

export default TelaCadastroRafa;
