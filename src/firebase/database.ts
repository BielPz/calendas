import { db } from "./config";
import { ref, set, push, get} from "firebase/database";
import type { Servico } from "./types";
import { getAuth } from "firebase/auth";

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

export const getEmpresaPorId = async (id: string) => {
  const snap = await get(ref(db, `empresas/${id}`));
  if (snap.exists()) {
    return snap.val();
  }
  return null;
};