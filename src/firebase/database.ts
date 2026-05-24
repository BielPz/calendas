import { db } from "./config";
import { ref, set, push, get, remove } from "firebase/database";
import type { Agendamento, Servico } from "./types";
import { getAuth, updateProfile } from "firebase/auth";

/* -----------------------------------------------------------------------------*/

export const criarServico = async (item: Servico, idEmpresa: string) => {
  try {
    // 1. Cria uma nova referência com um ID único no nó global 'servicos'
    const itemListRef = ref(db, "servicos");
    const newItemRef = push(itemListRef);
    const idServico = newItemRef.key!;

    // 2. Salva os dados do serviço (incluindo o idEmpresa para referência reversa)
    await set(newItemRef, {
      ...item,
      idEmpresa: idEmpresa, // opcional, mas boa prática para saber a quem o serviço pertence
    });

    // 3. Salva o ID do serviço dentro do nó da empresa selecionada
    // Isso cria a lista: empresas -> {idEmpresa} -> servicos -> {idServico}: true
    const empresaServicoRef = ref(
      db,
      `empresas/${idEmpresa}/servicos/${idServico}`,
    );
    await set(empresaServicoRef, true);

    return idServico;
  } catch (error) {
    console.error("Erro ao salvar no Realtime Database:", error);
    throw error;
  }
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

export const getTodosServicos = async (): Promise<Servico[]> => {
  try {
    const snapshot = await get(ref(db, "servicos"));
    if (!snapshot.exists()) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(snapshot.val()).map(([id, dados]: any) => ({
      id,
      ...dados,
    }));
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
  const {
    uid: _u,
    dataCadastro: _dc,
    email: _e,
    tipo: _t,
    senha: _s,
    ...editaveis
  } = dadosEditados as Record<string, string>;

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

  if (horariosDisponiveis.length === 0) {
    const diasNoMes = new Date(ano, mes, 0).getDate();
    return Object.fromEntries(
      Array.from({ length: diasNoMes }, (_, i) => [i + 1, "sem-horario"]),
    );
  }

  const agendadosPorDia: Record<string, Set<string>> = {};
  for (const ag of agendamentos) {
    if (!agendadosPorDia[ag.data]) agendadosPorDia[ag.data] = new Set();
    agendadosPorDia[ag.data].add(ag.horario);
  }

  const resultado: Record<number, "sem-horario" | "parcial" | "disponivel"> = {};
  const diasNoMes = new Date(ano, mes, 0).getDate();

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const diaSemana = new Date(ano, mes - 1, dia).getDay();
    const diaDisponivel = servico.diasDisponiveis[diaSemana];

    if (!diaDisponivel?.ativo) {
      resultado[dia] = "sem-horario";
      continue;
    }

    const dataStr = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const agendadosNoDia = agendadosPorDia[dataStr] ?? new Set<string>();
    const slotsOcupados = horariosDisponiveis.filter((h) => agendadosNoDia.has(h)).length;

    if (slotsOcupados === 0) resultado[dia] = "disponivel";
    else if (slotsOcupados >= horariosDisponiveis.length) resultado[dia] = "sem-horario";
    else resultado[dia] = "parcial";
  }

  return resultado;
};

/* -----------------------------------------------------------------------------*/

// Agenda um serviço para um cliente, salvando no nó "agendamentos" e associando ao cliente e prestador
export const agendarServico = async (
  agendamento: Agendamento,
  idCliente: string,
) => {
  try {
    // 1. Cria um novo agendamento com ID único
    const agendamentoRef = ref(db, "agendamentos");
    const newAgendamentoRef = push(agendamentoRef);
    const idAgendamento = newAgendamentoRef.key!;

    // 2. Salva os dados do agendamento (incluindo referências ao serviço, cliente e prestador)
    const { servico, data, horario, obs } = agendamento;
    const idServico = servico.id!;
    await set(newAgendamentoRef, {
      idServico,
      idCliente,
      data,
      horario,
      status: "agendado",
      obs,
    });

    // 3. Associa o agendamento ao cliente (para facilitar consultas futuras do cliente)
    try {
      const clienteAgendamentoRef = ref(
        db,
        `clientes/${idCliente}/agendamentos/${idAgendamento}`,
      );
      await set(clienteAgendamentoRef, true);
    } catch (error) {
      console.error("Erro ao associar agendamento ao cliente:", error);
      // Remover o agendamento criado se essa associação falhar
      await remove(newAgendamentoRef);
    }

    // 4. Associa o agendamento ao serviço (para facilitar consultas futuras do prestador)
    try {
      const servicoAgendamentoRef = ref(
        db,
        `servicos/${idServico}/agendamentos/${idAgendamento}`,
      );
      await set(servicoAgendamentoRef, true);
    } catch (error) {
      console.error("Erro ao associar agendamento ao serviço:", error);
      // Remover o agendamento criado e a associação com o cliente se essa associação falhar
      await remove(newAgendamentoRef);
      await remove(
        ref(db, `clientes/${idCliente}/agendamentos/${idAgendamento}`),
      );
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

    const data = snapshot.val() as Record<string, Agendamento>;
    return Object.entries(data).map(([id, ag]) => ({ ...ag, id }));
  } catch (error) {
    console.error("Erro ao buscar agendamentos do serviço:", error);
    return [];
  }
};

/* -----------------------------------------------------------------------------*/

// buscar um agendamento específico
export const getAgendamento = async (idAgendamento: string): Promise<Agendamento | null> => {
  try {
    const agendamentoRef = ref(db, `agendamentos/${idAgendamento}`);
    const snapshot = await get(agendamentoRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.val() as Agendamento;
    return { ...data, id: idAgendamento };
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return null;
  }
};
