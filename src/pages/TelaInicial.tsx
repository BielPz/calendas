import Cabecalho from "../components/Cabecalho";
import { useGradiente } from "../hooks/useGradiente";
import imgComputador from "../images/computador.png";
import { useNavigate } from "react-router-dom";

function TelaInicial() {
  const navigate = useNavigate();
  const cor_fundo = useGradiente();

  return (
    <div className={`${cor_fundo} h-screen w-screen`}>
      <Cabecalho />
      <div className="h-[80%] flex items-center justify-start pl-[10%]">
        <div className="flex flex-col items-left w-120 gap-5">
          <h1 className="text-white font-bold text-5xl">
            A rede que organiza seu tempo
          </h1>
          <h2 className="text-white font-bold text-2xl">
            Clique, Agende, Resolva
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-800 dark:bg-gray-500 w-fit text-white font-bold px-4 py-3 rounded-lg cursor-pointer"
          >
            Agende seus Serviços
          </button>
        </div>
        <img
          src={imgComputador}
          alt="computador"
          className="hidden md:block w-75 h-auto ml-auto mr-[10%]"
        />
      </div>
    </div>
  );
}

export default TelaInicial;
