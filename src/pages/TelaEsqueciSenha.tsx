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
      <div className="min-w-[300px] relative flex flex-col items-center gap-6 justify-center py-10 px-10">
        <div className={`w-full ${etapa === 1 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 1: Formulário para inserir email ou telefone */}
          <EsqueciSenha1 onClick={handleContinuar} />
        </div>
        <div className={`w-full ${etapa === 2 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 2: Formulário para inserir código de verificação*/}
          <EsqueciSenha2
            onClick={() => {
              // Aqui você pode adicionar a lógica para verificar o token e, se for válido, avançar para a etapa 3
              setEtapa(3);
            }}
          />
        </div>
        <div className={`w-full ${etapa === 3 ? "block" : "hidden"}`}>
          {/* Conteúdo da etapa 3: Formulário para criar nova senha */}
          <p className="text-lg font-medium text-gray-700 mb-4 text-center">
            Aqui você pode criar uma nova senha para sua conta.
          </p>
          {/* Adicione os campos para nova senha e confirmação de senha aqui */}
        </div>
      </div>
    </div>
  );
}

export default TelaEsqueciSenha;
