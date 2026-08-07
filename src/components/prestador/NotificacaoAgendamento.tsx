import { memo, useEffect, useState } from "react";
import { getUsuarioQueAgendou } from "../../features/agendamentos/agendamento.service";
import type { Agendamento } from "../../firebase/types";
import { CalendarDays, Clock } from "lucide-react";
import { Check, X } from "lucide-react";
import { responderAgendamento } from "../../features/agendamentos/agendamento.service";

interface Props {
  agendamento: Agendamento;
  onRespondida?: (idAgendamento: string) => void;
}

function NotificacaoAgendamento({ agendamento, onRespondida }: Props) {
  const [nomeCliente, setNomeCliente] = useState<string>("");
  const [imagemCliente, setImagemCliente] = useState<string | null>(null);

  useEffect(() => {
    const carregarNome = async () => {
      const { nomeCliente: nome, imagemCliente: imagem } =
        await getUsuarioQueAgendou(agendamento.id!);
      setNomeCliente(nome);
      setImagemCliente(imagem);
    };
    carregarNome();
  }, [agendamento.id]);

  const iniciais = (nomeCliente || "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const responder = async (aprovar: boolean) => {
    if (!agendamento.id) return;
    try {
      await responderAgendamento(agendamento.id, aprovar);
      onRespondida?.(agendamento.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-700 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {imagemCliente ? (
          <img
            src={imagemCliente}
            alt={nomeCliente}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium text-purple-700 dark:text-purple-200 shrink-0">
            {iniciais}
          </div>
        )}
        <div className="min-w-0">
          <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {nomeCliente}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            solicitou um serviço
          </span>
        </div>
        <div className="min-w-0 rounded-lg bg-gray-50 px-3 py-2 dark:bg-zinc-600">
          <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">{agendamento.servico?.nome}</span>
          <div className="flex gap-3 whitespace-nowrap">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><CalendarDays size={12} />{new Date(agendamento.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Clock size={12} />{agendamento.horario}</span>
          </div>
        </div>
      </div>

      {agendamento.status === "aguardando_aprovacao" && (
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button type="button" onClick={() => responder(false)} className="ui-button-secondary inline-flex items-center whitespace-nowrap px-3 py-2 text-xs text-red-600" title="Recusar agendamento"><X size={15} /> Recusar</button>
          <button type="button" onClick={() => responder(true)} className="ui-button inline-flex items-center whitespace-nowrap px-3 py-2 text-xs" title="Aprovar agendamento"><Check size={15} /> Aprovar</button>
        </div>
      )}

    </div>
  );
}

export default memo(NotificacaoAgendamento);
