import { useEffect, useState } from "react";
import { getUsuarioQueAgendou } from "../../firebase/database";
import type { Agendamento } from "../../firebase/types";
import { CalendarDays, Clock } from "lucide-react";

interface Props {
  agendamento: Agendamento;
}

function NotificacaoAgendamento({ agendamento }: Props) {
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

  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl p-3">
      {/* Cabeçalho com avatar */}
      <div className="flex items-center gap-2.5">
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
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {nomeCliente}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            agendou um serviço
          </span>
        </div>
        <span className="ml-auto text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-2 py-0.5 rounded-full">
          Novo
        </span>
      </div>

      {/* Detalhes do serviço */}
      <div className="flex flex-col gap-1 bg-gray-50 dark:bg-zinc-600 rounded-lg px-3 py-2.5">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {agendamento.servico?.nome}
        </span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <CalendarDays size={12} color="currentColor" />
            {new Date(agendamento.data + "T12:00:00").toLocaleDateString(
              "pt-BR",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              },
            )}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} color="currentColor" />
            {agendamento.horario}
          </span>
        </div>
      </div>

      {/* Ações - Não funcional */}
      {false && (
        <div className="flex gap-2">
          <button className="flex-1 text-sm font-medium py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors cursor-pointer">
            Confirmar
          </button>
          <button className="flex-1 text-sm py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-500 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-400 transition-colors cursor-pointer">
            Recusar
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificacaoAgendamento;
