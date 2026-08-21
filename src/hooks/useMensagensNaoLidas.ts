import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { contarMensagensNaoLidas, listarConversas, observarConversas } from "../features/mensagens/mensagem.service";

export const useMensagensNaoLidas = () => {
  const [quantidade, setQuantidade] = useState(0);
  const uid = getAuth().currentUser?.uid;
  useEffect(() => {
    if (!uid) return;
    const atualizar = () => listarConversas(uid).then((conversas) => setQuantidade(contarMensagensNaoLidas(conversas, uid))).catch(console.error);
    atualizar();
    return observarConversas(uid, atualizar);
  }, [uid]);
  return quantidade;
};
