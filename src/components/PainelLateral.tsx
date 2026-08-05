import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface ItemPainelLateral {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface Props {
  itens: ItemPainelLateral[];
  itemAtivo: string;
  onSelecionar: (id: string) => void;
  titulo?: string;
  rodape?: ReactNode;
  className?: string;
  rotuloAcessivel: string;
}

/** Navegação responsiva compartilhada pelas áreas administrativas. */
export default function PainelLateral({
  itens,
  itemAtivo,
  onSelecionar,
  titulo,
  rodape,
  className = "",
  rotuloAcessivel,
}: Props) {
  return (
    <>
      <nav className="ui-card flex gap-1 overflow-x-auto p-2 md:hidden" aria-label={rotuloAcessivel}>
        {itens.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelecionar(item.id)} className={`ui-tab flex shrink-0 items-center gap-2 ${itemAtivo === item.id ? "ui-tab-active" : "text-slate-600 dark:text-zinc-300"}`}>
            {item.icon}<span>{item.label}</span>
          </button>
        ))}
      </nav>

      <aside className={`ui-card hidden w-72 shrink-0 flex-col p-4 md:flex ${className}`}>
        <div className="flex-1 overflow-y-auto pr-2">
          {titulo && <p className="px-2 pb-3 text-xs font-black uppercase tracking-widest text-slate-500">{titulo}</p>}
          {itens.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelecionar(item.id)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all ${itemAtivo === item.id ? "ui-tab-active" : "text-slate-600 hover:bg-orange-50 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
              {item.icon}<span className="flex-1">{item.label}</span>
              {itemAtivo === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>
        {rodape}
      </aside>
    </>
  );
}
