import { useMemo, useState } from "react";
import { CalendarClock, Info, Trash2 } from "lucide-react";
import type { Agendamento } from "../firebase/types";
import GradeDisponibilidade from "./GradeDisponibilidade";
import NavegacaoMes from "./NavegacaoMes";
import PainelAgenda from "./PainelAgenda";

interface Props {
  tituloLista: string;
  tituloAgenda: string;
  agendamentos: Agendamento[];
  rotuloAgendamento?: string | ((agendamento: Agendamento) => string);
  permitirReagendar?: boolean;
  onReagendar?: (agendamento: Agendamento) => void;
  onDetalhes: (agendamento: Agendamento) => void;
  onCancelar: (agendamento: Agendamento) => void;
  janelaHoras?: number;
  ocultarAgendaNoMobile?: boolean;
}

const hoje = () => new Date().toLocaleDateString("en-CA");

export default function AgendaUnificada({ tituloLista, tituloAgenda, agendamentos, rotuloAgendamento, permitirReagendar = false, onReagendar, onDetalhes, onCancelar, janelaHoras, ocultarAgendaNoMobile = true }: Props) {
  const [data, setData] = useState(hoje);
  const [mes, setMes] = useState(() => new Date());
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [mostrandoHorarios, setMostrandoHorarios] = useState(false);
  const ativos = useMemo(() => agendamentos.filter((agendamento) => agendamento.status !== "cancelado"), [agendamentos]);

  const selecionarAgendamento = (agendamento: Agendamento) => {
    setData(agendamento.data);
    setMes(new Date(`${agendamento.data}T12:00:00`));
    setSelecionadoId(agendamento.id);
    setMostrandoHorarios(true);
  };
  const selecionarDia = (dia: number) => {
    const dataSelecionada = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const primeiro = ativos.filter((agendamento) => agendamento.data === dataSelecionada).sort((a, b) => a.horario.localeCompare(b.horario))[0];
    setData(dataSelecionada);
    setSelecionadoId(primeiro?.id);
    setMostrandoHorarios(true);
  };
  const acoes = (agendamento: Agendamento) => <>
    {permitirReagendar && onReagendar && <button type="button" onClick={(evento) => { evento.stopPropagation(); onReagendar(agendamento); }} className="rounded-md p-2 text-orange-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-orange-300 dark:hover:bg-orange-400/15" aria-label="Reagendar" title="Reagendar"><CalendarClock size={17} /></button>}
    <button type="button" onClick={(evento) => { evento.stopPropagation(); onDetalhes(agendamento); }} className="rounded-md p-2 text-slate-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-zinc-300 dark:hover:bg-orange-400/15" aria-label="Ver detalhes" title="Ver detalhes"><Info size={17} /></button>
    <button type="button" onClick={(evento) => { evento.stopPropagation(); onCancelar(agendamento); }} className="rounded-md p-2 text-red-600 transition hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-400/15" aria-label="Cancelar agendamento" title="Cancelar agendamento"><Trash2 size={17} /></button>
  </>;

  return <PainelAgenda className="h-full" tituloLista={tituloLista} tituloAgenda={tituloAgenda} data={data} agendamentos={ativos} selecionadoId={selecionadoId} onSelecionar={selecionarAgendamento} janelaHoras={janelaHoras} ocultarAgendaNoMobile={ocultarAgendaNoMobile} rotuloAgendamento={rotuloAgendamento} acoesAgendamento={acoes} acaoCabecalho={mostrandoHorarios ? <button type="button" className="ui-button-secondary text-sm" onClick={() => setMostrandoHorarios(false)}>Alterar data</button> : undefined} conteudoPrincipal={mostrandoHorarios ? undefined : <section className="ui-card flex h-full min-h-0 flex-col p-5"><header className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-800 dark:text-zinc-100">Escolha uma data</h2><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Depois, você verá os horários em uma linha do tempo.</p></div><NavegacaoMes mes={mes} onAnterior={() => setMes((atual) => new Date(atual.getFullYear(), atual.getMonth() - 1, 1))} onProximo={() => setMes((atual) => new Date(atual.getFullYear(), atual.getMonth() + 1, 1))} /></header><GradeDisponibilidade ano={mes.getFullYear()} mes={mes.getMonth()} diasFuncionamento={[0, 1, 2, 3, 4, 5, 6]} disponibilidades={{}} modo="agenda" preencherAltura datasComAgendamento={ativos.map((agendamento) => agendamento.data)} dataSelecionada={data} onDiaSelecionado={selecionarDia} /></section>} />;
}
