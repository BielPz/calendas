import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import { getAuth } from "firebase/auth";
import MiniCalendario from "../components/MiniCalendario";
import TimelineHoras from "../components/TimeLineHoras";
import { useNavigate } from "react-router-dom";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import { getAgendamentosUsuario } from "../firebase/database";
import type { Agendamento } from "../firebase/types";

function TelaCalendario() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const navigate = useNavigate();
  const cor_fundo = useGradiente();
  const [agendamento, setAgendamentos] = useState<Agendamento[]>([]);

  const auth = getAuth();
  const id = auth.currentUser?.uid;
  useEffect(() => {
    setNomeUsuario(auth.currentUser?.displayName || "");
  }, [auth]);

  useEffect(() => {
    const carregar = async () => {
      const lista = await getAgendamentosUsuario(id!);
      setAgendamentos(lista);
      console.log(agendamento);
    };
    carregar();
  }, []);

  if (!nomeUsuario) return <Loading />;

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
              className="bg-white dark:bg-zinc-700 px-4  rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
              onClick={() => navigate("/feed")}
            >
              <X
                size={20}
                strokeWidth={3}
                className="text-gray-500 dark:text-gray-300"
              />
            </button>
            <div className="relative flex items-center bg-white dark:bg-zinc-700 rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 w-full">
              <Search
                size={20}
                className="absolute left-3 text-gray-500 dark:text-gray-300 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Pesquisar"
                className="w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none bg-transparent dark:text-white"
              />
            </div>
          </div>

          {/* Barra horizontal de ícones — só mobile */}
          <div className="md:hidden shrink-0"></div>

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop - precisa ser ajustado */}
            <div className="hidden md:block bg-white dark:bg-zinc-700 md:w-1/5 p-3 rounded-lg shrink-0">
              <MiniCalendario />
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-4 mb-2">
                Agendamentos
              </p>
              <div className="flex flex-col gap-2 overflow-auto">
                {agendamento.map((ag, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 bg-gray-50 dark:bg-zinc-600 rounded-lg p-2.5"
                  >
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {new Date(ag.data + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                        },
                      )}
                      {" às "}
                      {ag.horario}
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {ag.servico?.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              <div className="bg-white dark:bg-zinc-700 p-3 rounded-lg overflow-y-auto flex-1 min-h-0">
                {/* Aqui é o conteúdo do calendário - timeline de horas */}
                <TimelineHoras />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaCalendario;
