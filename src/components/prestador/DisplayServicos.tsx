import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServicoCard from "./ServicoCard";
import type { Servico } from "../../firebase/types";
import { getServicosDaEmpresa } from "../../features/servicos/servico.service";
import { useAlerta } from "../../provider/AlertContext";

interface DisplayProps {
  idEmpresa: string;
}

function DisplayServicos({ idEmpresa }: DisplayProps) {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const { showAlerta } = useAlerta();

  const handleNovoServico = () => {
    if (!idEmpresa) {
      showAlerta(
        "Erro",
        "Por favor, selecione uma empresa no topo da página.",
        "erro",
      );
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
    <div className="flex gap-3 overflow-x-auto pb-2">
      <div
        onClick={handleNovoServico}
        className="shrink-0 flex h-24 w-24 sm:h-32 sm:w-32 cursor-pointer items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        <span className="pb-3 text-7xl sm:text-8xl leading-0 text-gray-600 select-none">
          +
        </span>
      </div>
      {servicos.map((servico, index) => (
        <ServicoCard key={index} servico={servico} onClick={() => navigate("/cadastro-servico", { state: { idEmpresa, idServico: servico.id } })} />
      ))}
    </div>
  );
}

export default DisplayServicos;
