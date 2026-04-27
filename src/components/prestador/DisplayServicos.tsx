import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServicoCard from "./ServicoCard";
import type { Servico } from "../../firebase/types";
import { getServicosDaEmpresa } from "../../firebase/database";

interface DisplayProps {
  idEmpresa: string;
}

function DisplayServicos({ idEmpresa }: DisplayProps) {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Servico[]>([]);

  const handleNovoServico = () => {
    if (!idEmpresa) {
      alert("Por favor, selecione uma empresa no topo da página.");
      return;
    }
    navigate("/cadastro-servico", { state: { idEmpresa } });
  };

  useEffect(() => {
    if (!idEmpresa) return;

    async function carregar() {
        const data = await getServicosDaEmpresa(idEmpresa);
        setServicos(data);
    }

    carregar();
    }, [idEmpresa]);

  return (
    <div className="flex flex-wrap gap-4">
      <div
        onClick={handleNovoServico}
        className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        <span className="pb-3 text-8xl leading-0 text-gray-600 select-none">
          +
        </span>
      </div>

      {servicos.map((servico, index) => (
        <ServicoCard key={index} servico={servico} />
      ))}
    </div>
  );
}

export default DisplayServicos;