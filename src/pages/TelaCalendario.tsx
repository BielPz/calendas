import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useGradiente } from "../hooks/useGradiente";
import {
  cancelarAgendamento,
  getAgendamentosUsuario,
} from "../features/agendamentos/agendamento.service";
import type { Agendamento } from "../firebase/types";
import { useAlerta } from "../provider/AlertContext";
import { getTipoUsuario } from "../features/auth/auth.service";
import DetalhesAgendamento from "@/components/agenda/DetalhesAgendamentos";
import AgendaUnificada from "@/components/agenda/AgendaUnificada";
import Cabecalho from "@/components/utils/Cabecalho";
import Loading from "@/components/utils/Loading";

function TelaCalendario() {
  const corFundo = useGradiente();
  const auth = getAuth();
  const id = auth.currentUser?.uid;
  const nomeUsuario = auth.currentUser?.displayName || "Perfil";
  const navigate = useNavigate();
  const { showAlerta, confirmar } = useAlerta();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<"cliente" | "prestador">(
    "cliente",
  );
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
