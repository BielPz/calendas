import type { ReactNode } from "react";
interface Props { titulo?: string; descricao?: string; children: ReactNode; className?: string; }
export default function GrupoFormulario({ titulo, descricao, children, className = "" }: Props) { return <section className={`border-t border-slate-200 pt-6 dark:border-zinc-700 ${className}`}>{titulo && <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-300">{titulo}</h3>}{descricao && <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{descricao}</p>}<div className="mt-5">{children}</div></section>; }
