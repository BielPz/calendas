import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import ModalBase from "./ModalBase";

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

  useEffect(() => {
    if (aberto) {
      setNota(notaInicial || 0);
      setComentario(comentarioInicial);
    }
  }, [aberto, notaInicial, comentarioInicial]);

  return (
    <ModalBase
      aberto={aberto}
      titulo="Avalie o serviço"
      subtitulo={nomeServico}
      onFechar={onFechar}
      rodape={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="ui-button-secondary"
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSalvar(nota, comentario)}
            disabled={!nota || salvando}
            className="ui-button-primary"
          >
            {salvando ? "Salvando..." : "Salvar avaliação"}
          </button>
        </div>
      }
    >
      <div className="flex justify-center gap-2">
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
            <Star
              size={35}
              className={
                (hover || nota) >= estrela
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 dark:text-zinc-600"
              }
            />
          </button>
        ))}
      </div>
      <label className="mt-5 mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Comentário{" "}
        <span className="font-normal text-slate-400">(opcional)</span>
      </label>
      <textarea
        value={comentario}
        onChange={(event) => setComentario(event.target.value)}
        maxLength={500}
        placeholder="Conte como foi sua experiência"
        className="ui-input min-h-28 resize-y"
      />
      <p className="mt-1 text-right text-xs text-slate-400">
        {comentario.length}/500
      </p>
    </ModalBase>
  );
}

export default ModalAvaliacao;
