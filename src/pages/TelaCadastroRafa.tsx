import { useState } from "react";
import CabecalhoBranco from "../components/CabecalhoBranco";
import CadastroPrestador from "./CadastroPrestador";
import CadastroUsuario from "./CadastroUsuario";

function TelaCadastroRafa() {
  const [tipo, setTipo] = useState("cliente");
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CabecalhoBranco
        tipo={tipo}
        setTipo={setTipo}
        titulo={"Fazer Cadastro"}
      />

      <div className="w-[100%] min-w-[300px] relative">
        <div className={`w-full ${tipo === "cliente" ? "block" : "hidden"}`}>
          <CadastroUsuario />
        </div>

        <div className={`w-full ${tipo === "prestador" ? "block" : "hidden"}`}>
          <CadastroPrestador />
        </div>
      </div>
    </div>
  );
}

export default TelaCadastroRafa;
