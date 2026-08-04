import type { Agendamento } from "../firebase/types";
import type { ReactNode } from "react";
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
}

function PainelAgenda({ tituloLista, tituloAgenda, data, agendamentos, selecionadoId, onSelecionar, rotuloAgendamento, janelaHoras, acaoCabecalho, className = "" }: Props) {
  const agendamentosAtivos = [...agendamentos]
    .filter((agendamento) => agendamento.status !== "cancelado")
    .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
  const agendamentosDoDia = agendamentosAtivos.filter((agendamento) => agendamento.data === data);

  return <div className={`flex min-h-0 w-full flex-col gap-3 md:flex-row ${className}`}>
    <aside className="ui-card flex min-h-0 w-full flex-col p-3 md:w-72 md:flex-none">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-300">{tituloLista}</h2>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {agendamentosAtivos.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">Nenhum agendamento encontrado.</p> : agendamentosAtivos.map((agendamento) => <button key={agendamento.id} type="button" onClick={() => onSelecionar(agendamento)} className={`w-full rounded-lg border p-3 text-left transition ${selecionadoId === agendamento.id ? "border-orange-400 bg-orange-50 dark:bg-orange-400/10" : "border-slate-200 bg-slate-50 hover:border-orange-300 dark:border-zinc-700 dark:bg-zinc-800"}`}>
          <span className="block text-xs font-semibold text-orange-700 dark:text-orange-300">{new Date(`${agendamento.data}T12:00:00`).toLocaleDateString("pt-BR")} às {agendamento.horario}</span>
          <span className="mt-1 block text-sm font-bold text-slate-800 dark:text-zinc-100">{typeof rotuloAgendamento === "function" ? rotuloAgendamento(agendamento) : agendamento.servico.nome}</span>
        </button>)}
      </div>
    </aside>
    <div className="min-h-0 flex-1"><Agenda titulo={tituloAgenda} data={data} agendamentos={agendamentosDoDia} selecionadoId={selecionadoId} onSelecionar={onSelecionar} janelaHoras={janelaHoras} acaoCabecalho={acaoCabecalho} rotuloAgendamento={rotuloAgendamento} /></div>
  </div>;
}

export default PainelAgenda;
