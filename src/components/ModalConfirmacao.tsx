interface Props {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  confirmarLabel?: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}

function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  confirmarLabel = "Confirmar",
  onCancelar,
  onConfirmar,
}: Props) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacao"
        className="w-full max-w-md rounded-2x1 border border-slate-200 bg-white p-6 shadow-2x1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2
          id="titulo-confirmacao"
          className="text-lg font-bold text-slate-900 dark:text-white"
        >
          {titulo}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
          {mensagem}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="ui-button-secondary"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="ui-button-danger"
          >
            {confirmarLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ModalConfirmacao;
