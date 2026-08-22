import CardServico from "@/components/modals/CardServico";
import EstadoVazio from "@/components/modals/EstadoVazio";
import Cabecalho from "@/components/utils/Cabecalho";
import ImagemServico from "@/components/utils/ImagemServico";
import Loading from "@/components/utils/Loading";
import {
  getEmpresaPorId,
  getServicosDaEmpresa,
} from "@/data/realtime.repository";
import type { Empresa, Servico } from "@/firebase/types";
import { useGradiente } from "@/hooks/useGradiente";
import { getAuth } from "firebase/auth";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type EmpresaComDono = Empresa & { imagem?: string; uidDono?: string };

function TelaEmpresa() {
  const { idEmpresa } = useParams(); // Pega o parâmetro idEmpresa da URL usando o hook useParams do React Router
  const navigate = useNavigate();
  const fundo = useGradiente(); // Chama o hook useGradiente para obter a classe de fundo com gradiente, dependendo do tema (claro ou escuro)

  const [empresa, setEmpresa] = useState<EmpresaComDono | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idEmpresa) return;
    Promise.all([getEmpresaPorId(idEmpresa), getServicosDaEmpresa(idEmpresa)])
      .then(([empresaData, servicosData]) => {
        setEmpresa(empresaData as EmpresaComDono | null);
        setServicos(servicosData);
      })
      .finally(() => setLoading(false));
  }, [idEmpresa]);

  if (loading) return <Loading />;
  if (!empresa) {
    return (
      <div className={`${fundo} min-h-dvh`}>
        <Cabecalho perfil />
        <main className="mx-auto max-w-3xl p-5">
          <EstadoVazio
            titulo="Empresa não encontrada."
            acao={
              <button
                type="button"
                onClick={() => navigate("/feed")}
                className="ui-button-primary"
              >
                Voltar ao feed
              </button>
            }
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`${fundo} min-h-dvh`}>
      <Cabecalho perfil />
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white"
        >
          <ArrowLeft size={17} /> Voltar
        </button>
        <section className="ui-card overflow-hidden">
          <div className="grid md:grid-cols-[16rem_1fr]">
            <ImagemServico
              src={empresa.imagem}
              alt={empresa.nome}
              className="min-h-56"
            />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {empresa.nome}
                </h1>
                {empresa.uidDono &&
                  empresa.uidDono !== getAuth().currentUser?.uid && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/mensagens?contato=${empresa.uidDono}&nome=${encodeURIComponent(empresa.nome)}`,
                        )
                      }
                      className="ui-button-secondary inline-flex items-center gap-2"
                    >
                      <MessageCircle size={17} /> Enviar mensagem
                    </button>
                  )}
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <Phone size={16} />
                  {empresa.tel}
                </span>
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  {empresa.email}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {empresa.logradouro}, {empresa.numero} - {empresa.bairro},{" "}
                  {empresa.cidade}/{empresa.estado}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="ui-card mt-5 p-5 md:p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Serviços
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {servicos.map((servico) => (
              <CardServico
                key={servico.id}
                servico={servico}
                variante="lista"
                onClick={() => navigate(`/servicos/${servico.id}`)}
              />
            ))}
          </div>
          {!servicos.length && (
            <EstadoVazio titulo="Nenhum serviço cadastrado." className="mt-4" />
          )}
        </section>
      </main>
    </div>
  );
}

export default TelaEmpresa;
