import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import Loading from "../components/Loading";
import { getEmpresaPorId } from "../features/empresas/empresa.service";
import { getServicosDaEmpresa } from "../features/servicos/servico.service";
import type { Empresa, Servico } from "../firebase/types";
import { useGradiente } from "../hooks/useGradiente";

export default function TelaEmpresa() {
  const { idEmpresa } = useParams(); const navigate = useNavigate(); const fundo = useGradiente();
  const [empresa, setEmpresa] = useState<(Empresa & { imagem?: string }) | null>(null); const [servicos, setServicos] = useState<Servico[]>([]); const [carregando, setCarregando] = useState(true);
  useEffect(() => { if (!idEmpresa) return; Promise.all([getEmpresaPorId(idEmpresa), getServicosDaEmpresa(idEmpresa)]).then(([dados, itens]) => { setEmpresa(dados); setServicos(itens); }).finally(() => setCarregando(false)); }, [idEmpresa]);
  if (carregando) return <Loading />;
  if (!empresa) return <div className={`${fundo} min-h-dvh`}><Cabecalho perfil /><main className="mx-auto max-w-3xl p-5"><div className="ui-card p-8 text-center">Empresa nao encontrada.</div></main></div>;
  return <div className={`${fundo} min-h-dvh`}><Cabecalho perfil /><main className="mx-auto max-w-6xl p-4 md:p-8"><button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white"><ArrowLeft size={17}/> Voltar</button><section className="ui-card overflow-hidden"><div className="grid md:grid-cols-[16rem_1fr]"><div className="min-h-56 bg-slate-100 dark:bg-zinc-800">{empresa.imagem && <img src={empresa.imagem} alt={empresa.nome} className="h-full w-full object-cover" />}</div><div className="p-6"><h1 className="text-3xl font-bold text-slate-900 dark:text-white">{empresa.nome}</h1><div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-zinc-300"><span className="flex items-center gap-2"><Phone size={16}/>{empresa.tel}</span><span className="flex items-center gap-2"><Mail size={16}/>{empresa.email}</span><span className="flex items-center gap-2"><MapPin size={16}/>{empresa.logradouro}, {empresa.numero} - {empresa.bairro}, {empresa.cidade}/{empresa.estado}</span></div></div></div></section><section className="ui-card mt-5 p-5 md:p-6"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Servicos</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{servicos.map((servico) => <button key={servico.id} onClick={() => navigate(`/servicos/${servico.id}`)} className="group flex overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-orange-400 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"><div className="h-24 w-24 shrink-0 bg-slate-100 dark:bg-zinc-800">{servico.imagem && <img src={servico.imagem} alt={servico.nome} className="h-full w-full object-cover" />}</div><div className="min-w-0 p-3"><h3 className="truncate font-bold text-slate-900 group-hover:text-orange-700 dark:text-white dark:group-hover:text-orange-300">{servico.nome}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-zinc-400">{servico.descricao || ""}</p><span className="mt-2 block text-sm font-bold text-orange-700 dark:text-orange-300">R$ {Number(servico.preco).toFixed(2)}</span></div></button>)}</div>{!servicos.length && <p className="mt-4 text-sm text-slate-500">Nenhum servico cadastrado.</p>}</section></main></div>;
}
