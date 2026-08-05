import { ChevronLeft, ChevronRight } from "lucide-react";
interface Props { onAnterior: () => void; onProximo: () => void; mes?: Date; }
export default function NavegacaoMes({ onAnterior, onProximo, mes }: Props) {
  const tituloMes = mes?.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return <div className="flex items-center gap-3"><span className="text-sm font-bold capitalize text-slate-700 dark:text-zinc-200">{tituloMes}</span><div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-700"><button type="button" onClick={onAnterior} className="ui-button-icon rounded-none" aria-label="Mês anterior"><ChevronLeft size={18} /></button><button type="button" onClick={onProximo} className="ui-button-icon rounded-none border-l border-slate-200 dark:border-zinc-700" aria-label="Próximo mês"><ChevronRight size={18} /></button></div></div>;
}
