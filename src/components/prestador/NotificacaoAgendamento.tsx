import { memo, useEffect, useState } from "react";
import { getUsuarioQueAgendou } from "../../firebase/database";
import type { Agendamento } from "../../firebase/types";
import { CalendarDays, Check, Clock, X } from "lucide-react";
import { responderAgendamento } from "@/data/realtime.repository";

interface Props {
  agendamento: Agendamento;
  onRespondida?: (idAgendamento: string) => void;
}

function NotificacaoAgendamento({ agendamento, onRespondida }: Props) {
  const [nomeCliente, setNomeCliente] = useState<string>("");
  const [imagemCliente, setImagemCliente] = useState<string | null>(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<
    "aprovar" | "recusar" | null
  >(null);
  const [resultado, setResultado] = useState<"aprovar" | "recusar" | null>(
    null,
  );
  const [erro, setErro] = useState("");

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
    if (!agendamento.id || acaoEmAndamento) return;
    const acao = aprovar ? "aprovar" : "recusar";
    setAcaoEmAndamento(acao);
    setErro("");
    try {
      await responderAgendamento(agendamento.id, aprovar);
      setResultado(acao);
      window.setTimeout(() => onRespondida?.(agendamento.id!), 650);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível responder ao agendamento.");
    } finally {
      setAcaoEmAndamento(null);
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center ${resultado === "aprovar" ? "border-emerald-400 bg-emerald-50 dark:border-emerald-400/50 dark:bg-emerald-400/10" : resultado === "recusar" ? "border-red-400 bg-red-50 dark:border-red-400/50 dark:bg-red-400/10" : "border-gray-200 bg-white dark:border-zinc-600 dark:bg-zinc-700"}`}
    >
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
          <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {agendamento.servico?.nome}
          </span>
          <div className="flex gap-3 whitespace-nowrap">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <CalendarDays size={12} />
              {new Date(agendamento.data + "T12:00:00").toLocaleDateString(
                "pt-BR",
                { day: "2-digit", month: "short", year: "numeric" },
              )}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              {agendamento.horario}
            </span>
          </div>
        </div>
      </div>

      {resultado ? (
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${resultado === "aprovar" ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-200" : "border-red-300 bg-red-100 text-red-800 dark:border-red-400/40 dark:bg-red-400/15 dark:text-red-200"}`}
        >
          <Check size={15} />
          {resultado === "aprovar" ? "Aprovado" : "Recusado"}
        </span>
      ) : (
        agendamento.status === "aguardando_aprovacao" && (
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={Boolean(acaoEmAndamento)}
              onClick={() => responder(false)}
              className="ui-button-secondary inline-flex items-center whitespace-nowrap px-3 py-2 text-xs text-red-600 disabled:cursor-wait disabled:opacity-60"
              title="Recusar agendamento"
            >
              <X size={15} />
              {acaoEmAndamento === "recusar" ? "Recusando..." : "Recusar"}
            </button>
            <button
              type="button"
              disabled={Boolean(acaoEmAndamento)}
              onClick={() => responder(true)}
              className="inline-flex items-center whitespace-nowrap rounded-xl border border-emerald-400 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-wait disabled:opacity-60 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-200 dark:hover:bg-emerald-400/25"
              title="Aprovar agendamento"
            >
              <Check size={15} />
              {acaoEmAndamento === "aprovar" ? "Aprovando..." : "Aprovar"}
            </button>
          </div>
        )
      )}
      {erro && (
        <p className="w-full text-xs font-medium text-red-600 dark:text-red-300">
          {erro}
        </p>
      )}
    </div>
  );
}

export default memo(NotificacaoAgendamento);
