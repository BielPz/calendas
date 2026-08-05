import { useEffect, useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getAuth } from "firebase/auth";
import { CalendarClock, Info, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GradeDisponibilidade from "../components/GradeDisponibilidade";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import { cancelarAgendamento, getAgendamentosUsuario } from "../features/agendamentos/agendamento.service";
import type { Agendamento } from "../firebase/types";
import { useAlerta } from "../provider/AlertContext";
import { getTipoUsuario } from "../features/auth/auth.service";
import DetalhesAgendamento from "../components/DetalhesAgendamento";
import PainelAgenda from "../components/PainelAgenda";
import NavegacaoMes from "../components/NavegacaoMes";
import CardAgendamento from "../components/CardAgendamento";

function TelaCalendario() {
  const corFundo = useGradiente();
  const auth = getAuth();
  const id = auth.currentUser?.uid;
  const nomeUsuario = auth.currentUser?.displayName || "Perfil";
  const navigate = useNavigate();
  const { showAlerta } = useAlerta();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [tipoUsuario, setTipoUsuario] = useState<"cliente" | "prestador">("cliente");
  const [mesCalendario, setMesCalendario] = useState(() => new Date());
  const [mostrandoAgenda, setMostrandoAgenda] = useState(false);
  const [agendamentoDetalhado, setAgendamentoDetalhado] = useState<Agendamento>();

  useEffect(() => {
    if (!id) return;
    Promise.all([getAgendamentosUsuario(id), getTipoUsuario()]).then(([itens, tipo]) => {
      setAgendamentos(itens);
      setTipoUsuario(tipo);
    });
  }, [id]);

  const todosAgendamentos = useMemo(
    () => [...agendamentos].filter((agendamento) => agendamento.status !== "cancelado").sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`)),
    [agendamentos],
  );

  const selecionarAgendamento = (agendamento: Agendamento) => {
    setDataSelecionada(agendamento.data);
    setSelecionadoId(agendamento.id);
    setMostrandoAgenda(true);
  };

  const abrirDetalhes = (agendamento: Agendamento) => {
    selecionarAgendamento(agendamento);
    setAgendamentoDetalhado(agendamento);
  };

  const selecionarData = (data: string) => {
    const primeiroDoDia = agendamentos
      .filter((agendamento) => agendamento.data === data && agendamento.status !== "cancelado")
      .sort((a, b) => a.horario.localeCompare(b.horario))[0];
    setDataSelecionada(data);
    setSelecionadoId(primeiroDoDia?.id);
    setMostrandoAgenda(true);
  };

  const tituloAgenda = tipoUsuario === "prestador" ? "Agenda da empresa" : "Minha agenda";

  const reagendar = (agendamento: Agendamento) => {
    navigate("/agendamento", {
      state: {
        servico: agendamento.servico,
        empresa: "Reagendar serviço",
        idAgendamentoOriginal: agendamento.id,
      },
    });
  };

  const cancelar = async (agendamento: Agendamento) => {
    if (!agendamento.id || !window.confirm(`Cancelar o agendamento de ${agendamento.servico.nome}?`)) return;
    try {
      await cancelarAgendamento(agendamento.id);
      setAgendamentos((atual) => atual.filter((item) => item.id !== agendamento.id));
      setSelecionadoId(undefined);
      setAgendamentoDetalhado(undefined);
      showAlerta("Agendamento cancelado", "O horário voltou a ficar disponível.", "sucesso");
    } catch (error) {
      showAlerta("Não foi possível cancelar", error instanceof Error ? error.message : "Tente novamente.", "erro");
    }
  };

  const acoesDoAgendamento = (agendamento: Agendamento) => (
    <>
      {tipoUsuario === "cliente" && <button type="button" onClick={() => reagendar(agendamento)} className="rounded-md p-2 text-orange-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-orange-300 dark:hover:bg-orange-400/15" aria-label="Reagendar" title="Reagendar"><CalendarClock size={17} /></button>}
      <button type="button" onClick={() => abrirDetalhes(agendamento)} className="rounded-md p-2 text-slate-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-zinc-300 dark:hover:bg-orange-400/15" aria-label="Ver detalhes" title="Ver detalhes"><Info size={17} /></button>
      <button type="button" onClick={() => cancelar(agendamento)} className="rounded-md p-2 text-red-600 transition hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-400/15" aria-label="Cancelar agendamento" title="Cancelar agendamento"><Trash2 size={17} /></button>
    </>
  );

  if (!id) return <Loading />;

  return (
    <div className={`${corFundo} flex h-dvh w-full flex-col overflow-hidden`}>
      <Cabecalho perfil nome={nomeUsuario} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col gap-4 p-4 md:flex-row md:overflow-hidden md:p-6">
        <aside className={`${mostrandoAgenda ? "hidden" : "flex"} ui-card min-h-0 w-full flex-1 flex-col p-3 md:w-72 md:flex-none`}>
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-300">{tipoUsuario === "prestador" ? "Agendamentos da empresa" : "Meus agendamentos"}</h1>
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {todosAgendamentos.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">Você ainda não possui agendamentos.</p>
              ) : todosAgendamentos.map((agendamento) => (
                <CardAgendamento
                  key={agendamento.id}
                  agendamento={agendamento}
                  selecionado={selecionadoId === agendamento.id}
                  rotulo={agendamento.servico.nome}
                  onSelecionar={() => selecionarAgendamento(agendamento)}
                  acoes={acoesDoAgendamento(agendamento)}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className={`${mostrandoAgenda ? "flex" : "hidden md:block"} min-h-0 flex-1`}>
          {mostrandoAgenda ? <PainelAgenda
            className="h-full"
            tituloLista={tipoUsuario === "prestador" ? "Agendamentos da empresa" : "Meus agendamentos"}
            tituloAgenda={tituloAgenda}
            data={dataSelecionada}
            agendamentos={todosAgendamentos}
            selecionadoId={selecionadoId}
            onSelecionar={selecionarAgendamento}
            acoesAgendamento={acoesDoAgendamento}
            acaoCabecalho={<button type="button" className="ui-button-secondary text-sm" onClick={() => setMostrandoAgenda(false)}>Alterar data</button>}
            rotuloAgendamento={(agendamento) => agendamento.idCliente === id ? agendamento.servico.nome : `${agendamento.clienteNome ?? "Cliente"} — ${agendamento.servico.nome}`}
          /> : <section className="ui-card flex h-full min-h-0 flex-col p-5">
            <header className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-800 dark:text-zinc-100">Escolha uma data</h2><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Depois, você verá os horários em uma linha do tempo.</p></div><NavegacaoMes onAnterior={() => setMesCalendario((data) => new Date(data.getFullYear(), data.getMonth() - 1, 1))} onProximo={() => setMesCalendario((data) => new Date(data.getFullYear(), data.getMonth() + 1, 1))} /></header>
            <GradeDisponibilidade ano={mesCalendario.getFullYear()} mes={mesCalendario.getMonth()} diasFuncionamento={[0, 1, 2, 3, 4, 5, 6]} disponibilidades={{}} modo="agenda" preencherAltura datasComAgendamento={todosAgendamentos.map((agendamento) => agendamento.data)} dataSelecionada={dataSelecionada} onDiaSelecionado={(dia) => selecionarData(`${mesCalendario.getFullYear()}-${String(mesCalendario.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`)} />
          </section>}
        </div>
        {/*
        <section className="ui-card min-h-120 flex-1 p-3">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-zinc-700">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-zinc-100">Minha agenda</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-700" aria-label="Zoom da agenda">
                <button type="button" onClick={() => setPixelsPorHora((valor) => Math.max(112, valor - 24))} className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-orange-50 dark:text-zinc-200 dark:hover:bg-zinc-800" aria-label="Diminuir zoom">−</button>
                <span className="border-x border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-500 dark:border-zinc-700 dark:text-zinc-400">{pixelsPorHora >= 160 ? "15 min" : pixelsPorHora >= 136 ? "30 min" : "1 hora"}</span>
                <button type="button" onClick={() => setPixelsPorHora((valor) => Math.min(184, valor + 24))} className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-orange-50 dark:text-zinc-200 dark:hover:bg-zinc-800" aria-label="Aumentar zoom">+</button>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-400/10 dark:text-orange-200">{doDia.length} agendamento(s)</span>
            </div>
          </header>
          <div ref={painelRef} className="max-h-[70dvh] overflow-y-auto pr-1">
            <TimelineHoras agendamentos={doDia} selecionadoId={selecionadoId} onSelecionar={selecionarAgendamento} pixelsPorHora={pixelsPorHora} />
          </div>
        </section>*/}
      </main>
      {agendamentoDetalhado && <DetalhesAgendamento agendamento={agendamentoDetalhado} tipoUsuario={tipoUsuario} onFechar={() => setAgendamentoDetalhado(undefined)} onCancelar={cancelar} />}
    </div>
  );
}

export default TelaCalendario;
