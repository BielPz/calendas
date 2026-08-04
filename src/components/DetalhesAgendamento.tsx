import { CalendarDays, Clock3, MapPin, MessageSquareText, Phone, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import type { Agendamento } from "../firebase/types";

interface Props {
  agendamento: Agendamento;
  tipoUsuario: "cliente" | "prestador";
  onFechar: () => void;
  onCancelar?: (agendamento: Agendamento) => void;
  mostrarDadosPrivados?: boolean;
}

function DetalhesAgendamento({ agendamento, tipoUsuario, onFechar, onCancelar, mostrarDadosPrivados = true }: Props) {
  const data = new Date(`${agendamento.data}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
  const modalidade = agendamento.modalidadeAtendimento === "online"
    ? "Atendimento online"
    : agendamento.modalidadeAtendimento === "presencial-prestador"
      ? "Prestador vai até o cliente"
      : "Atendimento no estabelecimento";

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Detalhes do agendamento" onMouseDown={onFechar}>
    <section className="ui-card w-full max-w-lg overflow-hidden shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-zinc-700">
        <div><p className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-300">Detalhes do agendamento</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{agendamento.servico.nome}</h2></div>
        <button type="button" onClick={onFechar} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Fechar detalhes"><X size={20} /></button>
      </header>

      <div className="space-y-4 p-5">
        {tipoUsuario === "prestador" && <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm dark:bg-orange-400/10"><span className="block text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Cliente</span><span className="mt-1 block font-bold text-slate-800 dark:text-zinc-100">{agendamento.clienteNome ?? "Cliente"}</span></div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Info icone={<CalendarDays size={17} />} titulo="Data" texto={data} />
          <Info icone={<Clock3 size={17} />} titulo="Horário" texto={`${agendamento.horario} · ${agendamento.duracaoMinutos ?? agendamento.servico.duracao} ${agendamento.duracaoMinutos ? "minutos" : agendamento.servico.tempo}`} />
        </div>
        <Info icone={<MapPin size={17} />} titulo="Modalidade" texto={modalidade} />
        {tipoUsuario === "prestador" && agendamento.telefoneContato && <Info icone={<Phone size={17} />} titulo="Telefone para contato" texto={agendamento.telefoneContato} />}
        {tipoUsuario === "prestador" && agendamento.enderecoCliente && <Info icone={<MapPin size={17} />} titulo="Endereço do cliente" texto={agendamento.enderecoCliente} />}
        {mostrarDadosPrivados && agendamento.obs && <Info icone={<MessageSquareText size={17} />} titulo="Observação" texto={agendamento.obs} />}
      </div>

      {onCancelar && <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
        <button type="button" onClick={() => onCancelar(agendamento)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-400/15" title="Cancelar agendamento"><Trash2 size={17} /> Cancelar agendamento</button>
      </footer>}
    </section>
  </div>;
}

function Info({ icone, titulo, texto }: { icone: ReactNode; titulo: string; texto: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">{icone}{titulo}</span><span className="mt-1 block text-sm font-semibold text-slate-800 dark:text-zinc-100">{texto}</span></div>;
}

export default DetalhesAgendamento;
