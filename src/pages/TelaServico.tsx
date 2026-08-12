import Agenda from "@/components/Agenda";
import Cabecalho from "@/components/Cabecalho";
import DetalhesAgendamento from "@/components/DetalhesAgendamentos";
import Loading from "@/components/Loading";
import { cancelarAgendamento } from "@/data/realtime.repository";
import {
  getAgendamentosDoServico,
  getEmpresaPorId,
  getServico,
} from "@/firebase/database";
import type { Agendamento, AvaliacaoServico, Servico } from "@/firebase/types";
import { useGradiente } from "@/hooks/useGradiente";
import { useAlerta } from "@/provider/AlertContext";
import { getAuth } from "firebase/auth";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Monitor,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DIAS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const hoje = () => new Date().toLocaleDateString("en-CA");

function TelaServico() {
  const { idservico } = useParams<{ idservico: string }>();
  const navigate = useNavigate();
  const corFundo = useGradiente();
  const { confirmar } = useAlerta();

  const [servico, setServico] = useState<Servico | null>(null);
  const [empresa, setEmpresa] = useState<string>("");
  const [idPrestador, setIdPrestador] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dataAgenda, setDataAgenda] = useState(hoje);
  const [agendamentosDoDia, setAgendamentosDoDia] = useState<Agendamento[]>([]);
  const [agendamentoDetalhado, setAgendamentoDetalhado] =
    useState<Agendamento>();

  const idUsuario = getAuth().currentUser?.uid;
  const nomeUsuario = getAuth().currentUser?.displayName || "Perfil";

  useEffect(() => {
    const carregar = async () => {
      if (!idservico) return;
      try {
        const item = (await getServico(idservico)) as Servico | null;
        setServico(item);
        if (item?.idEmpresa) {
          const dadosEmpresa = await getEmpresaPorId(item.idEmpresa);
          setIdPrestador(
            (dadosEmpresa as typeof dadosEmpresa & { uidDono?: string })
              ?.uidDono ?? "",
          );
        }
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [idservico]);

  useEffect(() => {
    if (!idservico || !dataAgenda) return;
    getAgendamentosDoServico(idservico)
      .then((itens) =>
        setAgendamentosDoDia(
          itens.filter(
            (item) => item.data === dataAgenda && item.status !== "cancelado",
          ),
        ),
      )
      .catch(() => setAgendamentosDoDia([]));
  }, [dataAgenda, idservico]);

  const avaliacoes = useMemo(
    () =>
      Object.entries(servico?.avaliacoes ?? {}) as [string, AvaliacaoServico][],
    [servico?.avaliacoes],
  );
  const comentarios = avaliacoes.filter(([, avaliacao]) =>
    avaliacao.comentario?.trim(),
  );

  if (loading) return <Loading />;
  if (!servico)
    return (
      <div
        className={`${corFundo} flex h-dvh flex-col overflow-hidden dark:!bg-none dark:!bg-zinc-950`}
      >
        <Cabecalho perfil nome={nomeUsuario} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-4">
            <div className="ui-card p-8 text-center">
              <p className="text-lg font-bold dark:text-white">
                Serviço não encontrado.
              </p>
              <button
                onClick={() => navigate("/feed")}
                className="ui-button-primary mt-4"
              >
                Voltar ao feed
              </button>
            </div>
          </div>
        </main>
      </div>
    );

  const modalidade = servico.configuracaoAtendimento?.modalidade;
  const atendimento =
    modalidade === "online"
      ? { texto: "Atendimento online", Icone: Monitor }
      : modalidade === "presencial-prestador"
        ? { texto: "O prestador vai até você", Icone: MapPin }
        : { texto: "Atendimento no estabelecimento", Icone: MapPin };
  const duracaoNumero = Number(servico.duracao) || 60;
  const duracaoMinutos =
    servico.tempo === "dia"
      ? duracaoNumero * 1440
      : servico.tempo === "hora"
        ? duracaoNumero * 60
        : duracaoNumero;
  const horariosOcupados = [
    ...new Set(agendamentosDoDia.map((agendamento) => agendamento.horario)),
  ].sort();
  const visibilidadeAgenda = servico.visibilidadeAgenda ?? "todos";
  const agendaServico = agendamentosDoDia;
  const fimDoHorario = (horario: string) => {
    const [hora, minuto] = horario.split(":").map(Number);
    const total = hora * 60 + minuto + duracaoMinutos;
    return `${String(Math.floor((total % 1440) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  return (
    <div
      className={`${corFundo} flex h-dvh flex-col overflow-hidden dark:!bg-none dark:!bg-zinc-950`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 md:py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-orange-100"
          >
            <ArrowLeft size={18} /> Voltar
          </button>

          <section className="ui-card overflow-hidden">
            <div className="grid md:grid-cols-[minmax(15rem,0.85fr)_1.4fr]">
              <div className="min-h-56 bg-slate-100 dark:bg-zinc-800">
                {servico.imagem ? (
                  <img
                    src={servico.imagem}
                    alt={servico.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full min-h-56 bg-linear-to-br from-orange-100 to-violet-200 dark:from-orange-500/15 dark:to-violet-500/15" />
                )}
              </div>
              <div className="p-5 md:p-7">
                <button
                  onClick={() =>
                    servico.idEmpresa &&
                    navigate(`/empresas/${servico.idEmpresa}`)
                  }
                  className="text-sm font-semibold text-orange-700 dark:text-orange-300"
                >
                  {empresa || "Empresa"}
                </button>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                  {servico.nome}
                </h1>
                {servico.totalAvaliacoes ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                      <Star size={16} className="fill-current" />{" "}
                      {servico.avaliacaoMedia?.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-zinc-400">
                      {servico.totalAvaliacoes} avaliação(ões)
                    </span>
                  </div>
                ) : null}
                <p className="mt-5 leading-relaxed text-slate-600 dark:text-zinc-300">
                  {servico.descricao ||
                    "Este serviço ainda não possui descrição."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-zinc-300">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 dark:bg-zinc-800">
                    <Clock3
                      size={17}
                      className="text-orange-600 dark:text-orange-300"
                    />{" "}
                    {servico.duracao} {servico.tempo}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 dark:bg-zinc-800">
                    <atendimento.Icone
                      size={17}
                      className="text-orange-600 dark:text-orange-300"
                    />{" "}
                    {atendimento.texto}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-zinc-700">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    R$ {Number(servico.preco).toFixed(2)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {idPrestador && idPrestador !== idUsuario && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/mensagens?contato=${idPrestador}&nome=${encodeURIComponent(empresa)}`,
                          )
                        }
                        className="ui-button-secondary inline-flex items-center gap-2"
                      >
                        <MessageCircle size={17} /> Falar com o prestador
                      </button>
                    )}
                    <button
                      onClick={() =>
                        navigate("/agendamento", {
                          state: { servico, empresa },
                        })
                      }
                      className="ui-button-primary"
                    >
                      Agendar serviço
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
            <section className="ui-card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Avaliações
                </h2>
                <span className="text-sm text-slate-500 dark:text-zinc-400">
                  {avaliacoes.length} no total
                </span>
              </div>
              {comentarios.length ? (
                <div className="space-y-4">
                  {comentarios.map(([uid, avaliacao]) => {
                    const nomeAutor = avaliacao.nomeAutor || "Cliente";
                    const iniciais = nomeAutor
                      .split(" ")
                      .map((nome) => nome[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <article
                        key={uid}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-violet-600 text-xs font-bold text-white">
                              {iniciais}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                              {nomeAutor}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-300">
                            <Star size={15} className="fill-current" />{" "}
                            {avaliacao.nota}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                          {avaliacao.comentario}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="ui-card-muted p-4 text-sm text-slate-500 dark:text-zinc-400">
                  Ainda não há comentários. As notas sem comentário continuam
                  contando na média.
                </p>
              )}
            </section>

            <aside className="ui-card p-5 md:p-6">
              <div className="mb-1 flex items-center gap-2">
                <Clock3
                  size={20}
                  className="text-orange-600 dark:text-orange-300"
                />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Disponibilidade
                </h2>
              </div>
              <p className="mb-4 text-sm text-slate-500 dark:text-zinc-400">
                Horários de funcionamento da semana.
              </p>
              <div className="space-y-2">
                {DIAS.map((dia, indice) => {
                  const horario = servico.diasDisponiveis?.[indice];
                  return (
                    <div
                      key={dia}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${horario?.ativo ? "bg-orange-50 text-slate-700 dark:bg-orange-400/10 dark:text-zinc-200" : "bg-slate-50 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500"}`}
                    >
                      <span className="font-medium">{dia}</span>
                      <span>
                        {horario?.ativo
                          ? `${horario.inicio} – ${horario.fim}`
                          : "Fechado"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>

          <section className="hidden ui-card mt-5 p-5 md:p-6">
            <div className="mb-1 flex items-center gap-2">
              <CalendarDays
                size={20}
                className="text-orange-600 dark:text-orange-300"
              />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Agenda do serviço
              </h2>
            </div>
            <p className="mb-4 text-sm text-slate-500 dark:text-zinc-400">
              Consulte os horários já ocupados. Dados de clientes não são
              exibidos.
            </p>
            <label className="mb-4 block max-w-xs text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Data
              <input
                type="date"
                value={dataAgenda}
                min={hoje()}
                onChange={(event) => setDataAgenda(event.target.value)}
                className="ui-input mt-1 py-2"
              />
            </label>
            {horariosOcupados.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {horariosOcupados.map((horario) => (
                  <div
                    key={horario}
                    className="rounded-lg border-l-4 border-orange-500 bg-orange-50 px-3 py-2 text-sm dark:bg-orange-400/10"
                  >
                    <span className="block font-bold text-slate-800 dark:text-zinc-100">
                      {horario} – {fimDoHorario(horario)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      Horário ocupado
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ui-card-muted p-4 text-sm text-slate-500 dark:text-zinc-400">
                Nenhum agendamento neste dia.
              </p>
            )}
          </section>
          {visibilidadeAgenda !== "oculta" && (
            <div className="mt-5">
              {visibilidadeAgenda === "todos" && (
                <label className="mb-3 block max-w-xs text-sm font-semibold text-white">
                  Data da agenda
                  <input
                    type="date"
                    value={dataAgenda}
                    min={hoje()}
                    onChange={(event) => setDataAgenda(event.target.value)}
                    className="ui-input mt-1 py-2"
                  />
                </label>
              )}
              <Agenda
                titulo="Agenda do serviço"
                data={visibilidadeAgenda === "dia" ? hoje() : dataAgenda}
                agendamentos={agendaServico}
                janelaHoras={4}
                onSelecionar={setAgendamentoDetalhado}
                rotuloAgendamento="Horário reservado"
              />
            </div>
          )}
        </div>
      </main>
      {agendamentoDetalhado && (
        <DetalhesAgendamento
          agendamento={agendamentoDetalhado}
          tipoUsuario="cliente"
          mostrarDadosPrivados={agendamentoDetalhado.idCliente === idUsuario}
          onFechar={() => setAgendamentoDetalhado(undefined)}
          onCancelar={
            agendamentoDetalhado.idCliente === idUsuario
              ? async (agendamento) => {
                  if (
                    !agendamento.id ||
                    !(await confirmar(
                      "Cancelar agendamento",
                      "Cancelar este agendamento?",
                      "Cancelar agendamento",
                    ))
                  )
                    return;
                  try {
                    await cancelarAgendamento(agendamento.id);
                    setAgendamentosDoDia((atual) =>
                      atual.filter((item) => item.id !== agendamento.id),
                    );
                    setAgendamentoDetalhado(undefined);
                  } catch {
                    window.alert("Não foi possível cancelar o agendamento.");
                  }
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default TelaServico;
