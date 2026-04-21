import { useState } from "react";
import Cabecalho from "../components/Cabecalho";
import EsqueciSenha1 from "../components/login/EsqueciSenha1";
import EsqueciSenha2 from "../components/login/EsqueciSenha2";
import EsqueciSenha3 from "../components/login/EsqueciSenha3";
interface Props {
  cor_fundo: string;
}

function TelaEsqueciSenha({ cor_fundo }: Props) {
  const [etapa, setEtapa] = useState(1);

  function handleContinuar(etapa: number) {
    setEtapa(etapa);
  }

  return (
    <div
      className={`${cor_fundo} min-h-screen w-full flex flex-col items-center justify-start`}
    >
      <Cabecalho />
      <div className="min-w-[300px] relative flex flex-col items-center gap-6 justify-center py-10 px-10">
        <div className={`w-full ${etapa === 1 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 1: Formulário para inserir email ou telefone */}
          <EsqueciSenha1 onClick={(etapa: number) => handleContinuar(etapa)} />
        </div>
        <div className={`w-full ${etapa === 2 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 2: Formulário para inserir código de verificação*/}
          <EsqueciSenha2 onClick={(etapa: number) => handleContinuar(etapa)} />
        </div>
        <div className={`w-full ${etapa === 3 ? "block" : "hidden"}`}>
          <EsqueciSenha3 onClick={(etapa: number) => handleContinuar(etapa)} />
        </div>
      </div>
    </div>
  );
}

export default TelaEsqueciSenha;
