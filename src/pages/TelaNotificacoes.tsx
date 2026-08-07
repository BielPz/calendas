import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { getAuth } from "firebase/auth";
import Cabecalho from "../components/Cabecalho";
import SideBarCliente from "../components/cliente/SideBarCliente";
import SideBarPrestador from "../components/prestador/SideBarPrestador";
import EstadoVazio from "../components/EstadoVazio";
import Loading from "../components/Loading";
import {
  excluirNotificacao,
  excluirNotificacaoPrestador,
  getNotificacoesCliente,
  getNotificacoesPrestador,
  marcarNotificacaoLida,
  marcarNotificacaoPrestadorLida,
} from "../features/perfil/perfil.service";
import { getTipoUsuario } from "../features/auth/auth.service";
import type { Notificacao } from "../firebase/types";
import { useGradiente } from "../hooks/useGradiente";
import { db } from "../firebase/config";
import { onValue, ref } from "firebase/database";
import { excluirNotificacaoChat, getNotificacoesChat, marcarNotificacaoChatLida } from "../features/mensagens/mensagem.service";

export default function TelaNotificacoes() {
  const uid = getAuth().currentUser?.uid;
  const fundo = useGradiente();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<"cliente" | "prestador">("cliente");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelarInscricao: () => void = () => {};
    getTipoUsuario().then((tipo) => {
      setTipoUsuario(tipo);
      const carregar = () => Promise.all([tipo === "prestador" ? getNotificacoesPrestador(uid) : getNotificacoesCliente(uid), getNotificacoesChat(uid)]).then(([gerais, mensagens]) => setNotificacoes([...gerais, ...mensagens].sort((a, b) => b.criadoEm - a.criadoEm))).catch(console.error).finally(() => setCarregando(false));
      cancelarInscricao = onValue(ref(db, `${tipo === "prestador" ? "prestadores" : "clientes"}/${uid}/notificacoes`), carregar);
      const cancelarChat = onValue(ref(db, `notificacoesChat/${uid}`), carregar);
      const cancelarAnterior = cancelarInscricao;
      cancelarInscricao = () => { cancelarAnterior(); cancelarChat(); };
      carregar();
    }).catch(console.error);
    return () => cancelarInscricao();
  }, [uid]);

  const abrir = async (notificacao: Notificacao) => {
    if (!uid || !notificacao.id) return;
    if (!notificacao.lida) {
      if (notificacao.tipo === "mensagem") {
        await marcarNotificacaoChatLida(uid, notificacao.id);
        setNotificacoes((itens) => itens.map((item) => item.id === notificacao.id ? { ...item, lida: true } : item));
        return;
      }
      await (tipoUsuario === "prestador"
        ? marcarNotificacaoPrestadorLida(uid, notificacao.id)
        : marcarNotificacaoLida(uid, notificacao.id));
      setNotificacoes((itens) => itens.map((item) => item.id === notificacao.id ? { ...item, lida: true } : item));
    }
  };

  const excluir = async (notificacao: Notificacao) => {
    if (!uid || !notificacao.id) return;
    await (notificacao.tipo === "mensagem" ? excluirNotificacaoChat(uid, notificacao.id) : tipoUsuario === "prestador" ? excluirNotificacaoPrestador(uid, notificacao.id) : excluirNotificacao(uid, notificacao.id));
    setNotificacoes((itens) => itens.filter((item) => item.id !== notificacao.id));
  };

  return (
    <div className={`${fundo} flex h-dvh flex-col overflow-hidden`}>
      <Cabecalho perfil nome={getAuth().currentUser?.displayName || "Perfil"} />
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-4 overflow-hidden p-4 md:p-6">
        <aside className="ui-card hidden w-72 shrink-0 p-3 md:block">
          {tipoUsuario === "prestador" ? <SideBarPrestador /> : <SideBarCliente />}
        </aside>
        <section className="ui-card min-h-0 flex-1 overflow-y-auto p-5">
          <header className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-zinc-700">
            <span className="rounded-lg bg-orange-100 p-2 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200"><Bell size={20} /></span>
            <div><h1 className="font-bold text-slate-900 dark:text-white">Notificações</h1><p className="text-sm text-slate-500 dark:text-zinc-400">As notificações são removidas após 30 dias.</p></div>
          </header>
          <div className="mt-4 space-y-2">
            {carregando ? <Loading /> : notificacoes.length ? notificacoes.map((notificacao) => (
              <div key={notificacao.id} className={`flex items-start gap-3 rounded-xl border p-4 transition ${notificacao.lida ? "border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800" : "border-orange-300 bg-orange-50 dark:border-orange-400/40 dark:bg-orange-400/10"}`}>
                <button type="button" onClick={() => abrir(notificacao)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <span className="mt-0.5 text-orange-600 dark:text-orange-300">{notificacao.lida ? <CheckCheck size={18} /> : <Bell size={18} />}</span>
                  <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900 dark:text-white">{notificacao.titulo}</strong><span className="mt-1 block text-sm text-slate-600 dark:text-zinc-300">{notificacao.mensagem}</span><span className="mt-2 block text-xs text-slate-400">{new Date(notificacao.criadoEm).toLocaleString("pt-BR")}</span></span>
                </button>
                <button type="button" onClick={() => excluir(notificacao)} className="rounded-lg p-2 text-red-500 transition hover:bg-red-100 dark:hover:bg-red-400/15" aria-label="Excluir notificação" title="Excluir notificação"><Trash2 size={17} /></button>
              </div>
            )) : <EstadoVazio titulo="Nenhuma notificação por enquanto." />}
          </div>
        </section>
      </main>
    </div>
  );
}
