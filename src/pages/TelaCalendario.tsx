import { useEffect, useMemo, useState } from "react";
import { X, Search, CalendarClock, Info, Trash2 } from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import { getAuth } from "firebase/auth";
import MiniCalendario from "../components/MiniCalendario";
import TimelineHoras from "../components/TimeLineHoras";
import { useNavigate } from "react-router-dom";
import { useGradiente } from "../hooks/useGradiente";
import Loading from "../components/Loading";
import { getAgendamentosUsuario } from "../firebase/database";
import type { Agendamento } from "../firebase/types";
import { useAlerta } from "@/provider/AlertContext";
import { getTipoUsuario } from "@/firebase/auth";
import { cancelarAgendamento } from "@/data/realtime.repository";
import AgendaUnificada from "@/components/AgendaUnificada";
import DetalhesAgendamento from "@/components/DetalhesAgendamentos";
import GradeDisponibilidade from "@/components/GradeDisponibilidade";
import NavegacaoMes from "@/components/NavegacaoMes";
import PainelAgenda from "@/components/PainelAgenda";
import CardAgendamento from "@/components/CardAgendamento";

function TelaCalendario() {
  const corFundo = useGradiente();
  const auth = getAuth();
  const id = auth.currentUser?.uid;
  const nomeUsuario = auth.currentUser?.displayName || "Perfil";
  const navigate = useNavigate();
  const { showAlerta, confirmar } = useAlerta();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(() =>
    new Date().toLocaleDateString("en-CA"),
  );
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [tipoUsuario, setTipoUsuario] = useState<"cliente" | "prestador">(
    "cliente",
  );
  const [mesCalendario, setMesCalendario] = useState(() => new Date());
  const [mostrandoAgenda, setMostrandoAgenda] = useState(false);
  const [agendamentoDetalhado, setAgendamentoDetalhado] =
    useState<Agendamento>();

  useEffect(() => {
    if (!id) return;
    Promise.all([getAgendamentosUsuario(id), getTipoUsuario()]).then(
      ([itens, tipo]) => {
        setAgendamentos(itens);
        setTipoUsuario(tipo);
      },
    );
  }, [id]);

  const todosAgendamentos = useMemo(
    () =>
      [...agendamentos]
        .filter((agendamento) => agendamento.status !== "cancelado")
        .sort((a, b) =>
          `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`),
        ),
    [agendamentos],
  );

  const selecionarAgendamento = (agendamento: Agendamento) => {
    setDataSelecionada(agendamento.data);
    setSelecionadoId(agendamento.id);
    setMostrandoAgenda(true);
  };

  const abrirDetalhes = (agendamento: Agendamento) => {
    setAgendamentoDetalhado(agendamento);
  };

  const selecionarData = (data: string) => {
    const primeiroDoDia = agendamentos
      .filter(
        (agendamento) =>
          agendamento.data === data && agendamento.status !== "cancelado",
      )
      .sort((a, b) => a.horario.localeCompare(b.horario))[0];
    setDataSelecionada(data);
    setSelecionadoId(primeiroDoDia?.id);
    setMostrandoAgenda(true);
  };

  const tituloAgenda =
    tipoUsuario === "prestador" ? "Agenda da empresa" : "Minha agenda";

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
    if (
      !agendamento.id ||
      !(await confirmar(
        "Cancelar agendamento",
        `Cancelar o agendamento de ${agendamento.servico.nome}?`,
        "Cancelar agendamento",
      ))
    )
      return;
    try {
      await cancelarAgendamento(agendamento.id);
      setAgendamentos((atual) =>
        atual.filter((item) => item.id !== agendamento.id),
      );
      setSelecionadoId(undefined);
      setAgendamentoDetalhado(undefined);
      showAlerta(
        "Agendamento cancelado",
        "O horário voltou a ficar disponível.",
        "sucesso",
      );
    } catch (error) {
      showAlerta(
        "Não foi possível cancelar",
        error instanceof Error ? error.message : "Tente novamente.",
        "erro",
      );
    }
  };

  const acoesDoAgendamento = (agendamento: Agendamento) => (
    <>
      {tipoUsuario === "cliente" && (
        <button
          type="button"
          onClick={() => reagendar(agendamento)}
          className="rounded-md p-2 text-orange-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-orange-300 dark:hover:bg-orange-400/15"
          aria-label="Reagendar"
          title="Reagendar"
        >
          <CalendarClock size={17} />
        </button>
      )}
      <button
        type="button"
        onClick={() => abrirDetalhes(agendamento)}
        className="rounded-md p-2 text-slate-600 transition hover:bg-orange-100 hover:text-orange-800 dark:text-zinc-300 dark:hover:bg-orange-400/15"
        aria-label="Ver detalhes"
        title="Ver detalhes"
      >
        <Info size={17} />
      </button>
      <button
        type="button"
        onClick={() => cancelar(agendamento)}
        className="rounded-md p-2 text-red-600 transition hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-400/15"
        aria-label="Cancelar agendamento"
        title="Cancelar agendamento"
      >
        <Trash2 size={17} />
      </button>
    </>
  );

  if (!id) return <Loading />;

  return (
    <div className={`${corFundo} flex h-dvh w-full flex-col overflow-hidden`}>
      <Cabecalho perfil nome={nomeUsuario} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 p-4 md:p-6">
        <AgendaUnificada
          tituloLista={
            tipoUsuario === "prestador"
              ? "Agendamentos da empresa"
              : "Meus agendamentos"
          }
          tituloAgenda={tituloAgenda}
          agendamentos={todosAgendamentos}
          permitirReagendar={tipoUsuario === "cliente"}
          onReagendar={reagendar}
          onDetalhes={setAgendamentoDetalhado}
          onCancelar={cancelar}
          rotuloAgendamento={(agendamento) =>
            agendamento.idCliente === id
              ? agendamento.servico.nome
              : `${agendamento.clienteNome ?? "Cliente"} — ${agendamento.servico.nome}`
          }
        />
      </main>
      {agendamentoDetalhado && (
        <DetalhesAgendamento
          agendamento={agendamentoDetalhado!}
          tipoUsuario={tipoUsuario}
          onFechar={() => setAgendamentoDetalhado(undefined)}
          onCancelar={cancelar}
        />
      )}
    </div>
  );
}

export default TelaCalendario;
