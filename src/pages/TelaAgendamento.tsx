import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import MiniCalendario from "../components/MiniCalendario";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { Search, X } from "lucide-react";

interface Props {
  servico?: string;
  empresa?: string;
  cor_fundo: string;
}

function TelaAgendamento({ servico, empresa, cor_fundo }: Props) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const navigate = useNavigate();

  const auth = getAuth();
  useEffect(() => {
    setNomeUsuario(auth.currentUser?.displayName || "");
  }, [auth]);

  if (!nomeUsuario) return <p>Carregando...</p>;

  return (
    <div
      className={`${cor_fundo} h-screen w-full flex flex-col overflow-hidden`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex flex-col grow w-full items-center overflow-hidden">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow overflow-hidden">
          {/* Barra de pesquisa */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              className="bg-white px-4 rounded-lg border border-gray-300 focus:outline-none"
              onClick={() => navigate("/feed")}
            >
              <X size={20} strokeWidth={3} className="text-gray-500" />
            </button>
            <div className="relative flex items-center bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 w-full">
              <Search
                size={20}
                className="absolute left-3 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Pesquisar"
                className="w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Barra horizontal de ícones — só mobile */}
          <div className="md:hidden shrink-0"></div>

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop */}
            <div className="hidden md:block bg-white md:w-1/5 p-3 rounded-lg shrink-0">
              <MiniCalendario />
            </div>

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              <div className="bg-white p-3 rounded-lg overflow-y-auto flex-1 min-h-0">
                {/* Aqui é o conteúdo do calendário - timeline de horas */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaAgendamento;
