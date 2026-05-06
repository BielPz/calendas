import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getTipoUsuario } from "../firebase/auth";
import { getEmpresasDoPrestador, getTodosServicos } from "../firebase/database";
import DisplayServicos from "../components/prestador/DisplayServicos";
import ServicoItem from "../components/cliente/ServicoItem";
import type { Servico } from "../firebase/types";
import { getAuth } from "firebase/auth";
import SideBarCliente from "../components/cliente/SideBarCliente";
import SideBarPrestador from "../components/prestador/SideBarPrestador";
import { useAlerta } from "../provider/AlertContext";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

interface Props {
  cor_fundo: string;
}

function TelaFeed({ cor_fundo }: Props) {
  const [usuario, setUsuario] = useState<"cliente" | "prestador" | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [idEmpresaAtiva, setIdEmpresaAtiva] = useState("");
  const [servicos, setServicos] = useState<Servico[]>([]);

  const { showAlerta } = useAlerta();
  const navigate = useNavigate();

  useEffect(() => {
    getTipoUsuario()
      .then((tipo) => {
        setUsuario(tipo);
        const auth = getAuth();
        setNomeUsuario(auth.currentUser?.displayName || "");
        if (tipo === "cliente") {
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
  }, []);

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


  if (!usuario) return <p>Carregando...</p>;

  return (
    <div
      className={`${cor_fundo} h-screen w-full flex flex-col overflow-hidden`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex flex-col grow w-full items-center overflow-hidden">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow overflow-hidden">
          {/* Barra de pesquisa */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
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
            {usuario === "prestador" && (
              <select
                value={idEmpresaAtiva}
                onChange={(e) => setIdEmpresaAtiva(e.target.value)}
                className="bg-white p-3 rounded-lg border border-gray-300 focus:outline-none sm:w-48 w-full"
              >
                <option value="">Selecione a empresa...</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Barra horizontal de ícones — só mobile */}
          {usuario === "cliente" && (
            <div className="md:hidden shrink-0">
              <SideBarCliente />
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
              <div className="hidden md:block bg-white md:w-1/5 p-3 rounded-lg shrink-0">
                <SideBarCliente />
              </div>
            )}
            {usuario === "prestador" && (
              <div className="hidden md:block bg-white md:w-1/5 p-3 rounded-lg shrink-0">
                <SideBarPrestador />
              </div>
            )}

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              {usuario === "prestador" && (
                <div className="bg-white p-3 rounded-lg overflow-x-auto shrink-0">
                  <DisplayServicos idEmpresa={idEmpresaAtiva} />
                </div>
              )}
              <div className="bg-white p-3 rounded-lg overflow-y-auto flex-1 min-h-0">
                {usuario === "cliente" && (
                  <div className="flex flex-col gap-3">
                    {servicos.map((servico) => (
                      <ServicoItem key={servico.id} servico={servico} />
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
