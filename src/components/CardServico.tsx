import type { Servico } from "../firebase/types";
import ImagemServico from "./ImagemServico";

interface Props { servico: Servico; onClick?: () => void; variante?: "compacto" | "lista"; }
export default function CardServico({ servico, onClick, variante = "compacto" }: Props) {
  if (variante === "lista") return <button type="button" onClick={onClick} className="group flex w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-orange-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"><ImagemServico src={servico.imagem} alt={servico.nome} className="h-24 w-24 shrink-0" /><div className="min-w-0 p-3"><h3 className="truncate font-bold text-slate-900 group-hover:text-orange-700 dark:text-white dark:group-hover:text-orange-300">{servico.nome}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-zinc-400">{servico.descricao || ""}</p><span className="mt-2 block text-sm font-bold text-orange-700 dark:text-orange-300">R$ {Number(servico.preco).toFixed(2)}</span></div></button>;
  return <button type="button" onClick={onClick} className="ui-card flex h-36 w-36 shrink-0 flex-col overflow-hidden p-2 text-left transition hover:border-orange-300 hover:shadow-md"><ImagemServico src={servico.imagem} alt={servico.nome} className="h-16 w-full shrink-0" /><div className="flex min-h-0 flex-1 flex-col pt-2"><p className="min-h-7 line-clamp-2 text-sm font-semibold leading-tight">{servico.nome}</p><p className="mt-auto text-xs text-slate-600 dark:text-zinc-300">R$ {servico.preco}</p></div></button>;
}
