import { db } from "./config";
import { ref, set, push, get} from "firebase/database";
import type { Servico } from "./types";
import { getAuth } from "firebase/auth";

/* -----------------------------------------------------------------------------*/

export const criarServico = async (item: Servico, idEmpresa: string) => {
  try {
    // 1. Cria uma nova referência com um ID único no nó global 'servicos'
    const itemListRef = ref(db, 'servicos');
    const newItemRef = push(itemListRef);
    const idServico = newItemRef.key!;
    
    // 2. Salva os dados do serviço (incluindo o idEmpresa para referência reversa)
    await set(newItemRef, {
      ...item,
      idEmpresa: idEmpresa // opcional, mas boa prática para saber a quem o serviço pertence
    });
    
    // 3. Salva o ID do serviço dentro do nó da empresa selecionada
    // Isso cria a lista: empresas -> {idEmpresa} -> servicos -> {idServico}: true
    const empresaServicoRef = ref(db, `empresas/${idEmpresa}/servicos/${idServico}`);
    await set(empresaServicoRef, true);

    return idServico;
  } catch (error) {
    console.error("Erro ao salvar no Realtime Database:", error);
    throw error;
  }
};

/* -----------------------------------------------------------------------------*/

// Pega as empresas de um prestador
export const getEmpresasDoPrestador = async (): Promise<{ id: string; nome: string }[]> => {
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
    })
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

export const getServicosDaEmpresa = async (idEmpresa: string): Promise<Servico[]> => {
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
      })
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