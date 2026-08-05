import { db } from "../firebase/config";
import { ref, set, push, get, update, runTransaction } from "firebase/database";
import type { Agendamento, AvaliacaoServico, Cliente, Servico, Usuario } from "../firebase/types";
import { getAuth, updateProfile } from "firebase/auth";
import { getTipoUsuario } from "./auth.repository";
import { calcularDisponibilidadeDiaria, calcularDisponibilidadeMensal } from "../lib/disponibilidade";
import { duracaoServicoEmMinutos, estaDentroDoFuncionamento, horariosSeSobrepoem } from "../lib/agenda";

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

    return idServico;
  } catch (error) {
    console.error("Erro ao salvar no Realtime Database:", error);
    throw error;
  }
};

export const cancelarAgendamento = async (idAgendamento: string): Promise<void> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");

  const agendamentoSnap = await get(ref(db, `agendamentos/${idAgendamento}`));
  if (!agendamentoSnap.exists()) throw new Error("Agendamento não encontrado");

  const agendamento = agendamentoSnap.val();
  if (agendamento.idCliente !== uid && agendamento.idPrestador !== uid) {
    throw new Error("Você não tem permissão para cancelar este agendamento.");
  }

  await update(ref(db), {
    [`agendamentos/${idAgendamento}`]: null,
    [`clientes/${agendamento.idCliente}/agendamentos/${idAgendamento}`]: null,
    [`servicos/${agendamento.idServico}/agendamentos/${idAgendamento}`]: null,
    ...Object.fromEntries((agendamento.servicosConflitantes ?? []).map((id: string) => [`servicos/${id}/agendamentos/${idAgendamento}`, null])),
    [`slots/${agendamento.idServico}/${agendamento.data}/${agendamento.horario}`]: null,
    [`slotsClientes/${agendamento.idCliente}/${agendamento.data}/${agendamento.horario}`]: null,
  });
};

/* -----------------------------------------------------------------------------*/

// buscar serviço especifico

export const getServico = async (idServico: string) => {
  const snap = await get(ref(db, `servicos/${idServico}`));
  if (snap.exists()) {
    return comResumoAvaliacoes(idServico, snap.val());
  }
  return null;
};

/* -----------------------------------------------------------------------------*/

// Pega as empresas de um prestador
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

// Pega a empresa or ID
export const getEmpresaPorId = async (id: string) => {
  const snap = await get(ref(db, `empresas/${id}`));
  if (snap.exists()) {
    return snap.val();
  }
  return null;
};

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
        return snap.exists() ? comResumoAvaliacoes(id, snap.val()) : null;
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

export const getTodosServicos = async (): Promise<Servico[]> => {
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
};

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

/* -----------------------------------------------------------------------------*/

// Agenda um serviço para um cliente, salvando no nó "agendamentos" e associando ao cliente e prestador
export const agendarServico = async (
  agendamento: Agendamento,
  idCliente: string,
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

    try {
      await update(ref(db, `agendamentos/${idAgendamento}`), { status: "agendado" });
    } catch (error) {
      await limparPendente();
      throw error;
    }

    return idAgendamento;
  } catch (error) {
    console.error("Erro ao agendar serviço:", error);
    throw error;
  }
};

/* -----------------------------------------------------------------------------*/

// pegar todos os agendamentos de um serviço específico (para o prestador ver os agendamentos do serviço)
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

/* -----------------------------------------------------------------------------*/

// buscar um agendamento específico
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

/* -----------------------------------------------------------------------------*/

// buscar agendamentos do cliente
// Retorna Promise<Agendamento[]> pois um usuário pode ter vários agendamentos
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

/* -----------------------------------------------------------------------------*/

// buscar agendamentos do Prestador
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

/* -----------------------------------------------------------------------------*/

export const getUsuarioQueAgendou = async (idAgendamento: string,): Promise<{ nomeCliente: string; imagemCliente: string | null }> => {
  const snap = await get(ref(db, `agendamentos/${idAgendamento}`));
  if (!snap.exists()) throw new Error("Agendamento não encontrado");
  const dados = snap.val();
  return {
    nomeCliente: dados.clienteNome ?? "Cliente",
    imagemCliente: dados.clienteImagem ?? null,
  };
};

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

  const servico = servicoSnap.val() as Servico & { agendamentos?: Record<string, true> };
  if (servico.agendamentos && Object.keys(servico.agendamentos).length > 0) {
    throw new Error("Este serviço possui agendamentos. Cancele ou conclua os atendimentos antes de excluí-lo.");
  }
  if (!servico.idEmpresa) throw new Error("Empresa do serviço não encontrada.");

  await update(ref(db), {
    [`servicos/${idServico}`]: null,
    [`empresas/${servico.idEmpresa}/servicos/${idServico}`]: null,
  });
};

/* -----------------------------------------------------------------------------*/

// buscar agendamentos do usuário
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

/* -----------------------------------------------------------------------------*/
 
// Favoritos: clientes/{uid}/favoritos/{idServico}: true
// Simples e eficiente — leitura O(1) por serviço, sem duplicação
 
export const getFavoritos = async (): Promise<string[]> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return [];
  const snap = await get(ref(db, `clientes/${uid}/favoritos`));
  if (!snap.exists()) return [];
  return Object.keys(snap.val());
};
 
export const toggleFavorito = async (idServico: string): Promise<boolean> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");
  const favRef = ref(db, `clientes/${uid}/favoritos/${idServico}`);
  const snap = await get(favRef);
  if (snap.exists()) {
    await set(favRef, null); // remove
    return false;
  } else {
    await set(favRef, true); // adiciona
    return true;
  }
};

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

/* -----------------------------------------------------------------------------*/

// Exclui a conta do usuário (cliente ou prestador) e todos os dados associados a ela
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

