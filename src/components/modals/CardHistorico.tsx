import type { Agendamento } from "@/firebase/types";
import {
  COR_STATUS,
  ROTULO_STATUS,
} from "@/components/utils/statusAgendamento";

interface Props {
  agendamento: Agendamento;
  usuario?: "prestador" | "cliente";
}

function CardHistorico({ agendamento: a, usuario }: Props) {
  return (
    <div className="ui-card-muted flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800 dark:text-zinc-100">
          {a.servico?.nome ?? "Serviço"}
        </p>
        <p className="text-sm text-slate-600 dark:text-zinc-300">
          {a.data.split("-").reverse().join("/")} às {a.horario}
          {a.duracaoMinutos ? ` · ${a.duracaoMinutos} min` : ""}
        </p>
        {usuario === "prestador" && a.clienteNome && (
          <p className="truncate text-sm text-slate-600 dark:text-zinc-300">
            Cliente: {a.clienteNome}
          </p>
        )}
        {a.modalidadeAtendimento && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {a.modalidadeAtendimento}
          </p>
        )}
        {a.obs && (
          <p className="mt-1 break-words text-xs italic text-slate-500 dark:text-zinc-400">
            {a.obs}
          </p>
        )}
      </div>
      {a.status && (
        <span
          className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${COR_STATUS[a.status]}`}
        >
          {ROTULO_STATUS[a.status]}
        </span>
      )}
    </div>
  );
}

export default CardHistorico;
