import type { ReactNode } from "react";
import type { Servico } from "../../firebase/types";
import ImagemServico from "../utils/ImagemServico";

interface Props {
  servico: Servico;
  rotulo?: string;
  acoes?: ReactNode;
  className?: string;
}
function ResumoServico({
  servico,
  rotulo = "Serviço",
  acoes,
  className = "",
}: Props) {
  return (
    <section
      className={`ui-card min-h-[9rem] self-start overflow-hidden ${className}`}
    >
      <div className="grid min-h-[9rem] sm:grid-cols-[9rem_minmax(0,1fr)]">
        <ImagemServico
          src={servico.imagem}
          alt={servico.nome}
          className="min-h-[9rem]"
        />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              {rotulo}
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold text-slate-900 dark:text-white">
              {servico.nome || "Serviço"}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
              R$ {Number(servico.preco || 0).toFixed(2)} ·{" "}
              {servico.duracao || "—"} {servico.tempo}
            </p>
          </div>
          {acoes && (
            <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ResumoServico;
