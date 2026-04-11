import { useState } from "react";
import Cabecalho from "../components/Cabecalho";
interface Props {
  cor_fundo: string;
}

function TelaEsqueciSenha({ cor_fundo }: Props) {
  const [etapa, setEtapa] = useState(1);
  return (
    <div className={`${cor_fundo} min-h-screen w-full flex flex-col`}>
      <Cabecalho />

      <div className="w-[45%] min-w-[300px] relative">
        <div className={`w-full ${etapa === 1 ? "block" : "hidden"}`}>
          /* Conteúdo da etapa 1: Formulário para inserir email ou telefone * /
        </div>

        <div className={`w-full ${etapa === 2 ? "block" : "hidden"}`}>
          /* Conteúdo da etapa 2: Formulário para inserir código de verificação
          * /
        </div>
      </div>
    </div>
  );
}

export default TelaEsqueciSenha;
