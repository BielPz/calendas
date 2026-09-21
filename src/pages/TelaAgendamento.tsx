import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ArrowLeft, Clock3, X } from "lucide-react";
import type { Agendamento, Disponibilidade, Servico } from "../firebase/types";
import { getServicosDaEmpresa } from "../features/servicos/servico.service";
import {
  agendarServico,
  reagendarServico,
  getAgendamentosDoServico,
  getDisponibilidadeDiaria,
  getDisponibilidadeMensal,
} from "../features/agendamentos/agendamento.service";
import { useGradiente } from "../hooks/useGradiente";
import { useAlerta } from "../provider/AlertContext";
import { estaDentroDoFuncionamento } from "../lib/agenda";
import Loading from "@/components/utils/Loading";
import Cabecalho from "@/components/utils/Cabecalho";
import TextInput from "@/components/utils/TextInput";
import GradeDisponibilidade from "@/components/agenda/GradeDisponibilidade";
import NavegacaoMes from "@/components/agenda/NavegacaoMes";
import Agenda from "@/components/agenda/Agenda";

function TelaAgendamento() {
  const [servicos, setServicos] = useState<{ label: string; value: string }[]>(
    [],
  );
  const navigate = useNavigate();
  const cor_fundo = useGradiente();
  const { showAlerta } = useAlerta();

  const location = useLocation();
  const state = location.state as {
    servico: Servico;
    empresa: string;
    idAgendamentoOriginal?: string;
  } | null;
  const servicoInicial = state?.servico;
  const empresa = state?.empresa ?? "";
  const idAgendamentoOriginal = state?.idAgendamentoOriginal;

  const [form, setForm] = useState<Agendamento>({
    servico: servicoInicial ?? {
      cnpj: "",
      nome: "",
      preco: 0,
      duracao: "",
      tempo: "",
      diasDisponiveis: [],
    },
    data: "",
    horario: "",
    obs: "",
  });
  const configuracao = form.servico.configuracaoAtendimento ?? {
    modalidade: "presencial-cliente" as const,
    solicitarTelefone: false,
    placeholderObservacao: "",
    observacaoObrigatoria: false,
    requerAprovacao: false,
  };
  const duracaoMinutos = (() => {
    const valor = Number(form.servico.duracao) || 60;
    if (form.servico.tempo === "hora") return valor * 60;
    if (form.servico.tempo === "dia") return valor * 1440;
    return valor;
  })();
  const modoHorarioLivre = form.servico.modoHorario === "livre";
  const horarioLivreValido = useMemo(() => {
    if (!form.data || !form.horario) return true;
    return estaDentroDoFuncionamento(form.servico, form.data, form.horario);
  }, [form.data, form.horario, form.servico]);

  const [mesCalendario, setMesCalendario] = useState(() => new Date());
  const mes = mesCalendario.getMonth();
  const ano = mesCalendario.getFullYear();

  const diasDisponiveis = useMemo(() => {
    if (!form.servico) return [];
    return form.servico.diasDisponiveis
      .map((dia, index) => (dia.ativo ? index : -1))
      .filter((i) => i !== -1);
  }, [form.servico]);

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<
    { label: string; value: string }[]
  >([]);
  const [horariosBase, setHorariosBase] = useState<
    { label: string; value: string }[]
  >([]);
  const [atualizarDisponibilidade, setAtualizarDisponibilidade] =
    useState<Disponibilidade | null>(null);
  const [agendaDoServico, setAgendaDoServico] = useState<Agendamento[]>([]);
  const [modalMobileAberto, setModalMobileAberto] = useState(false);
  // Converte o dia da grade principal para a data usada no agendamento.
  const handleDiaSelecionado = (dia: number) => {
    const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    handleChange("data", dataISO);
  };

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const handleServicoChange = (idServico: string) => {
    const servicoSelecionado = servicos.find(
      (servico) => servico.value === idServico,
    );
    if (!servicoSelecionado) return;
    getServicosDaEmpresa(form.servico.idEmpresa ?? "")
      .then((lista) => {
        const encontrado = lista.find((item) => item.id === idServico);
        if (encontrado) {
          setForm((prev) => ({ ...prev, servico: encontrado, horario: "" }));
        }
      })
      .catch(() =>
        showAlerta("Erro", "Não foi possível carregar o serviço.", "erro"),
      );
  };

  const handleClickAgendar = async () => {
    if (!isValid) {
      if (form.data && form.horario && !horarioLivreValido) {
        showAlerta(
          "Fora do horário permitido",
          "Escolha um horário dentro do período de funcionamento do serviço.",
          "erro",
        );
      } else {
        showAlerta(
          "Dados incompletos",
          "Preencha os campos obrigatórios para agendar.",
          "info",
        );
      }
      return;
    }
    if (form.servico && form.data && form.horario) {
      try {
        if (idAgendamentoOriginal)
          await reagendarServico(
            form,
            getAuth().currentUser!.uid,
            idAgendamentoOriginal,
          );
        else await agendarServico(form, getAuth().currentUser!.uid);
        showAlerta(
          "Sucesso",
          idAgendamentoOriginal
            ? "Agendamento reagendado com sucesso!"
            : configuracao.requerAprovacao
              ? "Solicitação enviada. Aguarde a aprovação do prestador."
              : "Agendamento realizado com sucesso!",
          "sucesso",
        );
        navigate("/feed");
      } catch (error) {
        console.error("Erro ao agendar serviço:", error);
        showAlerta(
          error instanceof Error && error.message.includes("outro agendamento")
            ? "Horário indisponível"
            : "Erro",
          error instanceof Error
            ? error.message
            : "Não foi possível realizar o agendamento. Tente novamente.",
          "erro",
        );
      }
    } else {
      showAlerta(
        "info",
        "Por favor, preencha todos os campos obrigatórios.",
        "info",
      );
    }
  };

  const isValid = Boolean(
    servicoInicial &&
    form.servico.id &&
    form.data &&
    form.horario &&
    horarioLivreValido &&
    (!configuracao.observacaoObrigatoria || form.obs.trim()) &&
    (!configuracao.solicitarTelefone || form.telefoneContato?.trim()),
  );

  // Carrega os serviços da empresa para preencher o dropdown de seleção
  useEffect(() => {
    async function carregar() {
      if (!servicoInicial?.idEmpresa) return;
      const data = await getServicosDaEmpresa(servicoInicial.idEmpresa);
      const opcoes = data // Filtra serviços sem ID e mapeia para o formato esperado pelo TextInput
        .filter((s) => s.id !== undefined)
        .map((s) => ({
          label: s.nome, // Exibe o nome do serviço
          value: s.id!, // Usa o ID do serviço como valor
        }));
      setServicos(opcoes);
    }
    carregar();
  }, [servicoInicial?.idEmpresa]);

  // Atualiza os horários disponíveis
  useEffect(() => {
    if (!form.servico) return;

    const duracaoNum = Number(form.servico.duracao);
    const unidade = form.servico.tempo.toLowerCase();
    const intervaloMs =
      form.servico.modoHorario === "livre"
        ? 5 * 60 * 1000
        : unidade.startsWith("hora")
          ? duracaoNum * 60 * 60 * 1000
          : unidade.startsWith("dia")
            ? duracaoNum * 24 * 60 * 60 * 1000
            : duracaoNum * 60 * 1000;

    const novosHorarios: { label: string; value: string }[] = [];
    form.servico.diasDisponiveis.forEach((dia) => {
      if (dia.ativo) {
        const inicioMs = new Date(`1970-01-01T${dia.inicio}:00Z`).getTime();
        const fimMs = new Date(`1970-01-01T${dia.fim}:00Z`).getTime();
        const quantidade = Math.floor((fimMs - inicioMs) / intervaloMs);

        for (let i = 0; i < quantidade; i++) {
          const horario = new Date(inicioMs + i * intervaloMs)
            .toISOString()
            .substring(11, 16);
          if (!novosHorarios.find((h) => h.value === horario)) {
            novosHorarios.push({ label: horario, value: horario });
          }
        }
      }
    });
    setHorariosBase(novosHorarios);
    setHorariosDisponiveis(novosHorarios);
  }, [form.servico]);

  // Remover horários indisponíveis com base nos agendamentos existentes para o serviço, mês e ano selecionados
  useEffect(() => {
    if (!form.servico || horariosBase.length === 0) return;
    if (!form.data) {
      setHorariosDisponiveis(horariosBase);
      return;
    }

    const atualizar = async () => {
      const agendamentos = await getAgendamentosDoServico(form.servico!.id!);
      const disponibilidade = await getDisponibilidadeDiaria(
        form.servico!.id!,
        form.data,
        horariosBase.map((h) => h.value),
        agendamentos,
      );
      // Filtra os horários indisponíveis (null) e atualiza o estado
      setHorariosDisponiveis(
        Object.values(disponibilidade).filter(
          (h): h is { label: string; value: string } => h !== null,
        ),
      );
    };

    atualizar();
  }, [form.data, form.servico?.id, horariosBase]);

  useEffect(() => {
    if (!form.servico.id || !form.data) {
      setAgendaDoServico([]);
      return;
    }

    getAgendamentosDoServico(form.servico.id)
      .then((agendamentos) =>
        setAgendaDoServico(
          agendamentos.filter(
            (agendamento) =>
              agendamento.data === form.data &&
              agendamento.status !== "cancelado",
          ),
        ),
      )
      .catch(() => setAgendaDoServico([]));
  }, [form.data, form.servico.id]);

  const agendamentosNaAgenda = useMemo(
    () => [
      ...agendaDoServico,
      ...(form.horario
        ? [
            {
              ...form,
              id: "selecionado",
              status: "agendado" as const,
              duracaoMinutos,
            },
          ]
        : []),
    ],
    [agendaDoServico, duracaoMinutos, form],
  );

  // Busca disponibilidade — só roda quando horariosDisponiveis já está populado
  useEffect(() => {
    if (!form.servico?.id || !ano || horariosBase.length === 0) return;

    const atualizar = async () => {
      const agendamentos = await getAgendamentosDoServico(form.servico!.id!);
      const disponibilidade = await getDisponibilidadeMensal(
        form.servico!.id!,
        ano,
        mes + 1, // 1-12
        horariosBase.map((h) => h.value),
        agendamentos,
      );
      setAtualizarDisponibilidade(disponibilidade);
    };

    atualizar();
  }, [ano, mes, form.servico, horariosBase]);

  const nomeUsuario = getAuth().currentUser?.displayName || "";

  if (!servicoInicial) return <Navigate to="/feed" replace />;
  if (!nomeUsuario) return <Loading />;

  return (
    <div className={`${cor_fundo} h-dvh w-full flex flex-col overflow-hidden`}>
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex min-h-0 flex-1 w-full flex-col items-center overflow-hidden">
        <div className="flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-2 overflow-hidden p-3 md:px-6 md:py-3">
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-orange-100"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <section className="ui-card">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-orange-700 dark:text-orange-300">
                    {empresa || "Empresa"}
                  </p>
                  <h1 className="truncate text-base font-bold text-slate-900 dark:text-white">
                    {form.servico.nome}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Clock3
                      size={14}
                      className="text-orange-600 dark:text-orange-300"
                    />{" "}
                    {form.servico.duracao} {form.servico.tempo}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    R$ {Number(form.servico.preco || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 grow min-h-0 lg:flex-row">
            {/* Sidebar vertical — só desktop */}
            <div className="ui-card block h-full w-full shrink-0 overflow-y-auto p-3 lg:w-72">
              {/* Adicionar seleção de serviço e horário e botão para agendar */}
              <div>
                <div className="mb-5 border-b border-slate-200 pb-4 dark:border-zinc-700">
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Finalize seu agendamento
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    Informe os dados abaixo para reservar seu horário.
                  </p>
                </div>
                <TextInput
                  titulo="Serviço"
                  type="select"
                  onChange={handleServicoChange}
                  value={form.servico.id}
                  options={servicos}
                />
                <TextInput
                  titulo="Data"
                  type="date"
                  value={form.data === undefined ? undefined : form.data}
                  onChange={(value) => {
                    handleChange("data", value);
                    if (value) setMesCalendario(new Date(`${value}T12:00:00`));
                  }}
                  agendamento
                />
                {modoHorarioLivre ? (
                  <TextInput
                    titulo="Horário"
                    type="time"
                    value={form.horario}
                    onChange={(value) => handleChange("horario", value)}
                  />
                ) : (
                  <TextInput
                    titulo="Horário"
                    type="select"
                    onChange={(value) => handleChange("horario", value)}
                    options={horariosDisponiveis}
                  />
                )}
                <TextInput
                  titulo="Observação"
                  type="text"
                  onChange={(value) => handleChange("obs", value)}
                  placeholder={
                    configuracao.placeholderObservacao ||
                    "Observações para o prestador"
                  }
                />
                {configuracao.observacaoObrigatoria && !form.obs.trim() && (
                  <p className="-mt-3 mb-3 text-xs font-medium text-red-600 dark:text-red-300">
                    A observacao é obrigatoria para este servico.
                  </p>
                )}
                {configuracao.solicitarTelefone && (
                  <TextInput
                    titulo="Telefone para contato"
                    type="tel"
                    required
                    value={form.telefoneContato ?? ""}
                    onChange={(value) => handleChange("telefoneContato", value)}
                  />
                )}
                {configuracao.modalidade === "presencial-prestador" && (
                  <p className="mb-4 rounded-lg bg-orange-50 p-3 text-xs text-orange-900 dark:bg-orange-400/10 dark:text-orange-100">
                    O prestador irá até o endereço salvo no seu perfil.
                  </p>
                )}
                {configuracao.modalidade === "online" && (
                  <p className="mb-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-900 dark:bg-violet-400/10 dark:text-violet-100">
                    Este atendimento será online.
                  </p>
                )}
                <button
                  onClick={handleClickAgendar}
                  aria-disabled={!isValid}
                  className={`
                  w-full py-4 rounded-xl text-white font-semibold mb-10
                  ${
                    isValid
                      ? "bg-linear-to-br from-orange-500 to-violet-600 hover:from-orange-600 hover:to-violet-700 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed opacity-70"
                  }
                `}
                >
                  Agendar
                </button>
              </div>
            </div>

            <div className="hidden min-h-0 w-full flex-col gap-3 lg:flex lg:w-auto lg:flex-1">
              <div className="ui-card flex min-h-0 flex-1 flex-col overflow-hidden p-3">
                {/* Aqui é o conteúdo do calendário do principal da empresa */}
                {form.data ? (
                  <>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2 dark:border-zinc-700">
                      <div>
                        <h2 className="font-bold text-slate-800 dark:text-zinc-100">
                          Escolha seu horário
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                          {new Date(`${form.data}T12:00:00`).toLocaleDateString(
                            "pt-BR",
                            { weekday: "long", day: "2-digit", month: "long" },
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ui-button-secondary text-sm"
                        onClick={() => handleChange("data", "")}
                      >
                        Alterar data
                      </button>
                    </div>
                    <Agenda
                      titulo="Agenda"
                      data={form.data}
                      agendamentos={agendamentosNaAgenda}
                      selecionadoId="selecionado"
                      rotuloAgendamento={(agendamento) =>
                        agendamento.id === "selecionado"
                          ? "Horário selecionado"
                          : "Horário reservado"
                      }
                    />
                    {modoHorarioLivre &&
                      !horarioLivreValido &&
                      form.horario && (
                        <p className="mt-3 text-center text-xs font-medium text-red-600 dark:text-red-300">
                          Escolha um horário que termine dentro do período de
                          funcionamento.
                        </p>
                      )}
                  </>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-800 dark:text-zinc-100">
                          Escolha uma data
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                          Depois, você verá os horários disponíveis em uma linha
                          do tempo.
                        </p>
                      </div>
                      <NavegacaoMes
                        mes={mesCalendario}
                        onAnterior={() =>
                          setMesCalendario(
                            (data) =>
                              new Date(
                                data.getFullYear(),
                                data.getMonth() - 1,
                                1,
                              ),
                          )
                        }
                        onProximo={() =>
                          setMesCalendario(
                            (data) =>
                              new Date(
                                data.getFullYear(),
                                data.getMonth() + 1,
                                1,
                              ),
                          )
                        }
                      />
                    </div>
                    <GradeDisponibilidade
                      ano={ano}
                      mes={mes}
                      diasFuncionamento={diasDisponiveis}
                      disponibilidades={atualizarDisponibilidade || {}}
                      onDiaSelecionado={handleDiaSelecionado}
                      preencherAltura
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom sheet mobile — aparece ao clicar num dia disponível ── */}
          {modalMobileAberto && (
            <div className="hidden fixed inset-0 z-50 flex flex-col justify-end">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setModalMobileAberto(false)}
              />

              {/* Painel */}
              <div className="relative flex max-h-[88dvh] flex-col gap-3 overflow-y-auto rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl dark:bg-zinc-800">
                {/* Handle + cabeçalho */}
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-600 mx-auto mb-1" />
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                    Agendar horário
                  </h2>
                  <button
                    onClick={() => setModalMobileAberto(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300"
                  >
                    <X size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <TextInput
                  titulo="Serviço"
                  type="select"
                  onChange={handleServicoChange}
                  value={form.servico.id}
                  options={servicos}
                />
                <TextInput
                  titulo="Data"
                  type="date"
                  value={form.data === undefined ? undefined : form.data}
                  onChange={(value) => handleChange("data", value)}
                  agendamento
                />
                {modoHorarioLivre ? (
                  <TextInput
                    titulo="Horário"
                    type="time"
                    value={form.horario}
                    onChange={(value) => handleChange("horario", value)}
                  />
                ) : (
                  <TextInput
                    titulo="Horário"
                    type="select"
                    onChange={(value) => handleChange("horario", value)}
                    options={horariosDisponiveis}
                  />
                )}
                <TextInput
                  titulo="Observação"
                  type="text"
                  onChange={(value) => handleChange("obs", value)}
                  placeholder={
                    configuracao.placeholderObservacao ||
                    "Observações para o prestador"
                  }
                />
                {configuracao.observacaoObrigatoria && !form.obs.trim() && (
                  <p className="-mt-3 mb-3 text-xs font-medium text-red-600 dark:text-red-300">
                    A observacao é obrigatoria para este servico.
                  </p>
                )}
                {configuracao.solicitarTelefone && (
                  <TextInput
                    titulo="Telefone para contato"
                    type="tel"
                    required
                    value={form.telefoneContato ?? ""}
                    onChange={(value) => handleChange("telefoneContato", value)}
                  />
                )}
                {configuracao.modalidade === "presencial-prestador" && (
                  <p className="rounded-lg bg-orange-50 p-3 text-xs text-orange-900 dark:bg-orange-400/10 dark:text-orange-100">
                    O prestador irá até o endereço salvo no seu perfil.
                  </p>
                )}
                {configuracao.modalidade === "online" && (
                  <p className="rounded-lg bg-violet-50 p-3 text-xs text-violet-900 dark:bg-violet-400/10 dark:text-violet-100">
                    Este atendimento será online.
                  </p>
                )}

                <button
                  aria-disabled={!isValid}
                  onClick={() => {
                    handleClickAgendar();
                    if (isValid) setModalMobileAberto(false);
                  }}
                  className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all
                    ${
                      isValid
                        ? "bg-linear-to-br from-orange-500 to-violet-600 hover:from-orange-600 hover:to-violet-700 cursor-pointer shadow-md"
                        : "bg-gray-300 dark:bg-zinc-600 cursor-not-allowed opacity-60"
                    }`}
                >
                  Agendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TelaAgendamento;
