import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import Loading from "../components/Loading";
import EstadoVazio from "../components/EstadoVazio";
import CardServico from "../components/CardServico";
import ImagemServico from "../components/ImagemServico";
import { getEmpresaPorId } from "../features/empresas/empresa.service";
import { getServicosDaEmpresa } from "../features/servicos/servico.service";
import type { Empresa, Servico } from "../firebase/types";
import { useGradiente } from "../hooks/useGradiente";

export default function TelaEmpresa() {
  const { idEmpresa } = useParams(); const navigate = useNavigate(); const fundo = useGradiente();
  const [empresa, setEmpresa] = useState<(Empresa & { imagem?: string }) | null>(null); const [servicos, setServicos] = useState<Servico[]>([]); const [carregando, setCarregando] = useState(true);
  useEffect(() => { if (!idEmpresa) return; Promise.all([getEmpresaPorId(idEmpresa), getServicosDaEmpresa(idEmpresa)]).then(([dados, itens]) => { setEmpresa(dados); setServicos(itens); }).finally(() => setCarregando(false)); }, [idEmpresa]);
  if (carregando) return <Loading />;
  if (!empresa) return <div className={`${fundo} min-h-dvh`}><Cabecalho perfil /><main className="mx-auto max-w-3xl p-5"><EstadoVazio titulo="Empresa não encontrada." acao={<button type="button" onClick={() => navigate("/feed")} className="ui-button-primary">Voltar ao feed</button>} /></main></div>;
  return <div className={`${fundo} min-h-dvh`}><Cabecalho perfil /><main className="mx-auto max-w-6xl p-4 md:p-8"><button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white"><ArrowLeft size={17} /> Voltar</button><section className="ui-card overflow-hidden"><div className="grid md:grid-cols-[16rem_1fr]"><ImagemServico src={empresa.imagem} alt={empresa.nome} className="min-h-56" /><div className="p-6"><h1 className="text-3xl font-bold text-slate-900 dark:text-white">{empresa.nome}</h1><div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-zinc-300"><span className="flex items-center gap-2"><Phone size={16} />{empresa.tel}</span><span className="flex items-center gap-2"><Mail size={16} />{empresa.email}</span><span className="flex items-center gap-2"><MapPin size={16} />{empresa.logradouro}, {empresa.numero} - {empresa.bairro}, {empresa.cidade}/{empresa.estado}</span></div></div></div></section><section className="ui-card mt-5 p-5 md:p-6"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Serviços</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{servicos.map((servico) => <CardServico key={servico.id} servico={servico} variante="lista" onClick={() => navigate(`/servicos/${servico.id}`)} />)}</div>{!servicos.length && <EstadoVazio titulo="Nenhum serviço cadastrado." className="mt-4" />}</section></main></div>;
}
