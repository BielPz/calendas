import type { Agendamento } from "@/firebase/types";
import type { ReactNode } from "react";
import CardAgendamento from "../modals/CardAgendamento";
import EstadoVazio from "../modals/EstadoVazio";
import Agenda from "./Agenda";

interface Props {
  tituloLista: string;
  tituloAgenda: string;
  data: string;
  agendamentos: Agendamento[];
  selecionadoId?: string;
  onSelecionar: (agendamento: Agendamento) => void;
  rotuloAgendamento?: string | ((agendamento: Agendamento) => string);
  janelaHoras?: number;
  acaoCabecalho?: ReactNode;
  className?: string;
  ocultarAgendaNoMobile?: boolean;
  acoesAgendamento?: (agendamento: Agendamento) => ReactNode;
  conteudoPrincipal?: ReactNode;
}

function PainelAgenda({
  tituloLista,
  tituloAgenda,
  data,
  agendamentos,
  selecionadoId,
  onSelecionar,
  rotuloAgendamento,
  janelaHoras,
  acaoCabecalho,
  className = "",
  ocultarAgendaNoMobile = false,
  acoesAgendamento,
  conteudoPrincipal,
}: Props) {
  const agendamentosAtivos = [...agendamentos]
    .filter((agendamento) => agendamento.status !== "cancelado")
    .sort((a, b) =>
      `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`),
    );
  const agendamentosDoDia = agendamentosAtivos.filter(
    (agendamento) => agendamento.data === data,
  );

  return (
    <div
      className={`flex min-h-0 w-full flex-col gap-3 md:gap-4 md:flex-row ${className}`}
    >
      <aside className="ui-card flex min-h-0 w-full flex-col p-3 md:w-72 md:flex-none">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-300">
          {tituloLista}
        </h2>
        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {agendamentosAtivos.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum agendamento encontrado."
              className="min-h-0"
            />
          ) : (
            agendamentosAtivos.map((agendamento) => (
              <CardAgendamento
                key={agendamento.id}
                agendamento={agendamento}
                selecionado={selecionadoId === agendamento.id}
                onSelecionar={() => onSelecionar(agendamento)}
                rotulo={
                  typeof rotuloAgendamento === "function"
                    ? rotuloAgendamento(agendamento)
                    : agendamento.servico.nome
                }
                acoes={acoesAgendamento?.(agendamento)}
              />
            ))
          )}
        </div>
      </aside>
      <div
        className={`min-h-0 flex-1 ${ocultarAgendaNoMobile ? "hidden md:block" : ""}`}
      >
        {conteudoPrincipal ?? (
          <Agenda
            titulo={tituloAgenda}
            data={data}
            agendamentos={agendamentosDoDia}
            selecionadoId={selecionadoId}
            onSelecionar={onSelecionar}
            janelaHoras={janelaHoras}
            acaoCabecalho={acaoCabecalho}
            rotuloAgendamento={rotuloAgendamento}
          />
        )}
      </div>
    </div>
  );
}

export default PainelAgenda;
