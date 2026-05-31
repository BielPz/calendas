import { useState } from "react";
import CabecalhoBranco from "../components/CabecalhoBranco";
import CadastroPrestador from "../components/cadastro/CadastroPrestador";
import CadastroCliente from "../components/cadastro/CadastroCliente";
import { Link } from "react-router-dom";

function TelaCadastro() {
  const [tipo, setTipo] = useState<"cliente" | "prestador">("cliente");

  return (
    <div className="flex flex-col items-center justify-start min-h-screen dark:bg-zinc-900">
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

        <div className="border-t border-gray-300 dark:border-gray-700 my-3" />
        <p className="text-start text-m mb-10 dark:text-gray-300">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="text-blue-700 dark:text-blue-400 dark:hover:text-blue-50 hover:text-black transition-colors duration-200 font-semibold"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TelaCadastro;
