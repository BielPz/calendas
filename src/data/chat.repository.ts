import { get, onValue, push, ref, set, update } from "firebase/database";
import type { ConversaChat, MensagemChat, Notificacao } from "@/firebase/types";
import { db } from "@/firebase/config";
import { getTipoUsuario } from "@/firebase/auth";
import { getAuth } from "firebase/auth";


/* -----------------------------------------------------------------------------*/
/*                                 SESSÃO CHAT                                  */
/* -----------------------------------------------------------------------------*/

export const criarOuObterConversa = async (idOutroUsuario: string, nomeOutroUsuario = "") => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");
  const tipo = await getTipoUsuario();
  const idCliente = tipo === "cliente" ? uid : idOutroUsuario;
  const idPrestador = tipo === "prestador" ? uid : idOutroUsuario;
  if (idCliente === idPrestador) throw new Error("Não é possível iniciar uma conversa com você mesmo.");
  const id = `${idCliente}_${idPrestador}`;
  const conversaRef = ref(db, `conversas/${id}`);
  // Uma conversa inexistente não pode ser lida por ninguém ainda. Por isso a
  // checagem usa o índice privado do usuário, que só ele pode consultar.
  const indiceExistente = await get(ref(db, `conversasPorUsuario/${uid}/${id}`));
  if (!indiceExistente.exists()) {
    // Perfis de terceiros não são públicos nas regras atuais. A conversa nasce
    // com o nome do usuário autenticado e um rótulo seguro para o outro lado.
    const nomeAtual = getAuth().currentUser?.displayName || (tipo === "cliente" ? "Cliente" : "Prestador");
    const cliente = { nome: tipo === "cliente" ? nomeAtual : nomeOutroUsuario || "Cliente", imagem: null };
    const prestador = { nome: tipo === "prestador" ? nomeAtual : nomeOutroUsuario || "Prestador", imagem: null };
    const agora = Date.now();
    await set(conversaRef, {
      participantes: { cliente: idCliente, prestador: idPrestador },
      nomes: { cliente: cliente.nome, prestador: prestador.nome },
      imagens: { cliente: cliente.imagem, prestador: prestador.imagem },
      criadoEm: agora,
      atualizadoEm: agora,
      ultimaLeitura: { [uid]: agora },
    });
    await update(ref(db), {
      [`conversasPorUsuario/${idCliente}/${id}`]: true,
      [`conversasPorUsuario/${idPrestador}/${id}`]: true,
    });
  }
  return id;
};

/* ---------------------------------------------------------------*/

export const enviarMensagem = async (idConversa: string, texto: string) => {
  const uid = getAuth().currentUser?.uid;
  const conteudo = texto.trim();
  if (!uid) throw new Error("Usuário não logado");
  if (!conteudo) throw new Error("Digite uma mensagem.");
  if (conteudo.length > 1000) throw new Error("A mensagem pode ter até 1000 caracteres.");
  const conversa = await get(ref(db, `conversas/${idConversa}`));
  if (!conversa.exists()) throw new Error("Conversa não encontrada.");
  const dados = conversa.val() as ConversaChat;
  const idDestinatario = dados.participantes.cliente === uid ? dados.participantes.prestador : dados.participantes.cliente;
  if (idDestinatario === uid) throw new Error("Você não participa desta conversa.");
  const agora = Date.now();
  const mensagemRef = push(ref(db, `conversas/${idConversa}/mensagens`));
  await set(mensagemRef, { autorId: uid, texto: conteudo, enviadoEm: agora });
  await update(ref(db, `conversas/${idConversa}`), {
    atualizadoEm: agora,
    ultimaMensagem: { texto: conteudo, autorId: uid, enviadoEm: agora },
    [`ultimaLeitura/${uid}`]: agora,
  });
  const remetente = dados.participantes.cliente === uid ? dados.nomes.cliente : dados.nomes.prestador;
  await set(ref(db, `notificacoesChat/${idDestinatario}/${idConversa}`), {
    tipo: "mensagem",
    titulo: "Nova mensagem",
    mensagem: `${remetente}: ${conteudo.slice(0, 110)}`,
    criadoEm: agora,
    lida: false,
    idConversa,
  });
};

/* ---------------------------------------------------------------*/

export const getNotificacoesChat = async (uid: string): Promise<Notificacao[]> => {
  const snapshot = await get(ref(db, `notificacoesChat/${uid}`));
  if (!snapshot.exists()) return [];
  const limite = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const itens = Object.entries(snapshot.val() as Record<string, Omit<Notificacao, "id">>)
    .map(([id, dados]) => ({ id, ...dados }))
    .sort((a, b) => b.criadoEm - a.criadoEm);
  const expiradas = itens.filter((item) => item.criadoEm < limite);
  if (expiradas.length) await update(ref(db), Object.fromEntries(expiradas.map((item) => [`notificacoesChat/${uid}/${item.id}`, null])));
  return itens.filter((item) => item.criadoEm >= limite);
};

/* ---------------------------------------------------------------*/

export const listarConversas = async (uid: string): Promise<ConversaChat[]> => {
  const indice = await get(ref(db, `conversasPorUsuario/${uid}`));
  if (!indice.exists()) return [];
  const ids = Object.keys(indice.val() as Record<string, true>);
  const conversas = await Promise.all(ids.map(async (id) => {
    const item = await get(ref(db, `conversas/${id}`));
    return item.exists() ? { id, ...item.val() } as ConversaChat : null;
  }));
  return conversas.filter((item): item is ConversaChat => Boolean(item)).sort((a, b) => b.atualizadoEm - a.atualizadoEm);
};

/* ---------------------------------------------------------------*/

export const contarMensagensNaoLidas = (conversas: ConversaChat[], uid: string) => conversas.filter((conversa) => conversa.ultimaMensagem?.autorId !== uid && (conversa.ultimaMensagem?.enviadoEm ?? 0) > (conversa.ultimaLeitura?.[uid] ?? 0)).length;

/* ---------------------------------------------------------------*/

export const observarConversas = (uid: string, aoAtualizar: () => void) => onValue(ref(db, `conversasPorUsuario/${uid}`), aoAtualizar);

export const observarMensagens = (idConversa: string, aoAtualizar: (mensagens: MensagemChat[]) => void) => onValue(ref(db, `conversas/${idConversa}/mensagens`), (snapshot) => {
  const itens = snapshot.exists()
    ? Object.entries(snapshot.val() as Record<string, Omit<MensagemChat, "id">>).map(([id, dados]) => ({ id, ...dados })).sort((a, b) => a.enviadoEm - b.enviadoEm)
    : [];
  aoAtualizar(itens);
});

/* ---------------------------------------------------------------*/

export const marcarNotificacaoChatLida = (uid: string, id: string) => update(ref(db, `notificacoesChat/${uid}/${id}`), { lida: true });

export const marcarConversaComoLida = async (idConversa: string) => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return;
  await set(ref(db, `conversas/${idConversa}/ultimaLeitura/${uid}`), Date.now());
};

/* ---------------------------------------------------------------*/

export const excluirNotificacaoChat = (uid: string, id: string) => set(ref(db, `notificacoesChat/${uid}/${id}`), null);
