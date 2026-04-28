import { useEffect, useState } from "react";
import type { Servico } from "../../firebase/types";
import { getEmpresaPorId } from "../../firebase/database";

interface Props {
  servico: Servico;
}

function ServicoItem({ servico }: Props) {
  const [nomeEmpresa, setNomeEmpresa] = useState("");

  useEffect(() => {
    if (servico.idEmpresa) {
      getEmpresaPorId(servico.idEmpresa)
        .then((empresa) => setNomeEmpresa(empresa?.nome ?? ""))
        .catch(console.error);
    }
  }, [servico.idEmpresa]);

  return (
    <div className="flex flex-col sm:flex-row w-full gap-3 mb-3 bg-gray-100 rounded overflow-hidden">
        <div className="bg-gray-200 sm:w-1/5 w-full min-h-20" />
        <div className="sm:w-4/5 w-full p-3 flex flex-col gap-1">
        <p className="font-semibold">{servico.nome}</p>
        <p className="text-sm text-gray-400">{nomeEmpresa}</p>
        <p className="text-sm text-gray-500">{servico.descricao}</p>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
            <span>R$ {servico.preco}</span>
            <span>{servico.inicio} - {servico.fim}</span>
            <span>{servico.duracao}</span>
        </div>
        </div>
    </div>
  );
}

export default ServicoItem;