import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getTipoUsuario } from "../firebase/auth";
import { getEmpresasDoPrestador } from "../firebase/database";
import DisplayServicos from "../components/prestador/DisplayServicos";

interface Props {
  cor_fundo: string;
}

function TelaFeed({ cor_fundo }: Props) {
  const [usuario, setUsuario] = useState<"cliente" | "prestador" | null>(null);
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [idEmpresaAtiva, setIdEmpresaAtiva] = useState("");

  useEffect(() => {
    getTipoUsuario().then(setUsuario).catch(console.error);
    getEmpresasDoPrestador().then((lista) => {
      setEmpresas(lista);
      // selecionar a primeira empresa automaticamente
      if (lista.length > 0) setIdEmpresaAtiva(lista[0].id);
    }).catch(console.error);
  }, []);

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div className={`${cor_fundo} min-h-screen w-full flex flex-col`}>
      <Cabecalho perfil />
      <div className="flex flex-col grow w-full items-center">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow">
          <div className="flex gap-2">
            <input
              type="text"
              className="bg-white w-full p-3 rounded-lg border border-gray-300 focus:outline-none"
            />
            {usuario === "prestador" && (
              <select 
                value={idEmpresaAtiva}
                onChange={(e) => setIdEmpresaAtiva(e.target.value)}
                className="bg-white p-3 rounded-lg border border-gray-300 focus:outline-none"
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
          <div className="flex flex-col md:flex-row gap-3 grow">
            <div className="bg-white md:w-1/5 p-3 rounded-lg"></div>
            <div className="flex flex-col gap-3 md:w-4/5">
              {usuario === "prestador" && (
                <div className="bg-white p-3 rounded-lg">
                  {/* 2. Passa o ID para o componente que contém o botão */}
                  <DisplayServicos idEmpresa={idEmpresaAtiva} />
                </div>
              )}
              <div className="bg-white p-3 rounded-lg grow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaFeed;