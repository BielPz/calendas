import { db } from "../firebase/config";
import { ref, set, push, get, update, runTransaction } from "firebase/database";
import type { Agendamento, AvaliacaoServico, Cliente, Servico, Usuario } from "../firebase/types";
import { getAuth, updateProfile } from "firebase/auth";
import { getTipoUsuario } from "./auth.repository";
import { calcularDisponibilidadeDiaria, calcularDisponibilidadeMensal } from "../lib/disponibilidade";
import { duracaoServicoEmMinutos, estaDentroDoFuncionamento, horariosSeSobrepoem } from "../lib/agenda";
import { consultarComCache, invalidarConsultas } from "./consulta.cache";

/* -----------------------------------------------------------------------------*/
/*                             SESSÃO USUÁRIO                                   */
/* -----------------------------------------------------------------------------*/

// Atualiza os dados de perfil de um cliente ou prestador
// Campos protegidos (uid, dataCadastro, email, tipo) nunca são sobrescritos
export const atualizarPerfil = async (
  tipo: "cliente" | "prestador",
  dadosEditados: Record<string, string>,
): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("Usuário não logado");

  const colecao = tipo === "cliente" ? "clientes" : "prestadores";
  const dbRef = ref(db, `${colecao}/${user.uid}`);

  const snap = await get(dbRef);
  if (!snap.exists()) throw new Error("Perfil não encontrado no banco.");

  // 1. Atualizar o Firebase Auth se o nome foi alterado
  if (dadosEditados.nome && dadosEditados.nome !== user.displayName) {
    await updateProfile(user, { displayName: dadosEditados.nome });
  }

  // 2. Preparar dados para o Realtime Database
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { uid: _u, dataCadastro: _dc, email: _e, tipo: _t, senha: _s, ...editaveis } = dadosEditados;

  await set(dbRef, {
    ...snap.val(),
    ...editaveis,
  });
};

/* -----------------------------------------------------------------------------*/

export const getFavoritos = async (): Promise<string[]> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return [];
  const snap = await get(ref(db, `clientes/${uid}/favoritos`));
  if (!snap.exists()) return [];
  return Object.keys(snap.val());
};

/* -----------------------------------------------------------------------------*/

export const toggleFavorito = async (idServico: string): Promise<boolean> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");
  const favRef = ref(db, `clientes/${uid}/favoritos/${idServico}`);
  const snap = await get(favRef);
  if (snap.exists()) {
    await update(ref(db), { [`clientes/${uid}/favoritos/${idServico}`]: null, [`servicos/${idServico}/favoritos/${uid}`]: null });
    return false;
  } else {
    await update(ref(db), { [`clientes/${uid}/favoritos/${idServico}`]: true, [`servicos/${idServico}/favoritos/${uid}`]: true });
    return true;
  }
};

/* -----------------------------------------------------------------------------*/

/** Exclui a conta do usuário (cliente ou prestador) e todos os dados associados a ela */ 
export const excluirConta = async (tipo: "cliente" | "prestador") => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não logado");

  const colecao = tipo === "cliente" ? "clientes" : "prestadores";
  const dbRef = ref(db, `${colecao}/${user.uid}`);

  try {
    // 1. Deleta o Auth primeiro — se falhar, banco continua intacto
    await user.delete();

    // 2. Remove os dados do banco
    await set(dbRef, null);
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
    const mensagens: Record<string, string> = {
      "auth/requires-recent-login":
        "Por segurança, faça login novamente antes de excluir a conta.",
      "auth/network-request-failed":
        "Sem conexão. Verifique sua internet e tente novamente.",
    };

    const mensagem = mensagens[code] ?? "Erro ao excluir conta. Tente novamente.";
    throw new Error(mensagem); // propaga para o chamador exibir o alerta
  }
};

/* -----------------------------------------------------------------------------*/
/*                              SESSÃO PRESTADOR                                */
/* -----------------------------------------------------------------------------*/

export const getEmpresasDoPrestador = async (): Promise<
  { id: string; nome: string }[]
> => {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");

  // Busca a lista de IDs das empresas do prestador
  const idsSnap = await get(ref(db, `prestadores/${uid}/empresas`));
  if (!idsSnap.exists()) return [];

  const ids = Object.keys(idsSnap.val());

  // Busca os dados de cada empresa
  const empresas = await Promise.all(
    ids.map(async (id) => {
      const snap = await get(ref(db, `empresas/${id}`));
      return { id, nome: snap.val()?.nome ?? "Sem nome" };
    }),
  );

  return empresas;
};

/* -----------------------------------------------------------------------------*/
/*                               SESSÃO EMPRESA                                 */
/* -----------------------------------------------------------------------------*/

export const getEmpresaPorId = async (id: string) => {
  return consultarComCache(`empresa:${id}`, async () => {
    const snap = await get(ref(db, `empresas/${id}`));
    return snap.exists() ? snap.val() : null;
  }, 30_000);
};

/* ---------------------------------------------------------------*/

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

export const criarServico = async (item: Servico, idEmpresa: string) => {
  try {
    // 1. Cria uma nova referência com um ID único no nó global 'servicos'
    const itemListRef = ref(db, "servicos");
    const newItemRef = push(itemListRef);
    const idServico = newItemRef.key!;

    const servico = {
      ...item,
      idEmpresa,
    };

    await update(ref(db), {
      [`servicos/${idServico}`]: servico,
      [`empresas/${idEmpresa}/servicos/${idServico}`]: true,
    });
    invalidarConsultas("servicos:");
    invalidarConsultas(`empresa:${idEmpresa}`);

    return idServico;
  } catch (error) {
    console.error("Erro ao salvar no Realtime Database:", error);
    throw error;
  }
};

/* ---------------------------------------------------------------*/

export const getServico = async (idServico: string) => {
  return consultarComCache(`servico:${idServico}`, async () => {
    const snap = await get(ref(db, `servicos/${idServico}`));
    return snap.exists() ? comResumoAvaliacoes(idServico, snap.val()) : null;
  });
};

/* ---------------------------------------------------------------*/

export const getTodosServicos = async (): Promise<Servico[]> => {
  return consultarComCache("servicos:todos", async () => {
    try {
    const snapshot = await get(ref(db, "servicos"));
    if (!snapshot.exists()) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(snapshot.val()).map(([id, dados]: any) =>
      comResumoAvaliacoes(id, dados),
    );
    } catch (error) {
    console.error("Erro ao buscar serviços:", error);
      return [];
    }
  }, 15_000);
};

/* ---------------------------------------------------------------*/

export const atualizarServico = async (idServico: string, dados: Partial<Servico>) => {
  const camposEditaveis = { ...dados };
  delete camposEditaveis.id;
  delete camposEditaveis.avaliacoes;
  delete camposEditaveis.avaliacaoMedia;
  delete camposEditaveis.totalAvaliacoes;
  await update(ref(db, `servicos/${idServico}`), camposEditaveis);
};

/* ---------------------------------------------------------------*/

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

/** Busca um agendamento específico */
export const getAgendamento = async (
  idAgendamento: string,
): Promise<Agendamento | null> => {
  try {
    const agendamentoRef = ref(db, `agendamentos/${idAgendamento}`);
    const snapshot = await get(agendamentoRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.val() as Agendamento;
    return data.status === "pendente" ? null : { ...data, id: idAgendamento };
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return null;
  }
};

/* ---------------------------------------------------------------*/

/** Pega todos os agendamentos de um serviço específico (para o prestador ver os agendamentos do serviço)*/
export const getAgendamentosDoServico = async (
  idServico: string,
): Promise<Agendamento[]> => {
  try {
    const agendamentosRef = ref(db, `servicos/${idServico}/agendamentos`);
    const snapshot = await get(agendamentosRef);
    if (!snapshot.exists()) return [];

    const [servicoSnap, agendamentos] = await Promise.all([
      get(ref(db, `servicos/${idServico}`)),
      Promise.all(
        Object.keys(snapshot.val() as Record<string, true>).map(async (id) => {
          const agendamentoSnap = await get(ref(db, `agendamentos/${id}`));
          return agendamentoSnap.exists()
            ? { id, ...agendamentoSnap.val() }
            : null;
        }),
      ),
    ]);
    if (!servicoSnap.exists()) return [];

    const servico = { id: idServico, ...servicoSnap.val() } as Servico;
    return agendamentos
      .filter((ag): ag is Record<string, unknown> => ag !== null)
      .map((ag) => ({ ...ag, servico } as Agendamento))
      .filter((ag) => ag.status !== "pendente");
  } catch (error) {
    console.error("Erro ao buscar agendamentos do serviço:", error);
    return [];
  }
};

/* ---------------------------------------------------------------*/

/** Busca agendamentos do cliente
 *  @returns Promise<Agendamento[]> pois um usuário pode ter vários agendamentos
 */
export const getAgendamentosCliente = async (
  id: string,
): Promise<Agendamento[]> => {
  try {
    // Busca os IDs dos agendamentos do cliente
    const idsSnap = await get(ref(db, `clientes/${id}/agendamentos`));
    if (!idsSnap.exists()) return [];

    const ids = Object.keys(idsSnap.val() as Record<string, true>);

    // Busca os dados de cada agendamento em paralelo
    const agendamentos = await Promise.all(
      ids.map(async (idAg) => {
        try {
          const snap = await get(ref(db, `agendamentos/${idAg}`));
          if (!snap.exists()) return null;
          const data = snap.val();

          // buscar o serviço pelo idServico
          const ServicoSnap = await get(ref(db, `servicos/${data.idServico}`));
          const servico = ServicoSnap.exists()
            ? ({ id: data.idServico, ...ServicoSnap.val() } as Servico)
            : null;

          if (!servico) return null;

          return { id: idAg, ...data, servico } as Agendamento;
        } catch (error) {
          // Referências antigas podem apontar para um agendamento já removido.
          // Elas não devem impedir o carregamento dos demais itens da agenda.
          console.warn("Índice de agendamento do cliente ignorado:", idAg, error);
          return null;
        }
      }),
    );

    return agendamentos.filter((ag): ag is Agendamento => ag !== null && ag.status !== "pendente");
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    return [];
  }
};

/* ---------------------------------------------------------------*/

/** Busca agendamentos do Prestador */
export const getAgendamentosPrestador = async (
  id: string,
): Promise<Agendamento[]> => {
  try {
    // Busca as empresas do prestador
    const empresasSnap = await get(ref(db, `prestadores/${id}/empresas`));
    if (!empresasSnap.exists()) return [];

    const idEmpresas = Object.keys(empresasSnap.val() as Record<string, true>);

    // Para cada empresa, busca os IDs dos serviços
    const idServicos = (
      await Promise.all(
        idEmpresas.map(async (idEmpresa) => {
          const snap = await get(ref(db, `empresas/${idEmpresa}/servicos`));
          if (!snap.exists()) return [];
          return Object.keys(snap.val() as Record<string, true>);
        }),
      )
    ).flat();

    // Para cada serviço, busca os agendamentos
    const agendamentos = (
  await Promise.all(
    idServicos.map(async (idServico) => {
      const [agSnap, servicoSnap] = await Promise.all([
        get(ref(db, `servicos/${idServico}/agendamentos`)),
        get(ref(db, `servicos/${idServico}`)),
      ]);
      if (!agSnap.exists()) return [];

      const servico = servicoSnap.exists()
        ? ({ id: idServico, ...servicoSnap.val() } as Servico)
        : null;

      if (!servico) return [];

      // agendamentos do serviço são apenas { idAg: true } — dados reais estão em agendamentos/{idAg}
      const ids = Object.keys(agSnap.val() as Record<string, true>);

      const agendamentosDoServico = await Promise.all(
        ids.map(async (idAg) => {
          try {
            const snap = await get(ref(db, `agendamentos/${idAg}`));
            if (!snap.exists()) return null;
            return { id: idAg, ...snap.val(), servico } as Agendamento;
          } catch (error) {
            // Um índice antigo não pode impedir que os outros agendamentos
            // válidos da empresa sejam carregados.
            console.warn("Índice de agendamento ignorado:", idAg, error);
            return null;
          }
        }),
      );

      return agendamentosDoServico.filter((ag): ag is Agendamento => ag !== null);
    }),
  )
).flat();

    // Um agendamento com conflito é indexado em todos os serviços envolvidos.
    // Na agenda geral do prestador ele precisa existir uma única vez, preservando
    // o serviço em que foi efetivamente criado (idServico).
    const agendamentosUnicos = new Map<string, Agendamento>();
    agendamentos.forEach((agendamento) => {
      if (!agendamento.id) return;
      const existente = agendamentosUnicos.get(agendamento.id);
      const pertenceAoServicoOriginal = agendamento.idServico === agendamento.servico.id;
      const existenteEhOriginal = existente?.idServico === existente?.servico.id;
      if (!existente || (pertenceAoServicoOriginal && !existenteEhOriginal)) {
        agendamentosUnicos.set(agendamento.id, agendamento);
      }
    });

    return [...agendamentosUnicos.values()].filter((agendamento) => agendamento.status !== "pendente");
  } catch (error) {
    console.error("Erro ao buscar agendamentos do prestador:", error);
    return [];
  }
};

/* ---------------------------------------------------------------*/

/** Busca agendamentos do usuário */
export const getAgendamentosUsuario = async (
  id: string,
): Promise<Agendamento[]> => {
  try {
    const tipo = await getTipoUsuario();
    return tipo === "cliente"
      ? getAgendamentosCliente(id)
      : getAgendamentosPrestador(id);
  } catch (error) {
    console.error("Erro ao buscar agendamentos do usuário:", error);
    return [];
  }
};

/* ---------------------------------------------------------------*/

export const getUsuarioQueAgendou = async (idAgendamento: string): Promise<{ nomeCliente: string; imagemCliente: string | null }> => {
  const snap = await get(ref(db, `agendamentos/${idAgendamento}`));
  if (!snap.exists()) throw new Error("Agendamento não encontrado");
  const dados = snap.val();
  return {
    nomeCliente: dados.clienteNome ?? "Cliente",
    imagemCliente: dados.clienteImagem ?? null,
  };
}

/* ---------------------------------------------------------------*/

// Calcula a disponibilidade mensal de um serviço, considerando os horários disponíveis e os agendamentos já feitos
export const getDisponibilidadeMensal = async (
  idServico: string,
  ano: number,
  mes: number,
  horariosDisponiveis: string[],
  agendamentos: Agendamento[],
): Promise<Record<number, "sem-horario" | "parcial" | "disponivel">> => {
  const servicoSnap = await get(ref(db, `servicos/${idServico}`));
  if (!servicoSnap.exists()) return {};
  const servico = servicoSnap.val() as Servico;

  return calcularDisponibilidadeMensal(servico, ano, mes, horariosDisponiveis, agendamentos);
};

/* -----------------------------------------------------------------------------*/

// Calcula a disponibilidade diária de um serviço, considerando os horários disponíveis e os agendamentos já feitos
export const getDisponibilidadeDiaria = async (
  idServico: string,
  data: string,
  horariosDisponiveis: string[],
  agendamentos: Agendamento[],
): Promise<Record<string, { label: string; value: string } | null>> => {
  const servicoSnap = await get(ref(db, `servicos/${idServico}`));
  if (!servicoSnap.exists()) return {};
  const servico = servicoSnap.val() as Servico;
  return calcularDisponibilidadeDiaria(servico, data, horariosDisponiveis, agendamentos);
};

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

/* ---------------------------------------------------------------*/

export const getNotificacoesCliente = async (idCliente: string) => {
  const limite = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const snapshot = await get(ref(db, `clientes/${idCliente}/notificacoes`));
  if (!snapshot.exists()) return [];
  const itens = Object.entries(snapshot.val() as Record<string, import("../firebase/types").Notificacao>)
    .map(([id, dados]) => ({ id, ...dados }))
    .sort((a, b) => b.criadoEm - a.criadoEm);
  const expiradas = itens.filter((item) => item.criadoEm < limite);
  if (expiradas.length) await update(ref(db), Object.fromEntries(expiradas.map((item) => [`clientes/${idCliente}/notificacoes/${item.id}`, null])));
  const atualizadas = await Promise.all(itens.map(async (item) => {
    if (!item.idServico) return item;
    const servico = await get(ref(db, `servicos/${item.idServico}`));
    const nomeServico = servico.val()?.nome;
    return nomeServico && !item.mensagem.toLocaleLowerCase("pt-BR").includes(nomeServico.toLocaleLowerCase("pt-BR")) ? { ...item, mensagem: `${nomeServico}: ${item.mensagem}` } : item;
  }));
  const comNomeIncluido = atualizadas.filter((item, indice) => item.mensagem !== itens[indice].mensagem);
  if (comNomeIncluido.length) await update(ref(db), Object.fromEntries(comNomeIncluido.map((item) => [`clientes/${idCliente}/notificacoes/${item.id}/mensagem`, item.mensagem])));
  return atualizadas.filter((item) => item.criadoEm >= limite);
};

/* ---------------------------------------------------------------*/

export const getNotificacoesPrestador = async (idPrestador: string) => {
  const limite = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const snapshot = await get(ref(db, `prestadores/${idPrestador}/notificacoes`));
  if (!snapshot.exists()) return [];
  const itens = Object.entries(snapshot.val() as Record<string, import("../firebase/types").Notificacao>).map(([id, dados]) => ({ id, ...dados })).sort((a, b) => b.criadoEm - a.criadoEm);
  const expiradas = itens.filter((item) => item.criadoEm < limite);
  const ativas = itens.filter((item) => item.criadoEm >= limite);
  if (expiradas.length) await update(ref(db), Object.fromEntries(expiradas.map((item) => [`prestadores/${idPrestador}/notificacoes/${item.id}`, null])));
  const comNomeServico = await Promise.all(ativas.map(async (item) => {
    if (!item.idServico) return item;
    const servico = await get(ref(db, `servicos/${item.idServico}`));
    const nomeServico = servico.val()?.nome;
    return nomeServico && !item.mensagem.toLocaleLowerCase("pt-BR").includes(nomeServico.toLocaleLowerCase("pt-BR")) ? { ...item, mensagem: `${nomeServico}: ${item.mensagem}` } : item;
  }));
  const mensagensAtualizadas = comNomeServico.filter((item, indice) => item.mensagem !== ativas[indice].mensagem);
  if (mensagensAtualizadas.length) await update(ref(db), Object.fromEntries(mensagensAtualizadas.map((item) => [`prestadores/${idPrestador}/notificacoes/${item.id}/mensagem`, item.mensagem])));
  return comNomeServico;
};

/* ---------------------------------------------------------------*/

export const marcarNotificacaoLida = async (idCliente: string, idNotificacao: string) => update(ref(db, `clientes/${idCliente}/notificacoes/${idNotificacao}`), { lida: true });

export const marcarNotificacaoPrestadorLida = async (idPrestador: string, idNotificacao: string) => update(ref(db, `prestadores/${idPrestador}/notificacoes/${idNotificacao}`), { lida: true });

/* ---------------------------------------------------------------*/

export const excluirNotificacao = async (idCliente: string, idNotificacao: string) => set(ref(db, `clientes/${idCliente}/notificacoes/${idNotificacao}`), null);

export const excluirNotificacaoPrestador = async (idPrestador: string, idNotificacao: string) => set(ref(db, `prestadores/${idPrestador}/notificacoes/${idNotificacao}`), null);

/* -----------------------------------------------------------------------------*/
/*                             SESSÃO AVALIACOES                                */
/* -----------------------------------------------------------------------------*/

const comResumoAvaliacoes = (id: string, dados: Omit<Servico, "id">): Servico => {
  const avaliacoes = Object.values(dados.avaliacoes ?? {}).filter(
    (avaliacao): avaliacao is AvaliacaoServico =>
      Number.isInteger(avaliacao?.nota) && avaliacao.nota >= 1 && avaliacao.nota <= 5,
  );
  const totalAvaliacoes = avaliacoes.length;
  const avaliacaoMedia = totalAvaliacoes
    ? avaliacoes.reduce((total, avaliacao) => total + avaliacao.nota, 0) / totalAvaliacoes
    : 0;

  return { id, ...dados, avaliacaoMedia, totalAvaliacoes };
};

/* -----------------------------------------------------------------------------*/

export const salvarAvaliacaoServico = async (
  idServico: string,
  nota: number,
  comentario: string,
): Promise<void> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw new Error("Escolha uma nota entre 1 e 5 estrelas.");
  }
  const clienteSnap = await get(ref(db, `clientes/${uid}`));
  const nomeAutor = String(clienteSnap.val()?.nome ?? getAuth().currentUser?.displayName ?? "Cliente").trim() || "Cliente";

  await set(ref(db, `servicos/${idServico}/avaliacoes/${uid}`), {
    nota,
    comentario: comentario.trim(),
    atualizadoEm: Date.now(),
    nomeAutor,
  });
};