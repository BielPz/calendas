import type { ReactNode } from "react";
import type { Agendamento } from "../../firebase/types";

interface Props {
  agendamento: Agendamento;
  selecionado?: boolean;
  rotulo: string;
  onSelecionar: () => void;
  acoes?: ReactNode;
}

function CardAgendamento({
  agendamento,
  selecionado = false,
  rotulo,
  onSelecionar,
  acoes,
}: Props) {
  // Permite a criação de de botões de ação dentro card
  const isEventAction = (alvo: EventTarget | null) =>
    alvo instanceof Element && Boolean(alvo.closest("[data-acao-agendamento]"));
  const nomeServico = agendamento.servico?.nome || rotulo;
  const nomeCliente =
    rotulo !== nomeServico
      ? rotulo.replace(` — ${nomeServico}`, "").trim()
      : "";
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={(evento) => {
        if (!isEventAction(evento.target)) onSelecionar();
      }}
      onKeyDown={(evento) => {
        if (
          !isEventAction(evento.target) &&
          (evento.key === "Enter" || evento.key === " ")
        )
          onSelecionar();
      }}
      className={`w-full cursor-pointer rounded-lg border p-3 text-left transition ${selecionado ? "border-orange-400 bg-orange-50 dark:bg-orange-400/10" : "border-slate-200 bg-slate-50 hover:border-orange-300 dark:border-zinc-700 dark:bg-zinc-800"}`}
    >
      <span className="block text-xs font-semibold text-orange-700 dark:text-orange-300">
        {new Date(`${agendamento.data}T12:00:00`).toLocaleDateString("pt-BR")}{" "}
        às {agendamento.horario}
      </span>
      <div className="mt-1 flex items-center gap-1">
        <strong className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-zinc-100">
          {nomeServico}
        </strong>
        {acoes && (
          <div
            data-acao-agendamento
            className="flex shrink-0 items-center gap-1"
          >
            {acoes}
          </div>
        )}
      </div>
      {nomeCliente && (
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-zinc-400">
          {nomeCliente}
        </span>
      )}
      {agendamento.status === "aguardando_aprovacao" && (
        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
          Aguardando aprovação
        </span>
      )}
    </article>
  );
}

export default CardAgendamento;
