import type { ReactNode } from "react";

interface Props {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}

function EstadoVazio({ titulo, descricao, acao, className = "" }: Props) {
  return (
    <div
      className={`ui-card-muted flex min-h-28 flex-col items-center justify-center p-5 text-center ${className}`}
    >
      <p className="font-bold text-slate-700 dark:text-zinc-200">{titulo}</p>
      {descricao && (
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {descricao}
        </p>
      )}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}

export default EstadoVazio;
