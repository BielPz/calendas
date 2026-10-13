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
    navigate("/gerenciar-servico", { state: { idEmpresa } });
  };

  useEffect(() => {
    if (!idEmpresa) {
      setServicos([]);
      return;
    }

    let ativo = true;

    async function carregar() {
      const data = await getServicosDaEmpresa(idEmpresa);
      if (ativo) setServicos(data);
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [idEmpresa]);

  return (
    <div className="flex justify-start gap-3 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={handleNovoServico}
        className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-orange-300 bg-orange-50 text-orange-700 transition-colors hover:border-orange-500 hover:bg-orange-100 dark:border-orange-400/40 dark:bg-orange-400/10 dark:text-orange-200 dark:hover:bg-orange-400/15"
        aria-label="Criar serviço"
      >
        <span className="pb-3 text-8xl leading-none select-none">+</span>
      </button>
      {servicos.map((servico, index) => (
        <ServicoCard
          key={index}
          servico={servico}
          onClick={() =>
            navigate("/gerenciar-servico", {
              state: { idEmpresa, idServico: servico.id },
            })
          }
        />
      ))}
    </div>
  );
}

export default DisplayServicos;
