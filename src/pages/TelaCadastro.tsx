import { useState } from "react";
import CadastroPrestador from "../components/cadastro/CadastroPrestador";
import CadastroCliente from "../components/cadastro/CadastroCliente";
import { Link } from "react-router-dom";
import CabecalhoBranco from "@/components/utils/CabecalhoBranco";

function TelaCadastro() {
  const [tipo, setTipo] = useState<"cliente" | "prestador">("cliente");

  return (
    <div className="flex flex-col items-center justify-start min-h-screen dark:bg-zinc-900">
      <CabecalhoBranco
        tipo={tipo}
        setTipo={setTipo}
        titulo={"Fazer Cadastro"}
      />

      <div className="w-full max-w-xl px-4">
        <div className={`w-full ${tipo === "cliente" ? "block" : "hidden"}`}>
          <CadastroCliente />
        </div>

        <div className={`w-full ${tipo === "prestador" ? "block" : "hidden"}`}>
          <CadastroPrestador />
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 my-3" />
        <p className="text-start text-m mb-10 dark:text-gray-300">
          Já tem uma conta?{" "}
          <Link to="/login" className="ui-link">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TelaCadastro;
