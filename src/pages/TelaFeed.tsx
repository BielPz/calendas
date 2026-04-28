import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getTipoUsuario } from "../firebase/auth";
import { getEmpresasDoPrestador, getTodosServicos } from "../firebase/database";
import DisplayServicos from "../components/prestador/DisplayServicos";
import ServicoItem from "../components/cliente/ServicoItem";
import type { Servico } from "../firebase/types";
import { getAuth } from "firebase/auth";
import SideBarCliente from "../components/cliente/SideBarCliente";

interface Props {
  cor_fundo: string;
}

function TelaFeed({ cor_fundo }: Props) {
  const [usuario, setUsuario] = useState<"cliente" | "prestador" | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [idEmpresaAtiva, setIdEmpresaAtiva] = useState("");
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    getTipoUsuario().then((tipo) => {
      setUsuario(tipo);
      const auth = getAuth();
      setNomeUsuario(auth.currentUser?.displayName || "");
      if (tipo === "cliente") {
        getTodosServicos().then(setServicos).catch(console.error);
      } else {
        getEmpresasDoPrestador().then((lista) => {
          setEmpresas(lista);
          if (lista.length > 0) setIdEmpresaAtiva(lista[0].id);
        }).catch(console.error);
      }
    }).catch(console.error);
  }, []);

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div className={`${cor_fundo} min-h-screen w-full flex flex-col`}>
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex flex-col grow w-full items-center">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow">

          {/* Barra de pesquisa */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Pesquisar"
              className="bg-white w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
            />
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

          {/* Barra horizontal de ícones — só mobile e só cliente */}
          {usuario === "cliente" && (
            <div className="md:hidden">
              <SideBarCliente />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 grow">
            {/* Sidebar vertical — só desktop e só cliente */}
            {usuario === "cliente" && (
              <div className="hidden md:block bg-white md:w-1/5 p-3 rounded-lg">
                <SideBarCliente />
              </div>
            )}

            <div className={`flex flex-col gap-3 w-full ${usuario === "cliente" ? "md:w-4/5" : "md:w-full"}`}>
              {usuario === "prestador" && (
                <div className="bg-white p-3 rounded-lg">
                  <DisplayServicos idEmpresa={idEmpresaAtiva} />
                </div>
              )}
              <div className="bg-white p-3 rounded-lg grow">
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