import { useEffect, useState, useRef } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import type { Servico, DiaDisponivel, Agendamento } from "../firebase/types";
import CabecalhoBranco from "../components/CabecalhoBranco";
import {
  criarServico,
  getAgendamentosDoServico,
  getEmpresaPorId,
  getServico,
} from "../firebase/database";
import { useLocation, useNavigate } from "react-router";
import UploadImagem from "../components/UploadImagem";
import { useAlerta } from "../provider/AlertContext";
import { useGradiente } from "@/hooks/useGradiente";
import { getAuth } from "firebase/auth";
import {
  atualizarServico,
  cancelarAgendamento,
  excluirServico,
  getServicosDaEmpresa,
  responderAgendamento,
} from "@/data/realtime.repository";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Info,
  Pencil,
  Phone,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Cabecalho from "@/components/Cabecalho";
import DetalhesAgendamento from "@/components/DetalhesAgendamentos";
import GradeDisponibilidade from "@/components/GradeDisponibilidade";
import PainelLateral from "@/components/PainelLateral";
import ResumoServico from "@/components/ResumoServico";
import AgendaUnificada from "@/components/AgendaUnificada";
import PainelAgenda from "@/components/PainelAgenda";
import NavegacaoMes from "@/components/NavegacaoMes";

// ─── Configuração dos dias da semana ─────────────────────────────────────────
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Dias úteis (Seg–Sex) ativos por padrão
const diasPadrao = (): DiaDisponivel[] =>
  DIAS_SEMANA.map((_, i) => ({
    ativo: i >= 1 && i <= 5,
    inicio: "",
    fim: "",
  }));

// ─── Componente ──────────────────────────────────────────────────────────────
function TelaCriarServico() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlerta, confirmar } = useAlerta();
  const corFundo = useGradiente();
  const nomeUsuario = getAuth().currentUser?.displayName || "Perfil";
  const idEmpresa = location.state?.idEmpresa;
  const idServico = location.state?.idServico as string | undefined;

  const [form, setForm] = useState<Servico>({
    cnpj: "",
    nome: "",
    imagem: "",
    descricao: "",
    preco: 0,
    duracao: "",
    tempo: "",
    diasDisponiveis: diasPadrao(),
    configuracaoAtendimento: {
      modalidade: "presencial-cliente",
      solicitarTelefone: false,
      placeholderObservacao: "",
      observacaoObrigatoria: false,
      requerAprovacao: false,
    },
    modoHorario: "duracao",
  });
  const [erro, setErro] = useState("");
  const [dataAgenda, setDataAgenda] = useState(() =>
    new Date().toLocaleDateString("en-CA"),
  );
  const [mesAgenda, setMesAgenda] = useState(() => new Date());
  const [agendaServico, setAgendaServico] = useState<Agendamento[]>([]);
  const [agendamentoDetalhado, setAgendamentoDetalhado] =
    useState<Agendamento>();
  const [mostrandoHorariosAgenda, setMostrandoHorariosAgenda] = useState(false);
  const [outrosServicos, setOutrosServicos] = useState<Servico[]>([]);
  const [secaoAtiva, setSecaoAtiva] = useState("basicos");
  const [editando, setEditando] = useState(!idServico);
  const [rascunhoOriginal, setRascunhoOriginal] = useState<Servico | null>(
    null,
  );

  // Refs síncronas para gravar qual índice de dia ativou a propagação inicial.
  // Evita lags de estado assíncrono entre keystrokes rápidas.
  const origemPropagacaoInicio = useRef<number | null>(null);
  const origemPropagacaoFim = useRef<number | null>(null);

  useEffect(() => {
    if (idServico) {
      getServico(idServico).then((dados) => {
        if (dados) {
          const servico = {
            ...dados,
            modoHorario: dados.modoHorario ?? "duracao",
          };
          setForm(servico);
          setRascunhoOriginal(structuredClone(servico));
        }
      });
      return;
    }
    if (idEmpresa) {
      getEmpresaPorId(idEmpresa).then((dados) => {
        if (dados?.cnpj) {
          setForm((prev) => ({ ...prev, cnpj: dados.cnpj }));
        }
      });
    }
  }, [idEmpresa, idServico]);

  useEffect(() => {
    if (idEmpresa)
      getServicosDaEmpresa(idEmpresa).then((itens) =>
        setOutrosServicos(itens.filter((item) => item.id !== idServico)),
      );
  }, [idEmpresa, idServico]);

  useEffect(() => {
    if (!idServico) return;
    getAgendamentosDoServico(idServico).then(setAgendaServico);
  }, [idServico]);

  // ── Handlers gerais ────────────────────────────────────────────────────────
  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: campo === "preco" ? Number(value) : value,
    }));
  };

  const atualizarConfiguracao = (
    campo:
      | "modalidade"
      | "solicitarTelefone"
      | "placeholderObservacao"
      | "observacaoObrigatoria"
      | "requerAprovacao",
    valor: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      configuracaoAtendimento: {
        modalidade: "presencial-cliente",
        solicitarTelefone: false,
        placeholderObservacao: "",
        observacaoObrigatoria: false,
        requerAprovacao: false,
        ...prev.configuracaoAtendimento,
        [campo]: valor,
      },
    }));
  };

  // ── Handlers dos dias ─────────────────────────────────────────────────────
  const toggleDia = (index: number) => {
    // Se desativar o dia que estava controlando a propagação, limpa a referência
    if (origemPropagacaoInicio.current === index)
      origemPropagacaoInicio.current = null;
    if (origemPropagacaoFim.current === index)
      origemPropagacaoFim.current = null;

    setForm((prev) => {
      const dias = [...prev.diasDisponiveis];
      dias[index] = { ...dias[index], ativo: !dias[index].ativo };
      return { ...prev, diasDisponiveis: dias };
    });
  };

  const handleHorarioDia = (
    index: number,
    campo: "inicio" | "fim",
    valor: string,
  ) => {
    if (campo === "inicio") {
      // Se for a primeira digitação geral da tela, este campo vira o "master" da propagação
      if (origemPropagacaoInicio.current === null) {
        origemPropagacaoInicio.current = index;
      }
    } else {
      if (origemPropagacaoFim.current === null) {
        origemPropagacaoFim.current = index;
      }
    }

    setForm((prev) => {
      const dias = [...prev.diasDisponiveis];

      // Só propaga se o usuário continuar digitando no MESMO campo que iniciou tudo
      const podePropagar =
        campo === "inicio"
          ? origemPropagacaoInicio.current === index
          : origemPropagacaoFim.current === index;

      if (podePropagar) {
        return {
          ...prev,
          diasDisponiveis: dias.map((d) =>
            d.ativo ? { ...d, [campo]: valor } : d,
          ),
        };
      }

      // Se ele trocou de campo ou mudou de dia (individualização), altera estritamente o alvo
      dias[index] = { ...dias[index], [campo]: valor };
      return { ...prev, diasDisponiveis: dias };
    });
  };

  // ── Validação ──────────────────────────────────────────────────────────────
  const diasAtivos = form.diasDisponiveis.filter((d) => d.ativo);
  const diasValidos = diasAtivos.every((d) => d.inicio && d.fim);

  const isValid = Boolean(
    form.cnpj &&
    form.nome &&
    form.preco &&
    form.duracao &&
    diasAtivos.length > 0 &&
    diasValidos,
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!isValid || !idEmpresa) return;
    try {
      const formSanitizado: Servico = {
        ...form,
        diasDisponiveis: form.diasDisponiveis.map((d) =>
          d.ativo ? d : { ...d, inicio: "", fim: "" },
        ),
      };

      if (idServico) {
        await atualizarServico(idServico, formSanitizado);
        setForm(formSanitizado);
        setRascunhoOriginal(structuredClone(formSanitizado));
        setEditando(false);
      } else {
        await criarServico(formSanitizado, idEmpresa);
      }
      showAlerta(
        "Sucesso",
        idServico
          ? "Serviço atualizado com sucesso!"
          : "Serviço criado com sucesso!",
        "sucesso",
      );
      if (!idServico) navigate("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
      showAlerta("Erro", errorMessage, "erro");
    }
  };

  const handleExcluir = async () => {
    if (!idServico) return;
    const confirmado = await confirmar(
      "Excluir serviço",
      `Excluir o serviço “${form.nome}”? Esta ação não pode ser desfeita.`,
      "Excluir serviço",
    );
    if (!confirmado) return;

    try {
      await excluirServico(idServico);
      showAlerta(
        "Serviço excluído",
        "O serviço foi removido com sucesso.",
        "sucesso",
      );
      navigate("/feed");
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o serviço.";
      showAlerta("Não foi possível excluir", mensagem, "erro");
    }
  };

  const tempos = [
    { label: "Dias", value: "dia" },
    { label: "Horas", value: "hora" },
    { label: "Minutos", value: "minuto" },
  ];

  const secoesEdicao = [
    ["basicos", "Dados básicos"],
    ["atendimento", "Atendimento"],
    ["horarios", "Horários"],
    ["conflitos", "Conflitos"],
    ["agenda", "Agenda"],
    ["avaliacoes", "Avaliações"],
  ] as const;

  const iconesSecao = {
    basicos: <Info size={18} />,
    atendimento: <Phone size={18} />,
    horarios: <Clock3 size={18} />,
    conflitos: <ShieldAlert size={18} />,
    agenda: <CalendarDays size={18} />,
    avaliacoes: <Star size={18} />,
  };
  const itensMenuServico = secoesEdicao.map(([id, label]) => ({
    id,
    label,
    icon: iconesSecao[id],
  }));
  const visibilidadePorSecao: Record<string, string> = {
    basicos:
      "[&>div]:hidden [&>div:nth-child(1)]:block [&>div:nth-child(2)]:block [&>div:nth-child(3)]:block [&>div:nth-child(4)]:block [&>div:nth-child(5)]:block [&>div:nth-child(6)]:block",
    atendimento: "[&>div]:hidden [&>div:nth-child(7)]:block",
    horarios:
      "[&>div]:hidden [&>div:nth-child(8)]:block [&>div:nth-child(10)]:block",
    conflitos: "[&>div]:hidden [&>div:nth-child(9)]:block",
    avaliacoes: "[&>div]:hidden [&>div:nth-child(11)]:block",
    agenda: "hidden",
  };

  const classeFormularioEdicao = idServico
    ? `grid gap-4 md:grid-cols-2 [&>div]:rounded-2xl [&>div]:border [&>div]:border-slate-200 [&>div]:bg-white/95 [&>div]:p-4 [&>div]:shadow-sm dark:[&>div]:border-zinc-700 dark:[&>div]:bg-zinc-900/95 ${visibilidadePorSecao[secaoAtiva]}`
    : "";
  const avaliacoes = Object.entries(form.avaliacoes ?? {}).sort(
    ([, a], [, b]) => b.atualizadoEm - a.atualizadoEm,
  );
  const cancelarEdicao = () => {
    if (rascunhoOriginal) setForm(structuredClone(rascunhoOriginal));
    setEditando(false);
  };
  const cancelarAgendamentoDaAgenda = async (agendamento: Agendamento) => {
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
      setAgendaServico((itens) =>
        itens.filter((item) => item.id !== agendamento.id),
      );
      setAgendamentoDetalhado(undefined);
      showAlerta(
        "Agendamento cancelado",
        "O horário voltou a ficar disponível.",
        "sucesso",
      );
    } catch (error) {
      showAlerta(
        "Não foi possível cancelar",
        error instanceof Error ? error.message : "Tente novamente.",
        "erro",
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-start ${idServico ? `md:h-dvh md:overflow-hidden ${corFundo} dark:!bg-none dark:!bg-zinc-950` : "dark:bg-zinc-900"}`}
    >
      {idServico ? (
        <>
          <Cabecalho perfil nome={nomeUsuario} />
          <div className="sticky top-0 z-20 flex w-full max-w-6xl items-center px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
        </>
      ) : (
        <CabecalhoBranco titulo="Cadastre seu Serviço" />
      )}
      <div
        className={`${idServico ? "grid w-full max-w-7xl gap-4 px-4 pb-4 pt-4 md:h-[calc(100dvh-4rem)] md:grid-cols-[18rem_minmax(0,1fr)] md:overflow-y-auto" : "flex w-full flex-col gap-3 px-4 max-w-xl"}`}
      >
        {idServico && (
          <ResumoServico
            servico={form}
            rotulo={editando ? "Modo de edição" : "Serviço"}
            className="md:col-start-2 md:row-start-1"
            acoes={
              editando ? (
                <>
                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    className="ui-button-secondary inline-flex items-center gap-2"
                  >
                    <X size={16} /> Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!isValid}
                    onClick={handleConfirmar}
                    className="ui-button-primary"
                  >
                    Salvar alterações
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="ui-button-secondary inline-flex items-center gap-2"
                >
                  <Pencil size={16} /> Editar
                </button>
              )
            }
          />
        )}
        {idServico && (
          <PainelLateral
            itens={itensMenuServico}
            itemAtivo={secaoAtiva}
            onSelecionar={(secao) => {
              setSecaoAtiva(secao);
              if (secao === "agenda") setMostrandoHorariosAgenda(false);
            }}
            titulo="Gerenciar serviço"
            rotuloAcessivel="Seções da edição do serviço"
            className="md:col-start-1 md:row-start-1 md:row-span-6 md:sticky md:top-0 md:h-[calc(100dvh-6rem)]"
            rodape={
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-4 flex w-full items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 pb-3 pt-4 text-sm font-bold text-slate-600 transition-colors hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
            }
          />
        )}
        {idServico && secaoAtiva === "agenda" && (
          <div className="w-full md:col-start-2">
            <section className="ui-card p-5">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Visibilidade da agenda
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Defina o que clientes podem consultar.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["dia", "Somente hoje"],
                  ["todos", "Todos os dias"],
                  ["oculta", "Ocultar"],
                ].map(([valor, titulo]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        visibilidadeAgenda:
                          valor as Servico["visibilidadeAgenda"],
                      }))
                    }
                    className={`rounded-lg px-3 py-2 text-sm font-bold ${(form.visibilidadeAgenda ?? "todos") === valor ? "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-200" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
                  >
                    {titulo}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
        {idServico && !editando && secaoAtiva !== "agenda" && (
          <section className="ui-card p-5 md:col-start-2">
            {secaoAtiva === "basicos" && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Descrição
                  </p>
                  <p className="mt-2 leading-relaxed text-slate-700 dark:text-zinc-200">
                    {form.descricao || "Sem descrição cadastrada."}
                  </p>
                </div>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <div className="ui-card-muted p-3">
                    <dt className="text-xs text-slate-500">Preço</dt>
                    <dd className="mt-1 font-bold text-slate-900 dark:text-white">
                      R$ {Number(form.preco || 0).toFixed(2)}
                    </dd>
                  </div>
                  <div className="ui-card-muted p-3">
                    <dt className="text-xs text-slate-500">Duração</dt>
                    <dd className="mt-1 font-bold text-slate-900 dark:text-white">
                      {form.duracao} {form.tempo}
                    </dd>
                  </div>
                  <div className="ui-card-muted p-3">
                    <dt className="text-xs text-slate-500">CNPJ</dt>
                    <dd className="mt-1 font-bold text-slate-900 dark:text-white">
                      {form.cnpj}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
            {secaoAtiva === "atendimento" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="ui-card-muted p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Modalidade
                  </p>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white">
                    {form.configuracaoAtendimento?.modalidade === "online"
                      ? "Online"
                      : form.configuracaoAtendimento?.modalidade ===
                          "presencial-prestador"
                        ? "Prestador vai até o cliente"
                        : "Cliente vai até o local"}
                  </p>
                </div>
                <div className="ui-card-muted p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Dados solicitados
                  </p>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white">
                    {form.configuracaoAtendimento?.solicitarTelefone
                      ? "Telefone de contato"
                      : "Nenhum dado adicional"}
                    {form.configuracaoAtendimento?.observacaoObrigatoria
                      ? " e observação obrigatória"
                      : ""}
                  </p>
                </div>
                <div className="ui-card-muted p-4 sm:col-span-2">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Orientação para observação
                  </p>
                  <p className="mt-2 text-slate-700 dark:text-zinc-200">
                    {form.configuracaoAtendimento?.placeholderObservacao ||
                      "Nenhuma orientação cadastrada."}
                  </p>
                </div>
              </div>
            )}
            {secaoAtiva === "horarios" && (
              <div className="space-y-4">
                <div className="ui-card-muted p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Marcação de horário
                  </p>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white">
                    {form.modoHorario === "livre"
                      ? "Horário livre"
                      : "Por duração"}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {DIAS_SEMANA.map((dia, indice) => {
                    const item = form.diasDisponiveis[indice];
                    return (
                      <div
                        key={dia}
                        className="ui-card-muted flex items-center justify-between p-3"
                      >
                        <strong>{dia}</strong>
                        <span className="text-sm text-slate-600 dark:text-zinc-300">
                          {item?.ativo
                            ? `${item.inicio} – ${item.fim}`
                            : "Fechado"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {secaoAtiva === "conflitos" && (
              <div>
                <p className="text-sm text-slate-600 dark:text-zinc-300">
                  Serviços que não podem ocorrer ao mesmo tempo.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(form.servicosConflitantes ?? []).length ? (
                    outrosServicos
                      .filter((servico) =>
                        form.servicosConflitantes?.includes(servico.id!),
                      )
                      .map((servico) => (
                        <span
                          key={servico.id}
                          className="rounded-full bg-orange-100 px-3 py-2 text-sm font-bold text-orange-800 dark:bg-orange-400/15 dark:text-orange-200"
                        >
                          {servico.nome}
                        </span>
                      ))
                  ) : (
                    <p className="ui-card-muted p-4 text-sm text-slate-600 dark:text-zinc-300">
                      Nenhum conflito configurado.
                    </p>
                  )}
                </div>
              </div>
            )}
            {secaoAtiva === "avaliacoes" && (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {avaliacoes.length ? (
                  avaliacoes.map(([id, avaliacao]) => (
                    <article key={id} className="ui-card-muted p-4">
                      <div className="flex items-center justify-between">
                        <strong>{avaliacao.nomeAutor || "Cliente"}</strong>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                          <Star size={15} className="fill-current" />{" "}
                          {avaliacao.nota}
                        </span>
                      </div>
                      {avaliacao.comentario && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
                          {avaliacao.comentario}
                        </p>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="ui-card-muted p-4 text-sm text-slate-600 dark:text-zinc-300">
                    Ainda não há avaliações para este serviço.
                  </p>
                )}
              </div>
            )}
          </section>
        )}
        {(!idServico || editando) && (
          <Formulario
            className={`${classeFormularioEdicao} ${idServico ? "md:col-start-2" : ""}`}
          >
            <TextInput
              titulo="CNPJ da Empresa"
              type="text"
              value={form.cnpj}
              onChange={() => {}}
              disabled
              cnpj
            />
            <TextInput
              titulo="Nome"
              type="text"
              value={form.nome}
              onChange={(value) => handleChange("nome", value)}
              required
              maxLength={75}
            />
            <UploadImagem
              label="Imagem do Serviço"
              onUpload={(url) => handleChange("imagem", url)}
            />
            <TextInput
              titulo="Descrição"
              type="text"
              value={form.descricao ?? ""}
              onChange={(value) => handleChange("descricao", value)}
              required
              maxLength={200}
            />
            <TextInput
              titulo="Preço"
              type="number"
              value={form.preco ? String(form.preco) : ""}
              onChange={(value) => handleChange("preco", value)}
              required
            />
            <div className="flex gap-3">
              <TextInput
                titulo="Duração"
                type="number"
                value={form.duracao}
                onChange={(value) => handleChange("duracao", value)}
                required
              />
              <TextInput
                titulo="Tempo"
                type="select"
                value={form.tempo}
                options={tempos}
                onChange={(value) => handleChange("tempo", value)}
                required
              />
            </div>

            {/* ── Dias disponíveis ────────────────────────────────────────── */}
            <section className="ui-card mt-4 p-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                Como será o atendimento?
              </h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  [
                    "presencial-cliente",
                    "Presencial",
                    "Cliente vai até o local",
                  ],
                  ["presencial-prestador", "Presencial", "Vou até o cliente"],
                  ["online", "Online", "Atendimento pela internet"],
                ].map(([valor, titulo, descricao]) => (
                  <button
                    type="button"
                    key={valor}
                    onClick={() => atualizarConfiguracao("modalidade", valor)}
                    className={`rounded-xl border p-3 text-left transition ${form.configuracaoAtendimento?.modalidade === valor ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100" : "border-slate-200 hover:border-orange-300 dark:border-zinc-700"}`}
                  >
                    <span className="block text-sm font-bold">{titulo}</span>
                    <span className="mt-1 block text-xs opacity-80">
                      {descricao}
                    </span>
                  </button>
                ))}
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={
                    form.configuracaoAtendimento?.solicitarTelefone ?? false
                  }
                  onChange={(event) =>
                    atualizarConfiguracao(
                      "solicitarTelefone",
                      event.target.checked,
                    )
                  }
                />
                Solicitar telefone de contato no agendamento
              </label>
              <label className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={
                    form.configuracaoAtendimento?.observacaoObrigatoria ?? false
                  }
                  onChange={(event) =>
                    atualizarConfiguracao(
                      "observacaoObrigatoria",
                      event.target.checked,
                    )
                  }
                />{" "}
                Exigir observacao no agendamento
              </label>
              <label className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={
                    form.configuracaoAtendimento?.requerAprovacao ?? false
                  }
                  onChange={(event) =>
                    atualizarConfiguracao(
                      "requerAprovacao",
                      event.target.checked,
                    )
                  }
                />{" "}
                Exigir aprovacao antes de confirmar o agendamento
              </label>
              <div className="mt-4">
                <TextInput
                  titulo="Instrução para a observação do cliente"
                  value={
                    form.configuracaoAtendimento?.placeholderObservacao ?? ""
                  }
                  placeholder="Ex.: Informe o modelo do equipamento e o problema encontrado"
                  onChange={(valor) =>
                    atualizarConfiguracao("placeholderObservacao", valor)
                  }
                  maxLength={160}
                />
                <p className="-mt-3 text-xs text-slate-500 dark:text-zinc-400">
                  Este texto aparecerá como orientação no campo de observação do
                  agendamento.
                </p>
              </div>
            </section>

            <section className="ui-card p-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                Como os horários são marcados?
              </h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, modoHorario: "duracao" }))
                  }
                  className={`rounded-xl border p-3 text-left transition ${form.modoHorario !== "livre" ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100" : "border-slate-200 hover:border-orange-300 dark:border-zinc-700"}`}
                >
                  <span className="block text-sm font-bold">
                    Por duração (padrão)
                  </span>
                  <span className="mt-1 block text-xs opacity-80">
                    Ex.: serviço de 30 min permite 09:00, 09:30, 10:00.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, modoHorario: "livre" }))
                  }
                  className={`rounded-xl border p-3 text-left transition ${form.modoHorario === "livre" ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100" : "border-slate-200 hover:border-orange-300 dark:border-zinc-700"}`}
                >
                  <span className="block text-sm font-bold">Horário livre</span>
                  <span className="mt-1 block text-xs opacity-80">
                    O cliente informa qualquer horário dentro do período de
                    funcionamento.
                  </span>
                </button>
              </div>
            </section>

            <section className="ui-card p-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                Conflitos de agenda
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">
                Marque serviços que não podem ocorrer no mesmo horário.
              </p>
              <div className="mt-3 space-y-2">
                {outrosServicos.length ? (
                  outrosServicos.map((outro) => (
                    <label
                      key={outro.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm dark:bg-zinc-800"
                    >
                      <span>{outro.nome}</span>
                      <input
                        type="checkbox"
                        checked={
                          form.servicosConflitantes?.includes(outro.id!) ??
                          false
                        }
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            servicosConflitantes: event.target.checked
                              ? [
                                  ...(prev.servicosConflitantes ?? []),
                                  outro.id!,
                                ]
                              : (prev.servicosConflitantes ?? []).filter(
                                  (id) => id !== outro.id,
                                ),
                          }))
                        }
                      />
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Não há outros serviços nesta empresa.
                  </p>
                )}
              </div>
            </section>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">
                Dias disponíveis
              </span>
              <p className="text-xs text-gray-400 mb-2">
                Ao preencher o horário de um dia, ele será aplicado a todos os
                outros dias ativos automaticamente.
              </p>

              <div className="flex flex-col gap-2">
                {DIAS_SEMANA.map((dia, i) => {
                  const d = form.diasDisponiveis[i];
                  return (
                    <div key={dia} className="flex items-center gap-3">
                      {/* Bolinha do dia */}
                      <button
                        type="button"
                        onClick={() => toggleDia(i)}
                        className={`w-10 h-10 rounded-full text-xs font-bold shrink-0 transition-all border-2
                        ${
                          d.ativo
                            ? "bg-linear-to-br from-orange-500 to-violet-600 text-white border-orange-500 shadow-sm"
                            : "bg-white text-gray-500 border-gray-300 hover:border-orange-400 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {dia}
                      </button>

                      {/* Campos de horário — desabilitados se dia inativo */}
                      <div
                        className={`flex gap-2 flex-1 transition-opacity ${
                          d.ativo
                            ? "opacity-100"
                            : "opacity-30 pointer-events-none"
                        }`}
                      >
                        <TextInput
                          titulo="Início"
                          type="time"
                          value={d.inicio}
                          onChange={(v) => handleHorarioDia(i, "inicio", v)}
                          disabled={!d.ativo}
                        />
                        <TextInput
                          titulo="Fim"
                          type="time"
                          value={d.fim}
                          onChange={(v) => handleHorarioDia(i, "fim", v)}
                          disabled={!d.ativo}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aviso se nenhum dia ativo */}
              {diasAtivos.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Selecione ao menos um dia disponível.
                </p>
              )}
            </div>
            {idServico && (
              <section className="ui-card h-full max-h-80 overflow-y-auto p-5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Avaliações
                  </h2>
                  <span className="text-sm text-slate-500">
                    {form.totalAvaliacoes ?? 0} no total
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {form.totalAvaliacoes ? (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <Star size={16} className="fill-current" />{" "}
                      {form.avaliacaoMedia?.toFixed(1)}
                    </span>
                  ) : null}
                  {avaliacoes.length ? (
                    avaliacoes.map(([id, avaliacao]) => (
                      <article
                        key={id}
                        className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-zinc-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-slate-800 dark:text-zinc-100">
                            {avaliacao.nomeAutor || "Cliente"}
                          </strong>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <Star size={14} className="fill-current" />{" "}
                            {avaliacao.nota}
                          </span>
                        </div>
                        {avaliacao.comentario && (
                          <p className="mt-2 text-slate-600 dark:text-zinc-300">
                            {avaliacao.comentario}
                          </p>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                      Ainda não há avaliações para este serviço.
                    </p>
                  )}
                </div>
              </section>
            )}
          </Formulario>
        )}

        {idServico && secaoAtiva === "agenda" && (
          <section className="ui-card h-96 min-h-0 p-3 md:col-start-2">
            <AgendaUnificada
              tituloLista="Agendamentos deste serviço"
              tituloAgenda="Agenda do serviço"
              agendamentos={agendaServico}
              janelaHoras={4}
              ocultarAgendaNoMobile
              rotuloAgendamento={(agendamento) =>
                `${agendamento.clienteNome ?? "Cliente"} — ${agendamento.servico.nome}`
              }
              onDetalhes={setAgendamentoDetalhado}
              onCancelar={cancelarAgendamentoDaAgenda}
            />
          </section>
        )}
        {false && idServico && secaoAtiva === "agenda" && (
          <section className="ui-card p-3 md:col-start-2">
            {mostrandoHorariosAgenda ? (
              <PainelAgenda
                className="h-96"
                tituloLista="Agendamentos deste serviço"
                tituloAgenda="Agenda do serviço"
                data={dataAgenda}
                agendamentos={agendaServico}
                selecionadoId={agendamentoDetalhado?.id}
                onSelecionar={(agendamento) => {
                  setDataAgenda(agendamento.data);
                  setMesAgenda(new Date(`${agendamento.data}T12:00:00`));
                  setAgendamentoDetalhado(agendamento);
                }}
                janelaHoras={4}
                ocultarAgendaNoMobile
                acaoCabecalho={
                  <button
                    type="button"
                    className="ui-button-secondary text-sm"
                    onClick={() => setMostrandoHorariosAgenda(false)}
                  >
                    Alterar data
                  </button>
                }
                rotuloAgendamento={(agendamento) =>
                  `${agendamento.clienteNome ?? "Cliente"} — ${agendamento.servico.nome}`
                }
                acoesAgendamento={(agendamento) =>
                  agendamento.status === "aguardando_aprovacao" ? (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!agendamento.id) return;
                          await responderAgendamento(agendamento.id, true);
                          setAgendaServico((itens) =>
                            itens.map((item) =>
                              item.id === agendamento.id
                                ? { ...item, status: "agendado" }
                                : item,
                            ),
                          );
                          showAlerta(
                            "Agendamento aprovado",
                            "O cliente foi notificado.",
                            "sucesso",
                          );
                        }}
                        className="rounded px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-100"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!agendamento.id) return;
                          await responderAgendamento(agendamento.id, false);
                          setAgendaServico((itens) =>
                            itens.filter((item) => item.id !== agendamento.id),
                          );
                          showAlerta(
                            "Agendamento recusado",
                            "O cliente foi notificado.",
                            "sucesso",
                          );
                        }}
                        className="rounded px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
                      >
                        Recusar
                      </button>
                    </>
                  ) : undefined
                }
              />
            ) : (
              <div className="hidden h-96 flex-col md:flex">
                <header className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      Escolha uma data
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                      Depois, você verá os horários em uma linha do tempo.
                    </p>
                  </div>
                  <NavegacaoMes
                    mes={mesAgenda}
                    onAnterior={() =>
                      setMesAgenda(
                        (mes) =>
                          new Date(mes.getFullYear(), mes.getMonth() - 1, 1),
                      )
                    }
                    onProximo={() =>
                      setMesAgenda(
                        (mes) =>
                          new Date(mes.getFullYear(), mes.getMonth() + 1, 1),
                      )
                    }
                  />
                </header>
                <GradeDisponibilidade
                  ano={mesAgenda.getFullYear()}
                  mes={mesAgenda.getMonth()}
                  diasFuncionamento={[0, 1, 2, 3, 4, 5, 6]}
                  disponibilidades={{}}
                  modo="agenda"
                  preencherAltura
                  datasComAgendamento={agendaServico.map(
                    (agendamento) => agendamento.data,
                  )}
                  dataSelecionada={dataAgenda}
                  onDiaSelecionado={(dia) => {
                    setDataAgenda(
                      `${mesAgenda.getFullYear()}-${String(mesAgenda.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
                    );
                    setMostrandoHorariosAgenda(true);
                  }}
                />
              </div>
            )}
          </section>
        )}
        {agendamentoDetalhado && (
          <DetalhesAgendamento
            agendamento={agendamentoDetalhado}
            tipoUsuario="prestador"
            onFechar={() => setAgendamentoDetalhado(undefined)}
            onCancelar={async (agendamento) => {
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
                setAgendaServico((atual) =>
                  atual.filter((item) => item.id !== agendamento.id),
                );
                setAgendamentoDetalhado(undefined);
                showAlerta(
                  "Agendamento cancelado",
                  "O horário voltou a ficar disponível.",
                  "sucesso",
                );
              } catch (error) {
                showAlerta(
                  "Não foi possível cancelar",
                  error instanceof Error ? error.message : "Tente novamente.",
                  "erro",
                );
              }
            }}
          />
        )}

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {!idServico && (
          <div>
            <button
              className={`
            w-full rounded-xl py-4 font-bold text-white transition-all ${idServico ? "shadow-lg ring-2 ring-orange-200 ring-offset-2 ring-offset-white hover:-translate-y-0.5 dark:ring-offset-zinc-900" : "mb-10"}
            ${
              isValid
                ? "bg-linear-to-br from-orange-500 to-violet-600 hover:from-orange-600 hover:to-violet-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
              disabled={!isValid}
              onClick={handleConfirmar}
            >
              Criar serviço
            </button>
          </div>
        )}
        {idServico && (
          <>
            <section className="w-full min-w-0 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/25 md:col-start-2">
              <h2 className="font-bold text-red-900 dark:text-red-100">
                Zona de perigo
              </h2>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                A exclusão remove o serviço da sua empresa. Serviços com
                agendamentos não podem ser excluídos.
              </p>
              <button
                type="button"
                onClick={handleExcluir}
                className="ui-button-danger mt-4 inline-flex items-center gap-2"
              >
                <Trash2 size={17} />
                Excluir serviço
              </button>
            </section>
            <div
              className="hidden h-px md:col-start-2 md:block"
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TelaCriarServico;
