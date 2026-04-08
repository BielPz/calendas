/**
 * IGNORAR POR ENQUANTO
 */

import { db } from "./config";
import { ref, set, push, get, child } from "firebase/database";

// 1. Defina a interface para ter o autocomplete do TypeScript
export interface ItemData {
  id?: string;
  nome: string;
  valor: number;
  dataCriacao: number;
}

/**
 * Salva um novo item gerando um ID automático (estilo lista)
 */
export const createItem = async (item: ItemData) => {
  try {
    // Cria uma nova referência com um ID único (push)
    const itemListRef = ref(db, 'itens');
    const newItemRef = push(itemListRef);
    
    // Salva os dados nessa nova referência
    await set(newItemRef, {
      ...item,
      id: newItemRef.key // Salva o ID gerado dentro do objeto também
    });
    
    return newItemRef.key;
  } catch (error) {
    console.error("Erro ao salvar no Realtime Database:", error);
    throw error;
  }
};

/**
 * Busca todos os itens de um caminho uma única vez
 */
export const getAllItems = async (): Promise<ItemData[]> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'itens'));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // O RTDB retorna um objeto de objetos, transformamos em Array para o React
      return Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return [];
  }
};