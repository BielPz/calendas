import { db } from "./config";
import { ref, set, push} from "firebase/database";
import type { Servico } from "./types";

export const criarServico = async (item: Servico) => {
   try {
    // Cria uma nova referência com um ID único (push)
    const itemListRef = ref(db, 'servicos');
    const newItemRef = push(itemListRef);
    
    // Salva os dados nessa nova referência
    await set(newItemRef, {
      ...item,
    });
    
    return newItemRef.key;
  } catch (error) {
    console.error("Erro ao salvar no Realtime Database:", error);
    throw error;
  }
};