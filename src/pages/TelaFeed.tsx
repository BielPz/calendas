import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getTipoUsuario } from "../firebase/auth";
import {
  getEmpresasDoPrestador,
  getTodosServicos,
  getFavoritos,
  getAgendamentosUsuario,
} from "../firebase/database";
import DisplayServicos from "../components/prestador/DisplayServicos";
import ServicoItem from "../components/cliente/ServicoItem";
import type { Agendamento, Servico } from "../firebase/types";
import { getAuth } from "firebase/auth";
import SideBarCliente from "../components/cliente/SideBarCliente";
import SideBarPrestador from "../components/prestador/SideBarPrestador";
import { useAlerta } from "../provider/AlertContext";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import NotificacaoAgendamento from "../components/prestador/NotificacaoAgendamento";

function TelaFeed() {
  const [usuario, setUsuario] = useState<"cliente" | "prestador" | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [idEmpresaAtiva, setIdEmpresaAtiva] = useState("");
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [idsFavoritos, setIdsFavoritos] = useState<Set<string>>(new Set());
  const [agendamento, setAgendamentos] = useState<Agendamento[]>([]);

  const auth = getAuth();
  const id = auth.currentUser?.uid;

  const { showAlerta } = useAlerta();
  const navigate = useNavigate();
  const cor_fundo = useGradiente();

  useEffect(() => {
    getTipoUsuario()
      .then((tipo) => {
        setUsuario(tipo);
        setNomeUsuario(auth.currentUser?.displayName || "");
        if (tipo === "cliente") {
          getFavoritos()
            .then((ids) => setIdsFavoritos(new Set(ids)))
            .catch(console.error);
          getTodosServicos()
            .then(setServicos)
            .catch((err) => {
              console.error(err);
              showAlerta(
                "Erro",
                "Erro ao carregar serviços. Por favor, tente novamente.",
                "erro",
              );
            });
        } else {
          getEmpresasDoPrestador()
            .then((lista) => {
              setEmpresas(lista);
              if (lista.length > 0) setIdEmpresaAtiva(lista[0].id);
            })
            .catch((err) => {
              console.error(err);
              showAlerta(
                "Erro",
                "Erro ao carregar empresas do prestador. Por favor, tente novamente.",
                "erro",
              );
            });
        }
      })
      .catch((err) => {
        console.error(err);
        showAlerta(
          "Erro",
          "Erro ao carregar tipo de usuário. Por favor, faça login novamente.",
          "erro",
        );
      });
  }, [showAlerta]);

  useEffect(() => {
    const handleCtrlS = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s" && usuario === "prestador") {
        e.preventDefault(); // evita o "Salvar" padrão do browser
        navigate("/cadastro-servico");
      }
    };

    window.addEventListener("keydown", handleCtrlS);

    return () => window.removeEventListener("keydown", handleCtrlS); // cleanup
  }, [navigate, usuario]);

  const handleFavoritoChange = (idServico: string, favoritado: boolean) => {
    setIdsFavoritos((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      favoritado ? next.add(idServico) : next.delete(idServico);
      return next;
    });
  };

  // Serviços que estão nos favoritos (para passar à sidebar)
  const servicosFavoritos = servicos.filter(
    (s) => s.id && idsFavoritos.has(s.id),
  );

  useEffect(() => {
    const carregar = async () => {
      const lista = await getAgendamentosUsuario(id!);
      setAgendamentos(lista);
      console.log(agendamento);
    };
    carregar();
  }, []);

  if (!usuario) return <Loading />;

  return (
    <div
      className={`${cor_fundo} h-screen w-full flex flex-col overflow-hidden`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex flex-col grow w-full items-center overflow-hidden">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow overflow-hidden">
          {/* Barra de pesquisa */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="relative flex items-center bg-white dark:bg-zinc-800 rounded-lg border border-gray-300 dark:border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 w-full">
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
            {usuario === "prestador" && (
              <div className="flex gap-2">
                <select
                  value={idEmpresaAtiva}
                  onChange={(e) => setIdEmpresaAtiva(e.target.value)}
                  className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-300 dark:border-gray-200 focus:outline-none sm:w-48 w-full dark:text-white flex-1"
                >
                  <option value="">Selecione a empresa...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate("/cadastro-empresa")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                >
                  + Nova
                </button>
              </div>
            )}
          </div>

          {/* Barra horizontal de ícones — só mobile */}
          {usuario === "cliente" && (
            <div className="md:hidden shrink-0">
              <SideBarCliente favoritos={servicosFavoritos} />
            </div>
          )}
          {usuario === "prestador" && (
            <div className="md:hidden shrink-0">
              <SideBarPrestador />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop */}
            {usuario === "cliente" && (
              <div className="hidden md:block bg-white dark:bg-zinc-800 md:w-1/5 p-3 rounded-lg shrink-0">
                <SideBarCliente favoritos={servicosFavoritos} />
              </div>
            )}
            {usuario === "prestador" && (
              <div className="hidden md:block bg-white dark:bg-zinc-800 md:w-1/5 p-3 rounded-lg shrink-0">
                <SideBarPrestador />
              </div>
            )}

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              {usuario === "prestador" && (
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg overflow-x-auto shrink-0">
                  <DisplayServicos idEmpresa={idEmpresaAtiva} />
                </div>
              )}
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg overflow-y-auto flex-1 min-h-0">
                {usuario === "cliente" && (
                  <div className="flex flex-col gap-3">
                    {servicos.map((servico) => (
                      <ServicoItem
                        key={servico.id}
                        servico={servico}
                        favoritoInicial={
                          !!servico.id && idsFavoritos.has(servico.id)
                        }
                        onFavoritoChange={handleFavoritoChange}
                      />
                    ))}
                  </div>
                )}
                {usuario === "prestador" && idEmpresaAtiva && (
                  <div className="flex flex-col gap-3">
                    {agendamento.map((ag, i) => (
                      <NotificacaoAgendamento key={i} agendamento={ag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaFeed;
