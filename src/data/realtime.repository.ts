import { db } from "@/firebase/config";
import { getAgendamentosCliente, getAgendamentosDoServico } from "@/firebase/database";
import type { Agendamento, Cliente, Servico, Usuario } from "@/firebase/types";
import { estaDentroDoFuncionamento, horariosSeSobrepoem, duracaoServicoEmMinutos } from "@/lib/agenda";
import { getAuth } from "firebase/auth";
import { ref, get, update, push, set, remove, runTransaction } from "firebase/database";

/* -----------------------------------------------------------------------------*/
/*                             SESSÃO USUÁRIO                                   */
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
/*                              SESSÃO PRESTADOR                                */
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
/*                               SESSÃO EMPRESA                                 */
/* -----------------------------------------------------------------------------*/

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
/*                               SESSÃO SERVIÇOS                                */
/* -----------------------------------------------------------------------------*/

export const atualizarServico = async (idServico: string, dados: Partial<Servico>) => {
  const camposEditaveis = { ...dados };
  delete camposEditaveis.id;
  delete camposEditaveis.avaliacoes;
  delete camposEditaveis.avaliacaoMedia;
  delete camposEditaveis.totalAvaliacoes;
  await update(ref(db, `servicos/${idServico}`), camposEditaveis);
};

export const excluirServico = async (idServico: string): Promise<void> => {
  const servicoSnap = await get(ref(db, `servicos/${idServico}`));
  if (!servicoSnap.exists()) throw new Error("Serviço não encontrado.");

  const servico = servicoSnap.val() as Servico & { agendamentos?: Record<string, true>; favoritos?: Record<string, true> };
  if (servico.agendamentos && Object.keys(servico.agendamentos).length > 0) {
    throw new Error("Este serviço possui agendamentos. Cancele ou conclua os atendimentos antes de excluí-lo.");
  }
  if (!servico.idEmpresa) throw new Error("Empresa do serviço não encontrada.");

  await Promise.all(Object.keys(servico.favoritos ?? {}).map((idCliente) => criarNotificacaoCliente(idCliente, {
    tipo: "favorito",
    titulo: "Serviço removido",
    mensagem: `${servico.nome} foi removido pela empresa.`,
    idServico,
  })));

  await update(ref(db), {
    [`servicos/${idServico}`]: null,
    [`empresas/${servico.idEmpresa}/servicos/${idServico}`]: null,
  });
};

/* -----------------------------------------------------------------------------*/
/*                             SESSÃO AGENDAMENTO                               */
/* -----------------------------------------------------------------------------*/

/** Agenda um serviço para um cliente, salvando no nó `agendamentos` e associando ao cliente e prestador */ 
export const agendarServico = async (
  agendamento: Agendamento,
  idCliente: string,
  opcoes: { notificarCliente?: boolean } = {},
) => {
  try {
    const currentUser = getAuth().currentUser;
    if (!currentUser || currentUser.uid !== idCliente) {
      throw new Error("Usuário não autorizado");
    }

    const idServico = agendamento.servico.id;
    if (!idServico || !agendamento.data || !agendamento.horario) {
      throw new Error("Dados do agendamento incompletos");
    }

    const [servicoSnap, clienteSnap] = await Promise.all([
      get(ref(db, `servicos/${idServico}`)),
      get(ref(db, `clientes/${idCliente}`)),
    ]);
    if (!servicoSnap.exists() || !clienteSnap.exists()) {
      throw new Error("Serviço ou cliente não encontrado");
    }

    const servico = { id: idServico, ...servicoSnap.val() } as Servico;
    if (!estaDentroDoFuncionamento(servico, agendamento.data, agendamento.horario)) {
      throw new Error("Este horário está fora do período de funcionamento do serviço.");
    }
    const agendamentosDoCliente = await getAgendamentosCliente(idCliente);
    if (agendamentosDoCliente.some((outro) => (
      outro.data === agendamento.data
      && outro.status !== "cancelado"
      && horariosSeSobrepoem(
        agendamento.horario,
        duracaoServicoEmMinutos(servico),
        outro.horario,
        outro.duracaoMinutos ?? duracaoServicoEmMinutos(outro.servico),
      )
    ))) {
      throw new Error("Você já possui outro agendamento neste horário.");
    }
    const servicosEmpresa = await getServicosDaEmpresa(servico.idEmpresa!);
    const conflitos = servicosEmpresa.filter((outro) => outro.id && outro.id !== idServico && (
      servico.servicosConflitantes?.includes(outro.id) || outro.servicosConflitantes?.includes(idServico)
    ));
    const idsConflitos = conflitos.map((outro) => outro.id!);
    const agendamentosConflitantes = (await Promise.all(conflitos.map((outro) => getAgendamentosDoServico(outro.id!)))).flat();
    const agendamentosExistentes = [...await getAgendamentosDoServico(idServico), ...agendamentosConflitantes];
    if (agendamentosExistentes.some((outro) => outro.data === agendamento.data && outro.status !== "cancelado" && horariosSeSobrepoem(agendamento.horario, duracaoServicoEmMinutos(servico), outro.horario, outro.duracaoMinutos ?? duracaoServicoEmMinutos(outro.servico)))) {
      throw new Error("Este horário está ocupado por um serviço incompatível.");
    }
    const cliente = clienteSnap.val() as Cliente & Usuario & { imagem?: string };
    const empresaSnap = await get(ref(db, `empresas/${servico.idEmpresa}`));
    if (!empresaSnap.exists()) throw new Error("Empresa não encontrada");

    const agendamentoRef = ref(db, "agendamentos");
    const newAgendamentoRef = push(agendamentoRef);
    const idAgendamento = newAgendamentoRef.key!;

    const slotPath = `slots/${idServico}/${agendamento.data}/${agendamento.horario}`;
    const slotClientePath = `slotsClientes/${idCliente}/${agendamento.data}/${agendamento.horario}`;
    const configuracao = servico.configuracaoAtendimento ?? {
      modalidade: "presencial-cliente" as const,
      solicitarTelefone: false,
      placeholderObservacao: "",
    };
    const enderecoCliente = `${cliente.logradouro ?? ""}, ${cliente.numero ?? ""}${cliente.complemento ? ` - ${cliente.complemento}` : ""} - ${cliente.bairro ?? ""}, ${cliente.cidade ?? ""}/${cliente.estado ?? ""}`.trim();
    if (configuracao.modalidade === "presencial-prestador" && (!cliente.logradouro || !cliente.numero || !cliente.cidade || !cliente.estado)) {
      throw new Error("Complete seu endereço no perfil para este atendimento.");
    }
    if (configuracao.observacaoObrigatoria && !agendamento.obs.trim()) {
      throw new Error("A observação é obrigatória para este serviço.");
    }
    if (configuracao.solicitarTelefone && !(agendamento.telefoneContato || cliente.telefone)?.trim()) {
      throw new Error("Informe um telefone para contato.");
    }

    const dadosAgendamento = {
      idServico,
      idCliente,
      idEmpresa: servico.idEmpresa,
      idPrestador: empresaSnap.val().uidDono,
      data: agendamento.data,
      horario: agendamento.horario,
      status: "pendente",
      obs: agendamento.obs.trim(),
      telefoneContato: configuracao.solicitarTelefone ? (agendamento.telefoneContato || cliente.telefone || "") : "",
      enderecoCliente: configuracao.modalidade === "presencial-prestador" ? enderecoCliente : "",
      modalidadeAtendimento: configuracao.modalidade,
      duracaoMinutos: duracaoServicoEmMinutos(servico),
      servicosConflitantes: idsConflitos,
      servicosConflitantesMapa: Object.fromEntries(idsConflitos.map((id) => [id, true])),
      clienteNome: cliente.nome,
      clienteImagem: cliente.imagem ?? null,
      criadoEm: new Date().toISOString(),
    };

    // Primeiro registra a intenção do agendamento. Os índices são escritos em
    // seguida para que as regras possam conferir o agendamento real, em vez de
    // aceitarem IDs arbitrários enviados pelo navegador.
    await set(ref(db, `agendamentos/${idAgendamento}`), dadosAgendamento);

    try {
      await update(ref(db), {
      [`clientes/${idCliente}/agendamentos/${idAgendamento}`]: true,
      [`servicos/${idServico}/agendamentos/${idAgendamento}`]: true,
      ...Object.fromEntries(idsConflitos.map((id) => [`servicos/${id}/agendamentos/${idAgendamento}`, true])),
      });
    } catch (error) {
      await set(ref(db, `agendamentos/${idAgendamento}`), null);
      throw error;
    }

    const limparPendente = async () => {
      await update(ref(db), {
        [`agendamentos/${idAgendamento}`]: null,
        [`clientes/${idCliente}/agendamentos/${idAgendamento}`]: null,
        [`servicos/${idServico}/agendamentos/${idAgendamento}`]: null,
        ...Object.fromEntries(idsConflitos.map((id) => [`servicos/${id}/agendamentos/${idAgendamento}`, null])),
      });
      await Promise.all([
        runTransaction(ref(db, slotPath), (atual) => atual === idAgendamento ? null : atual),
        runTransaction(ref(db, slotClientePath), (atual) => atual === idAgendamento ? null : atual),
      ]);
    };

    const slotRef = ref(db, slotPath);
    const reserva = await runTransaction(slotRef, (atual) => atual ?? idAgendamento);
    if (!reserva.committed || reserva.snapshot.val() !== idAgendamento) {
      await limparPendente();
      throw new Error("Este horário acabou de ser reservado por outra pessoa.");
    }

    const reservaCliente = await runTransaction(ref(db, slotClientePath), (atual) => atual ?? idAgendamento);
    if (!reservaCliente.committed || reservaCliente.snapshot.val() !== idAgendamento) {
      await limparPendente();
      throw new Error("Você já possui outro agendamento neste horário.");
    }

    const requerAprovacao = configuracao.requerAprovacao ?? false;
    try {
      await update(ref(db, `agendamentos/${idAgendamento}`), { status: requerAprovacao ? "aguardando_aprovacao" : "agendado" });
    } catch (error) {
      await limparPendente();
      throw error;
    }

    if (opcoes.notificarCliente !== false) {
      await Promise.all([
        criarNotificacaoCliente(idCliente, {
          tipo: "agendamento",
          titulo: requerAprovacao ? "Solicitação de agendamento enviada" : "Agendamento confirmado",
          mensagem: requerAprovacao
            ? `Sua solicitação para ${servico.nome} em ${agendamento.data} às ${agendamento.horario} aguarda a aprovação do prestador.`
            : `${servico.nome} foi confirmado para ${agendamento.data} às ${agendamento.horario}.`,
          idAgendamento,
          idServico,
        }),
        criarNotificacaoPrestador(empresaSnap.val().uidDono, idAgendamento, {
          tipo: "agendamento",
          titulo: requerAprovacao ? "Nova solicitação de agendamento" : "Novo agendamento",
          mensagem: requerAprovacao
            ? `${cliente.nome} solicitou ${servico.nome} em ${agendamento.data} às ${agendamento.horario} e aguarda aprovação.`
            : `${cliente.nome} agendou ${servico.nome} para ${agendamento.data} às ${agendamento.horario}.`,
          idAgendamento,
          idServico,
          manterAposEncerramento: true,
        }),
      ]);
    }
    return idAgendamento;
  } catch (error) {
    console.error("Erro ao agendar serviço:", error);
    throw error;
  }
};

/* ---------------------------------------------------------------*/

export const getUsuariQueAgendou = async (idAgendamento: string): Promise<{ nomeCliente: string; imagemCliente: string | null }> => {
  const snap = await get(ref(db, `agendamentos/${idAgendamento}`));
  if (!snap.exists()) throw new Error("Agendamento não encontrado");
  const dados = snap.val();
  return {
    nomeCliente: dados.clienteNome ?? "Cliente",
    imagemCliente: dados.clienteImagem ?? null,
  };
}

/* ---------------------------------------------------------------*/

export const reagendarServico = async (agendamento: Agendamento, idCliente: string, idAgendamentoOriginal: string) => {
  const originalSnap = await get(ref(db, `agendamentos/${idAgendamentoOriginal}`));
  if (!originalSnap.exists()) throw new Error("O agendamento original não foi encontrado.");
  
  const original = originalSnap.val() as Agendamento;
  if (original.idCliente !== idCliente) throw new Error("Você não pode reagendar este agendamento.");
  if (!original.idPrestador) throw new Error("Prestador do agendamento original não encontrado.");
  
  const idServico = agendamento.idServico ?? agendamento.servico?.id;
  if (!idServico) throw new Error("Serviço do novo agendamento não encontrado.");

  const novoId = await agendarServico(agendamento, idCliente, { notificarCliente: false });
  try {
    await cancelarAgendamento(idAgendamentoOriginal, { notificar: false });
  } catch (error) {
    await cancelarAgendamento(novoId, { notificar: false });
    throw error;
  }

  // Usa o prestador gravado no novo agendamento. Assim a permissão da notificação
  // sempre é validada contra a reserva que acabou de ser criada.
  const novoAgendamentoSnap = await get(ref(db, `agendamentos/${novoId}`));
  const idPrestador = novoAgendamentoSnap.val()?.idPrestador ?? original.idPrestador;
  const nomeServico = agendamento.servico?.nome ?? "Serviço";
  const periodoAnterior = `${original.data} às ${original.horario}`;
  const periodoNovo = `${agendamento.data} às ${agendamento.horario}`;
  const notificacoes = await Promise.allSettled([
    criarNotificacaoCliente(idCliente, { tipo: "agendamento", titulo: "Agendamento reagendado", mensagem: `${nomeServico} foi reagendado de ${periodoAnterior} para ${periodoNovo}.`, idAgendamento: novoId, idServico }),
    criarNotificacaoPrestador(idPrestador, novoId, { tipo: "agendamento", titulo: "Agendamento reagendado pelo cliente", mensagem: `${original.clienteNome ?? "O cliente"} reagendou ${nomeServico} de ${periodoAnterior} para ${periodoNovo}.`, idAgendamento: novoId, idServico, manterAposEncerramento: true }),
  ]);
  // A reserva já foi concluída neste ponto. Uma falha isolada de notificação não
  // deve exibir erro nem fazer o cliente acreditar que o reagendamento falhou.
  notificacoes.forEach((resultado) => {
    if (resultado.status === "rejected") console.error("Não foi possível registrar uma notificação de reagendamento:", resultado.reason);
  });
  return novoId;
};

/* ---------------------------------------------------------------*/

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

/* ---------------------------------------------------------------*/

export const responderAgendamento = async (idAgendamento: string, aprovar: boolean) => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");
  const snapshot = await get(ref(db, `agendamentos/${idAgendamento}`));
  if (!snapshot.exists()) throw new Error("Agendamento não encontrado");
  const agendamento = snapshot.val() as Agendamento;
  if (agendamento.idPrestador !== uid || agendamento.status !== "aguardando_aprovacao") throw new Error("Você não pode responder este agendamento.");

  if (aprovar) {
    await update(ref(db, `agendamentos/${idAgendamento}`), { status: "agendado" });
    await criarNotificacaoCliente(agendamento.idCliente!, { tipo: "agendamento", titulo: "Agendamento aprovado", mensagem: `${agendamento.servico?.nome ?? "Seu serviço"} foi aprovado pelo prestador.`, idAgendamento, idServico: agendamento.idServico });
    return;
  }

  await update(ref(db), {
    [`agendamentos/${idAgendamento}/status`]: "recusado",
    [`clientes/${agendamento.idCliente}/agendamentos/${idAgendamento}`]: null,
    [`servicos/${agendamento.idServico}/agendamentos/${idAgendamento}`]: null,
    ...Object.fromEntries((agendamento.servicosConflitantes ?? []).map((id) => [`servicos/${id}/agendamentos/${idAgendamento}`, null])),
    [`slots/${agendamento.idServico}/${agendamento.data}/${agendamento.horario}`]: null,
    [`slotsClientes/${agendamento.idCliente}/${agendamento.data}/${agendamento.horario}`]: null,
  });
  await criarNotificacaoCliente(agendamento.idCliente!, { tipo: "agendamento", titulo: "Agendamento recusado", mensagem: `${agendamento.servico?.nome ?? "Seu serviço"} não foi aprovado pelo prestador.`, idAgendamento, idServico: agendamento.idServico });
};

/* -----------------------------------------------------------------------------*/
/*                             SESSÃO NOTIFICAÇÃO                               */
/* -----------------------------------------------------------------------------*/

const criarNotificacaoCliente = async (idCliente: string, notificacao: Omit<import("../firebase/types").Notificacao, "id" | "criadoEm" | "lida">) => {
  const novaRef = push(ref(db, `clientes/${idCliente}/notificacoes`));
  await set(novaRef, { ...notificacao, criadoEm: Date.now(), lida: false });
};

const criarNotificacaoPrestador = async (idPrestador: string, idAgendamento: string, notificacao: Omit<import("../firebase/types").Notificacao, "id" | "criadoEm" | "lida">) => {
  await set(ref(db, `prestadores/${idPrestador}/notificacoes/${idAgendamento}`), { ...notificacao, criadoEm: Date.now(), lida: false, idAgendamento });
};