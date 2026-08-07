import { useEffect, useMemo, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cabecalho from "../components/Cabecalho";
import EstadoVazio from "../components/EstadoVazio";
import Loading from "../components/Loading";
import { useGradiente } from "../hooks/useGradiente";
import { criarOuObterConversa, enviarMensagem, listarConversas, marcarConversaComoLida, observarConversas, observarMensagens } from "../features/mensagens/mensagem.service";
import type { ConversaChat, MensagemChat } from "../firebase/types";

const hora = (valor: number) => new Date(valor).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export default function TelaMensagens() {
  const uid = getAuth().currentUser?.uid;
  const nome = getAuth().currentUser?.displayName || "Perfil";
  const fundo = useGradiente();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const [conversas, setConversas] = useState<ConversaChat[]>([]);
  const [selecionada, setSelecionada] = useState<string>();
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);
  const carregar = async () => { if (uid) setConversas(await listarConversas(uid)); };

  useEffect(() => { if (!uid) return; carregar().catch(console.error); return observarConversas(uid, () => carregar().catch(console.error)); }, [uid]);
  useEffect(() => { const contato = parametros.get("contato"); if (!contato || !uid) return; criarOuObterConversa(contato, parametros.get("nome") ?? "").then((id) => { setSelecionada(id); navigate("/mensagens", { replace: true }); }).catch((causa) => setErro(causa instanceof Error ? causa.message : "Não foi possível abrir a conversa.")); }, [parametros, uid, navigate]);
  useEffect(() => { if (!selecionada) { setMensagens([]); return; } marcarConversaComoLida(selecionada).catch(console.error); return observarMensagens(selecionada, (itens) => { setMensagens(itens); marcarConversaComoLida(selecionada).catch(console.error); }); }, [selecionada]);
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens]);

  const conversa = conversas.find((item) => item.id === selecionada);
  const interlocutor = conversa ? conversa.participantes.cliente === uid ? conversa.nomes.prestador : conversa.nomes.cliente : "";
  const conversasFiltradas = useMemo(() => conversas.filter((item) => (item.participantes.cliente === uid ? item.nomes.prestador : item.nomes.cliente).toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))), [busca, conversas, uid]);
  const enviar = async () => { if (!selecionada || !texto.trim()) return; try { setEnviando(true); setErro(""); await enviarMensagem(selecionada, texto); setTexto(""); } catch (causa) { setErro(causa instanceof Error ? causa.message : "Não foi possível enviar a mensagem."); } finally { setEnviando(false); } };
  if (!uid) return <Loading />;

  return <div className={`${fundo} flex h-dvh flex-col overflow-hidden`}>
    <Cabecalho perfil nome={nome} />
    <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-4 overflow-hidden p-4 md:p-6">
      <section className={`ui-card min-w-0 flex-1 overflow-hidden ${selecionada ? "hidden md:flex" : "flex"} flex-col md:max-w-sm`}>
        <header className="border-b border-slate-200 p-4 dark:border-zinc-700"><h1 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><MessageCircle size={19} className="text-orange-600 dark:text-orange-300" /> Mensagens</h1><label className="relative mt-3 block"><Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" /><input className="ui-input py-2 pl-9" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar conversa" /></label></header>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">{erro && <p className="m-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-400/10 dark:text-red-200">{erro}</p>}{conversasFiltradas.length ? conversasFiltradas.map((item) => { const outro = item.participantes.cliente === uid ? item.nomes.prestador : item.nomes.cliente; const naoLida = item.ultimaMensagem?.autorId !== uid && (item.ultimaMensagem?.enviadoEm ?? 0) > (item.ultimaLeitura?.[uid] ?? 0); return <button key={item.id} type="button" onClick={() => setSelecionada(item.id)} className={`mb-1 w-full rounded-xl p-3 text-left transition ${selecionada === item.id ? "bg-orange-50 dark:bg-orange-400/10" : "hover:bg-slate-50 dark:hover:bg-zinc-800"}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-violet-600 text-sm font-bold text-white">{outro.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-sm text-slate-900 dark:text-white">{outro}</strong>{naoLida && <i className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />}</span><span className={`mt-1 block truncate text-xs ${naoLida ? "font-semibold text-slate-700 dark:text-zinc-200" : "text-slate-500 dark:text-zinc-400"}`}>{item.ultimaMensagem?.texto || "Conversa iniciada"}</span></span>{item.ultimaMensagem && <span className="text-[10px] text-slate-400">{hora(item.ultimaMensagem.enviadoEm)}</span>}</div></button>; }) : <EstadoVazio titulo="Nenhuma conversa ainda." className="p-5" />}</div>
      </section>
      <section className={`ui-card min-w-0 flex-1 flex-col ${selecionada ? "flex" : "hidden md:flex"}`}>{conversa ? <><header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-zinc-700"><button type="button" onClick={() => setSelecionada(undefined)} className="ui-button-icon md:hidden" aria-label="Voltar"><ArrowLeft size={18} /></button><span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-violet-600 text-sm font-bold text-white">{interlocutor.slice(0, 2).toUpperCase()}</span><div><h2 className="font-bold text-slate-900 dark:text-white">{interlocutor}</h2><p className="text-xs text-slate-500 dark:text-zinc-400">Conversa privada</p></div></header><div className="min-h-0 flex-1 overflow-y-auto p-4"><div className="space-y-3">{mensagens.map((mensagem) => <div key={mensagem.id} className={`flex ${mensagem.autorId === uid ? "justify-end" : "justify-start"}`}><article className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mensagem.autorId === uid ? "bg-linear-to-br from-orange-500 to-violet-600 text-white" : "bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-100"}`}><p className="whitespace-pre-wrap break-words">{mensagem.texto}</p><time className={`mt-1 block text-right text-[10px] ${mensagem.autorId === uid ? "text-white/75" : "text-slate-400"}`}>{hora(mensagem.enviadoEm)}</time></article></div>)}<div ref={fimRef} /></div></div><div className="border-t border-slate-200 p-3 dark:border-zinc-700"><div className="flex items-stretch gap-2"><textarea value={texto} onChange={(event) => setTexto(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); enviar(); } }} maxLength={1000} rows={2} placeholder="Digite uma mensagem" className="ui-input min-h-11 resize-none" /><button type="button" disabled={enviando || !texto.trim()} onClick={enviar} className="ui-button-primary inline-flex w-11 shrink-0 items-center justify-center self-stretch px-0" aria-label="Enviar mensagem"><Send size={18} /></button></div>{erro && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-300">{erro}</p>}</div></> : <EstadoVazio titulo="Escolha uma conversa para começar." className="m-auto" />}</section>
    </main>
  </div>;
}
