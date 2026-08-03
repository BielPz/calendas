import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Pencil, Star, Trash2 } from "lucide-react";
import Agenda from "../components/Agenda";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import type { Servico, DiaDisponivel } from "../firebase/types";
import CabecalhoBranco from "../components/CabecalhoBranco";
import { atualizarServico, criarServico, excluirServico, getServico, getServicosDaEmpresa } from "../features/servicos/servico.service";
import { getAgendamentosDoServico } from "../features/agendamentos/agendamento.service";
import { getEmpresaPorId } from "../features/empresas/empresa.service";
import { useLocation, useNavigate } from "react-router-dom";
import UploadImagem from "../components/UploadImagem";
import { useAlerta } from "../provider/AlertContext";

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
  const { showAlerta } = useAlerta();
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
    },
    modoHorario: "duracao",
  });
  const [erro, setErro] = useState("");
  const [dataAgenda, setDataAgenda] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [agendaServico, setAgendaServico] = useState<import("../firebase/types").Agendamento[]>([]);
  const [outrosServicos, setOutrosServicos] = useState<Servico[]>([]);
  const [secaoAtiva, setSecaoAtiva] = useState("basicos");

  // Refs síncronas para gravar qual índice de dia ativou a propagação inicial.
  // Evita lags de estado assíncrono entre keystrokes rápidas.
  const origemPropagacaoInicio = useRef<number | null>(null);
  const origemPropagacaoFim = useRef<number | null>(null);

  useEffect(() => {
    if (idServico) {
      getServico(idServico).then((dados) => {
        if (dados) setForm({ ...dados, modoHorario: dados.modoHorario ?? "duracao" });
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

  useEffect(() => { if (idEmpresa) getServicosDaEmpresa(idEmpresa).then((itens) => setOutrosServicos(itens.filter((item) => item.id !== idServico))); }, [idEmpresa, idServico]);

  useEffect(() => {
    if (!idServico) return;
    getAgendamentosDoServico(idServico).then((itens) => setAgendaServico(itens.filter((item) => item.data === dataAgenda)));
  }, [dataAgenda, idServico]);

  // ── Handlers gerais ────────────────────────────────────────────────────────
  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: campo === "preco" ? Number(value) : value,
    }));
  };

  const atualizarConfiguracao = (
    campo: "modalidade" | "solicitarTelefone" | "placeholderObservacao" | "observacaoObrigatoria",
    valor: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      configuracaoAtendimento: {
        modalidade: "presencial-cliente",
        solicitarTelefone: false,
        placeholderObservacao: "",
        observacaoObrigatoria: false,
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
      // Correção do Bug 2: Limpa horários de dias inativos antes de salvar no Firebase
      const formSanitizado: Servico = {
        ...form,
        diasDisponiveis: form.diasDisponiveis.map((d) =>
          d.ativo ? d : { ...d, inicio: "", fim: "" },
        ),
      };

      if (idServico) {
        await atualizarServico(idServico, formSanitizado);
      } else {
        await criarServico(formSanitizado, idEmpresa);
      }
      showAlerta("Sucesso", idServico ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!", "sucesso");
      navigate("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
      showAlerta("Erro", errorMessage, "erro");
    }
  };

  const handleExcluir = async () => {
    if (!idServico) return;
    const confirmado = window.confirm(
      `Excluir o serviço “${form.nome}”? Esta ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirServico(idServico);
      showAlerta("Serviço excluído", "O serviço foi removido com sucesso.", "sucesso");
      navigate("/feed");
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Não foi possível excluir o serviço.";
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
  const visibilidadePorSecao: Record<string, string> = {
    basicos: "[&>div]:hidden [&>div:nth-child(1)]:block [&>div:nth-child(2)]:block [&>div:nth-child(3)]:block [&>div:nth-child(4)]:block [&>div:nth-child(5)]:block [&>div:nth-child(6)]:block",
    atendimento: "[&>div]:hidden [&>div:nth-child(7)]:block",
    horarios: "[&>div]:hidden [&>div:nth-child(8)]:block [&>div:nth-child(10)]:block",
    conflitos: "[&>div]:hidden [&>div:nth-child(9)]:block",
    avaliacoes: "[&>div]:hidden [&>div:nth-child(11)]:block",
    agenda: "hidden",
  };
  const classeFormularioEdicao = idServico
    ? `grid gap-4 md:grid-cols-2 [&>div]:rounded-2xl [&>div]:border [&>div]:border-slate-200 [&>div]:bg-white/95 [&>div]:p-4 [&>div]:shadow-sm dark:[&>div]:border-zinc-700 dark:[&>div]:bg-zinc-900/95 ${visibilidadePorSecao[secaoAtiva]}`
    : "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex min-h-screen flex-col items-center justify-start ${idServico ? "bg-linear-to-br from-orange-400 via-rose-400 to-violet-500" : "dark:bg-zinc-900"}`}>
      {idServico ? <div className="sticky top-0 z-20 flex w-full max-w-6xl items-center px-4 py-3"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-white"><ArrowLeft size={16} /> Voltar</button></div> : <CabecalhoBranco titulo="Cadastre seu Serviço" />}
      <div className={`flex w-full flex-col gap-3 px-4 ${idServico ? "max-w-6xl py-3" : "max-w-xl"}`}>
        {idServico && (
          <section className="ui-card overflow-hidden">
            <div className="grid sm:grid-cols-[9rem_1fr]">
              <div className="min-h-36 bg-linear-to-br from-orange-100 to-violet-200 dark:from-orange-500/15 dark:to-violet-500/15">{form.imagem && <img src={form.imagem} alt={form.nome} className="h-full w-full object-cover" />}</div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Modo de edição</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">{form.nome || "Serviço"}<Pencil size={16} className="text-orange-500" /></h1><p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">R$ {Number(form.preco || 0).toFixed(2)} · {form.duracao || "—"} {form.tempo}</p><p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">Edite os campos abaixo e salve quando terminar.</p></div><button type="button" disabled={!isValid} onClick={handleConfirmar} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition ${isValid ? "bg-gradient-to-r from-orange-600 via-red-500 to-violet-700 hover:-translate-y-0.5" : "cursor-not-allowed bg-slate-400 opacity-70"}`}>Salvar alterações</button></div>
            </div>
          </section>
        )}
        {idServico && <nav className="ui-card flex gap-2 overflow-x-auto p-2" aria-label="Seções da edição">
          {secoesEdicao.map(([idSecao, titulo]) => <button key={idSecao} type="button" onClick={() => setSecaoAtiva(idSecao)} aria-pressed={secaoAtiva === idSecao} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition ${secaoAtiva === idSecao ? "bg-gradient-to-r from-orange-500 to-violet-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-orange-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}>{titulo}</button>)}
        </nav>}
        {idServico && secaoAtiva === "agenda" && <div className="w-full">
          <section className="ui-card p-5"><h2 className="font-bold text-slate-900 dark:text-white">Visibilidade da agenda</h2><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Defina o que clientes podem consultar.</p><div className="mt-4 flex flex-wrap gap-2">{[["dia", "Somente hoje"], ["todos", "Todos os dias"], ["oculta", "Ocultar"]].map(([valor, titulo]) => <button key={valor} type="button" onClick={() => setForm((prev) => ({ ...prev, visibilidadeAgenda: valor as Servico["visibilidadeAgenda"] }))} className={`rounded-lg px-3 py-2 text-sm font-bold ${(form.visibilidadeAgenda ?? "todos") === valor ? "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-200" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>{titulo}</button>)}</div></section>
        </div>}
        <Formulario className={classeFormularioEdicao}>
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
            <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">Como será o atendimento?</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[["presencial-cliente", "Presencial", "Cliente vai até o local"], ["presencial-prestador", "Presencial", "Vou até o cliente"], ["online", "Online", "Atendimento pela internet"]].map(([valor, titulo, descricao]) => (
                <button type="button" key={valor} onClick={() => atualizarConfiguracao("modalidade", valor)} className={`rounded-xl border p-3 text-left transition ${form.configuracaoAtendimento?.modalidade === valor ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100" : "border-slate-200 hover:border-orange-300 dark:border-zinc-700"}`}>
                  <span className="block text-sm font-bold">{titulo}</span>
                  <span className="mt-1 block text-xs opacity-80">{descricao}</span>
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
              <input type="checkbox" checked={form.configuracaoAtendimento?.solicitarTelefone ?? false} onChange={(event) => atualizarConfiguracao("solicitarTelefone", event.target.checked)} />
              Solicitar telefone de contato no agendamento
            </label>
            <label className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200"><input type="checkbox" checked={form.configuracaoAtendimento?.observacaoObrigatoria ?? false} onChange={(event) => atualizarConfiguracao("observacaoObrigatoria", event.target.checked)} /> Exigir observacao no agendamento</label>
            <div className="mt-4">
              <TextInput titulo="Instrução para a observação do cliente" value={form.configuracaoAtendimento?.placeholderObservacao ?? ""} placeholder="Ex.: Informe o modelo do equipamento e o problema encontrado" onChange={(valor) => atualizarConfiguracao("placeholderObservacao", valor)} maxLength={160} />
              <p className="-mt-3 text-xs text-slate-500 dark:text-zinc-400">Este texto aparecerá como orientação no campo de observação do agendamento.</p>
            </div>
          </section>

          <section className="ui-card p-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">Como os horários são marcados?</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, modoHorario: "duracao" }))} className={`rounded-xl border p-3 text-left transition ${form.modoHorario !== "livre" ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100" : "border-slate-200 hover:border-orange-300 dark:border-zinc-700"}`}>
                <span className="block text-sm font-bold">Por duração (padrão)</span>
                <span className="mt-1 block text-xs opacity-80">Ex.: serviço de 30 min permite 09:00, 09:30, 10:00.</span>
              </button>
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, modoHorario: "livre" }))} className={`rounded-xl border p-3 text-left transition ${form.modoHorario === "livre" ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100" : "border-slate-200 hover:border-orange-300 dark:border-zinc-700"}`}>
                <span className="block text-sm font-bold">Horário livre</span>
                <span className="mt-1 block text-xs opacity-80">O cliente informa qualquer horário dentro do período de funcionamento.</span>
              </button>
            </div>
          </section>

          <section className="ui-card p-4"><h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">Conflitos de agenda</h2><p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">Marque serviços que não podem ocorrer no mesmo horário.</p><div className="mt-3 space-y-2">{outrosServicos.length ? outrosServicos.map((outro) => <label key={outro.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm dark:bg-zinc-800"><span>{outro.nome}</span><input type="checkbox" checked={form.servicosConflitantes?.includes(outro.id!) ?? false} onChange={(event) => setForm((prev) => ({ ...prev, servicosConflitantes: event.target.checked ? [...(prev.servicosConflitantes ?? []), outro.id!] : (prev.servicosConflitantes ?? []).filter((id) => id !== outro.id) }))} /></label>) : <p className="text-sm text-slate-500">Não há outros serviços nesta empresa.</p>}</div></section>


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
          {idServico && <section className="ui-card h-full max-h-80 overflow-y-auto p-5 md:col-span-2"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900 dark:text-white">Avaliações</h2><span className="text-sm text-slate-500">{form.totalAvaliacoes ?? 0} no total</span></div><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{form.totalAvaliacoes ? <span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star size={16} className="fill-current" /> {form.avaliacaoMedia?.toFixed(1)}</span> : null}<p className="mt-2">As avaliações dos clientes aparecem aqui.</p></div></section>}
        </Formulario>

        {idServico && secaoAtiva === "agenda" && (
          <section className="ui-card p-3">
            <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Agenda deste serviço<input type="date" value={dataAgenda} onChange={(event) => setDataAgenda(event.target.value)} className="ui-input mt-2 py-2" /></label>
            <div className="h-96"><Agenda titulo="Agenda do serviço" data={dataAgenda} agendamentos={agendaServico} janelaHoras={4} rotuloAgendamento={(agendamento) => `${agendamento.clienteNome ?? "Cliente"} — ${agendamento.servico.nome}`} /></div>
          </section>
        )}

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {!idServico && <div>
        <button
          className={`
            w-full rounded-xl py-4 font-bold text-white transition-all ${idServico ? "shadow-lg ring-2 ring-orange-200 ring-offset-2 ring-offset-white hover:-translate-y-0.5 dark:ring-offset-zinc-900" : "mb-10"}
            ${
              isValid
                ? "bg-linear-to-r from-orange-600 via-red-500 to-violet-700 hover:from-orange-700 hover:via-red-600 hover:to-violet-800 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          disabled={!isValid}
          onClick={handleConfirmar}
        >
          Criar serviço
        </button>
        </div>}
        {idServico && (
          <section className="mb-10 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/25">
            <h2 className="font-bold text-red-900 dark:text-red-100">Zona de perigo</h2>
            <p className="mt-1 text-sm text-red-800 dark:text-red-200">A exclusão remove o serviço da sua empresa. Serviços com agendamentos não podem ser excluídos.</p>
            <button type="button" onClick={handleExcluir} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-transparent dark:text-red-200 dark:hover:bg-red-900/30">
              <Trash2 size={17} />
              Excluir serviço
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default TelaCriarServico;
