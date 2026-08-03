import { useState } from "react";
import { Star, X } from "lucide-react";

interface Props {
  aberto: boolean;
  notaInicial: number;
  comentarioInicial: string;
  nomeServico: string;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (nota: number, comentario: string) => Promise<void>;
}

function ModalAvaliacao({
  aberto,
  notaInicial,
  comentarioInicial,
  nomeServico,
  salvando = false,
  onFechar,
  onSalvar,
}: Props) {
  const [nota, setNota] = useState(notaInicial || 0);
  const [comentario, setComentario] = useState(comentarioInicial);
  const [hover, setHover] = useState(0);

  if (!aberto) return null;

  const enviar = async () => {
    if (!nota) return;
    await onSalvar(nota, comentario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-avaliacao">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="titulo-avaliacao" className="text-lg font-bold text-slate-900 dark:text-white">Avalie o serviço</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{nomeServico}</p>
          </div>
          <button type="button" onClick={onFechar} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Fechar avaliação">
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((estrela) => (
            <button
              key={estrela}
              type="button"
              onClick={() => setNota(estrela)}
              onMouseEnter={() => setHover(estrela)}
              onMouseLeave={() => setHover(0)}
              className="rounded-lg p-1 transition hover:scale-110"
              aria-label={`${estrela} estrelas`}
            >
              <Star size={35} className={(hover || nota) >= estrela ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-zinc-600"} />
            </button>
          ))}
        </div>

        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200" htmlFor="comentario-avaliacao">Comentário <span className="font-normal text-slate-400">(opcional)</span></label>
        <textarea id="comentario-avaliacao" value={comentario} onChange={(event) => setComentario(event.target.value)} maxLength={500} placeholder="Conte como foi sua experiência" className="ui-input min-h-28 resize-y" />
        <p className="mt-1 text-right text-xs text-slate-400">{comentario.length}/500</p>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onFechar} className="ui-button-secondary" disabled={salvando}>Cancelar</button>
          <button type="button" onClick={enviar} disabled={!nota || salvando} className="ui-button-primary">{salvando ? "Salvando..." : "Salvar avaliação"}</button>
        </div>
      </div>
    </div>
  );
}

export default ModalAvaliacao;
