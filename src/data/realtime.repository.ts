import { db } from "@/firebase/config";
import type { Servico } from "@/firebase/types";
import { getAuth } from "firebase/auth";
import { ref, get, update, push, set } from "firebase/database";

export const getServicosDaEmpresa = async (
  idEmpresa: string,
): Promise<Servico[]> => {
  try {
    // 1. pega os IDs dos serviços da empresa
    const servicosRef = ref(db, `empresas/${idEmpresa}/servicos`);
    const snapshot = await get(servicosRef);

    if (!snapshot.exists()) return [];

    const ids = Object.keys(snapshot.val());

    // 2. busca cada serviço no nó global
    const servicos = await Promise.all(
      ids.map(async (id) => {
        const snap = await get(ref(db, `servicos/${id}`));
        return snap.exists() ? { id, ...snap.val() } : null;
      }),
    );

    // 3. remove null (caso algum não exista)
    return servicos.filter(Boolean) as Servico[];
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return [];
  }
};

/* -----------------------------------------------------------------------------*/

export const cancelarAgendamento = async (idAgendamento: string, opcoes: {notificar?: boolean} = {}): Promise<void> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");

  const agendamentoSnap = await get(ref(db, `agendamentos/${idAgendamento}`));
  if (!agendamentoSnap.exists()) throw new Error("Agendamento não encontrado");

  const agendamento = agendamentoSnap.val();
  if (agendamento.idCliente !== uid && agendamento.idPrestador !== uid) {
    throw new Error("Você não tem permissão para cancelar este agendamento.");
  }

  const canceladoPeloPrestador = agendamento.idPrestador === uid;
  const nomeServico = agendamento.servico?.nome ?? (await get(ref(db, `servicos/${agendamento.idServico}`))).val()?.nome ?? "serviço";
  if (opcoes.notificar !== false) await criarNotificacaoCliente(agendamento.idCliente, {
    tipo: "agendamento",
    titulo: canceladoPeloPrestador ? "Agendamento cancelado pelo prestador" : "Agendamento cancelado",
    mensagem: canceladoPeloPrestador
      ? `O prestador cancelou seu agendamento de ${nomeServico} em ${agendamento.data} às ${agendamento.horario}.`
      : `Seu agendamento de ${nomeServico} em ${agendamento.data} às ${agendamento.horario} foi cancelado.`,
    idAgendamento,
    idServico: agendamento.idServico,
  });
  if (!canceladoPeloPrestador && opcoes.notificar !== false) {
    await criarNotificacaoPrestador(agendamento.idPrestador, idAgendamento, {
      tipo: "agendamento",
      titulo: "Agendamento cancelado pelo cliente",
      mensagem: `${agendamento.clienteNome ?? "O cliente"} cancelou ${nomeServico} de ${agendamento.data} às ${agendamento.horario}.`,
      idServico: agendamento.idServico,
      manterAposEncerramento: true,
    });
  }

  await update(ref(db), {
    [`agendamentos/${idAgendamento}`]: null,
    [`clientes/${agendamento.idCliente}/agendamentos/${idAgendamento}`]: null,
    [`servicos/${agendamento.idServico}/agendamentos/${idAgendamento}`]: null,
    ...Object.fromEntries((agendamento.servicosConflitantes ?? []).map((id: string) => [`servicos/${id}/agendamentos/${idAgendamento}`, null])),
    [`slots/${agendamento.idServico}/${agendamento.data}/${agendamento.horario}`]: null,
    [`slotsClientes/${agendamento.idCliente}/${agendamento.data}/${agendamento.horario}`]: null,
    ...(canceladoPeloPrestador ? { [`prestadores/${agendamento.idPrestador}/notificacoes/${idAgendamento}`]: null } : {}),
  });
};

/* -----------------------------------------------------------------------------*/

const criarNotificacaoCliente = async (idCliente: string, notificacao: Omit<import("../firebase/types").Notificacao, "id" | "criadoEm" | "lida">) => {
  const novaRef = push(ref(db, `clientes/${idCliente}/notificacoes`));
  await set(novaRef, { ...notificacao, criadoEm: Date.now(), lida: false });
};

const criarNotificacaoPrestador = async (idPrestador: string, idAgendamento: string, notificacao: Omit<import("../firebase/types").Notificacao, "id" | "criadoEm" | "lida">) => {
  await set(ref(db, `prestadores/${idPrestador}/notificacoes/${idAgendamento}`), { ...notificacao, criadoEm: Date.now(), lida: false, idAgendamento });
};