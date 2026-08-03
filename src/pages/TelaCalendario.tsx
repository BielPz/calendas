import { useEffect, useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import { getAuth } from "firebase/auth";
import { CalendarClock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Agenda from "../components/Agenda";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import { cancelarAgendamento, getAgendamentosUsuario } from "../features/agendamentos/agendamento.service";
import type { Agendamento } from "../firebase/types";
import { useAlerta } from "../provider/AlertContext";

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

  useEffect(() => {
    if (!id) return;
    getAgendamentosUsuario(id).then(setAgendamentos);
  }, [id]);

  const doDia = useMemo(
    () => agendamentos.filter((agendamento) => agendamento.data === dataSelecionada),
    [agendamentos, dataSelecionada],
  );
  const todosAgendamentos = useMemo(
    () => [...agendamentos].filter((agendamento) => agendamento.status !== "cancelado").sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`)),
    [agendamentos],
  );

  const selecionarAgendamento = (agendamento: Agendamento) => {
    setDataSelecionada(agendamento.data);
    setSelecionadoId(agendamento.id);
  };

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
      showAlerta("Agendamento cancelado", "O horário voltou a ficar disponível.", "sucesso");
    } catch (error) {
      showAlerta("Não foi possível cancelar", error instanceof Error ? error.message : "Tente novamente.", "erro");
    }
  };

  if (!id) return <Loading />;

  return (
    <div className={`${corFundo} flex h-dvh w-full flex-col overflow-hidden`}>
      <Cabecalho perfil nome={nomeUsuario} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col gap-4 p-4 md:flex-row md:overflow-hidden md:p-6">
        <aside className="ui-card flex min-h-0 w-full flex-1 flex-col p-3 md:w-72 md:flex-none">
          <label className="hidden text-sm font-bold text-slate-700 dark:text-zinc-200 md:block">Data
            <input type="date" value={dataSelecionada} onChange={(event) => { setDataSelecionada(event.target.value); setSelecionadoId(undefined); }} className="ui-input mt-2 py-2" />
          </label>
          <div className="flex min-h-0 flex-1 flex-col md:mt-4 md:flex-none md:border-t md:border-slate-200 md:pt-4 dark:md:border-zinc-700">
            <h1 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-300">Meus agendamentos</h1>
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto md:max-h-64 md:flex-none">
              {todosAgendamentos.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">Você ainda não possui agendamentos.</p>
              ) : todosAgendamentos.map((agendamento) => (
                <article key={agendamento.id} className={`rounded-lg border p-3 transition ${selecionadoId === agendamento.id ? "border-orange-400 bg-orange-50 dark:bg-orange-400/10" : "border-slate-200 bg-slate-50 hover:border-orange-300 dark:border-zinc-700 dark:bg-zinc-800"}`}>
                  <button type="button" onClick={() => selecionarAgendamento(agendamento)} className="w-full text-left">
                    <span className="block text-xs font-semibold text-orange-700 dark:text-orange-300">{new Date(`${agendamento.data}T12:00:00`).toLocaleDateString("pt-BR")} às {agendamento.horario}</span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-zinc-100">{agendamento.servico.nome}</span>
                  </button>
                  {agendamento.idCliente === id && (
                    <div className="mt-3 flex justify-end gap-1 border-t border-slate-200 pt-2 dark:border-zinc-700">
                      <button type="button" onClick={() => reagendar(agendamento)} className="rounded-md p-2 text-orange-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-orange-300 dark:hover:bg-orange-400/15" aria-label="Reagendar" title="Reagendar"><CalendarClock size={17} /></button>
                      <button type="button" onClick={() => cancelar(agendamento)} className="rounded-md p-2 text-red-600 transition hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-400/15" aria-label="Cancelar agendamento" title="Cancelar"><Trash2 size={17} /></button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </aside>

        <div className="hidden min-h-0 flex-1 md:block">
          <Agenda
            titulo="Minha agenda"
            data={dataSelecionada}
            agendamentos={doDia}
            selecionadoId={selecionadoId}
            onSelecionar={selecionarAgendamento}
            rotuloAgendamento={(agendamento) => agendamento.idCliente === id
              ? agendamento.servico.nome
              : `${agendamento.clienteNome ?? "Cliente"} — ${agendamento.servico.nome}`}
          />
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
    </div>
  );
}

export default TelaCalendario;
