import type { ReactNode } from "react";
interface Props {
  titulo: string;
  valor: ReactNode;
  icone?: ReactNode;
  className?: string;
}
export default function CardInformacao({
  titulo,
  valor,
  icone,
  className = "",
}: Props) {
  return (
    <div className={`ui-card-muted p-4 ${className}`}>
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
        {icone}
        {titulo}
      </span>
      <strong className="mt-1 block text-sm text-slate-800 dark:text-zinc-100">
        {valor}
      </strong>
    </div>
  );
}
