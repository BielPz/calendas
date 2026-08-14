import Cabecalho from "../components/Cabecalho";
import { useGradiente } from "../hooks/useGradiente";
import imgComputador from "../images/computador.png";
import { useNavigate } from "react-router-dom";

function TelaInicial() {
  const navigate = useNavigate();
  const cor_fundo = useGradiente();

  return (
    <div className={`${cor_fundo} flex min-h-dvh w-full flex-col`}>
      <Cabecalho />
      <main className="flex flex-1 items-center px-6 py-10 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-10 md:flex-row md:gap-16">
          <div className="flex max-w-xl flex-col gap-5 text-center md:text-left">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              A rede que organiza seu tempo
            </h1>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Clique, Agende, Resolva
            </h2>
            <button
              onClick={() => navigate("/login")}
              className="ui-button-primary mx-auto w-fit font-bold md:mx-0"
            >
              Agende seus Serviços
            </button>
          </div>
          <img
            src={imgComputador}
            alt="computador"
            className="hidden h-auto w-64 shrink-0 md:block lg:w-80"
          />
        </div>
      </main>
    </div>
  );
}

export default TelaInicial;
