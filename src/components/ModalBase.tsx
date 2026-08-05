import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props { aberto: boolean; titulo: string; subtitulo?: string; children: ReactNode; rodape?: ReactNode; onFechar: () => void; className?: string; }

export default function ModalBase({ aberto, titulo, subtitulo, children, rodape, onFechar, className = "max-w-lg" }: Props) {
  useEffect(() => {
    if (!aberto) return;
    const fechar = (event: KeyboardEvent) => event.key === "Escape" && onFechar();
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto, onFechar]);
  useEffect(() => { if (!aberto) return; const anterior = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = anterior; }; }, [aberto]);
  if (!aberto) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={onFechar}>
    <section className={`ui-card w-full overflow-hidden shadow-2xl ${className}`} onMouseDown={(event) => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-zinc-700"><div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{titulo}</h2>{subtitulo && <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{subtitulo}</p>}</div><button type="button" onClick={onFechar} className="ui-button-icon" aria-label="Fechar"><X size={20} /></button></header>
      <div className="p-5">{children}</div>{rodape && <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">{rodape}</footer>}
    </section>
  </div>;
}
