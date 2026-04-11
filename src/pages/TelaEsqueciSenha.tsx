import { useState } from "react";
import Cabecalho from "../components/Cabecalho";
import EsqueciSenha1 from "../components/login/EsqueciSenha1";
import EsqueciSenha2 from "../components/login/EsqueciSenha2";
interface Props {
  cor_fundo: string;
}

function TelaEsqueciSenha({ cor_fundo }: Props) {
  const [etapa, setEtapa] = useState(1);

  function handleContinuar() {
    setEtapa(2);
  }

  return (
    <div
      className={`${cor_fundo} min-h-screen w-full flex flex-col items-center justify-start`}
    >
      <Cabecalho />
      <div className="w-[45%] min-w-[300px] relative flex flex-col items-center py-[10%] gap-6">
        <div className={`w-full ${etapa === 1 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 1: Formulário para inserir email ou telefone */}
          <EsqueciSenha1 onClick={handleContinuar} />
        </div>
        <div className={`w-full ${etapa === 2 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 2: Formulário para inserir código de verificação*/}
          <EsqueciSenha2
            onClick={() =>
              alert("Token verificado! Redirecionando para nova senha...")
            }
          />
        </div>
      </div>
    </div>
  );
}

export default TelaEsqueciSenha;
