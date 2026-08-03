import { useEffect, useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import MiniCalendario from "../components/MiniCalendario";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { X } from "lucide-react";
import type { Agendamento, Disponibilidade, Servico } from "../firebase/types";
import TextInput from "../components/TextInput";
import { getServicosDaEmpresa } from "../features/servicos/servico.service";
import {
  agendarServico,
  cancelarAgendamento,
  getAgendamentosDoServico,
  getDisponibilidadeDiaria,
  getDisponibilidadeMensal,
} from "../features/agendamentos/agendamento.service";
import GradeDisponibilidade from "../components/GradeDisponibilidade";
import { useGradiente } from "../hooks/useGradiente";
import { useAlerta } from "../provider/AlertContext";
import Loading from "../components/Loading";
import Agenda from "../components/Agenda";

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
      cnpj: "", nome: "", preco: 0, duracao: "", tempo: "", diasDisponiveis: [],
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
  };
  const duracaoMinutos = (() => {
    const valor = Number(form.servico.duracao) || 60;
    if (form.servico.tempo === "hora") return valor * 60;
    if (form.servico.tempo === "dia") return valor * 1440;
    return valor;
  })();
  const modoHorarioLivre = form.servico.modoHorario === "livre";
  const horarioLivreValido = useMemo(() => {
    if (!modoHorarioLivre || !form.data || !form.horario) return true;
    const dia = form.servico.diasDisponiveis[new Date(`${form.data}T12:00:00`).getDay()];
    if (!dia?.ativo || !dia.inicio || !dia.fim) return false;
    const paraMinutos = (horario: string) => {
      const [hora, minuto] = horario.split(":").map(Number);
      return hora * 60 + minuto;
    };
    const inicio = paraMinutos(form.horario);
    return inicio >= paraMinutos(dia.inicio) && inicio + duracaoMinutos <= paraMinutos(dia.fim);
  }, [duracaoMinutos, form.data, form.horario, form.servico.diasDisponiveis, modoHorarioLivre]);

  const hoje = new Date();
  const mes = form.data
    ? new Date(form.data + "T12:00:00").getMonth()
    : hoje.getMonth(); // 0-11
  const ano = form.data
    ? new Date(form.data + "T12:00:00").getFullYear()
    : hoje.getFullYear();

  const diasDisponiveis = useMemo(() => {
    if (!form.servico) return [];
    return form.servico.diasDisponiveis
      .map((dia, index) => (dia.ativo ? index : -1))
      .filter((i) => i !== -1);
  }, [form.servico]);

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<
    { label: string; value: string }[]
  >([]);
  const [horariosBase, setHorariosBase] = useState<{ label: string; value: string }[]>([]);
  const [atualizarDisponibilidade, setAtualizarDisponibilidade] =
    useState<Disponibilidade | null>(null);
  const [agendaDoServico, setAgendaDoServico] = useState<Agendamento[]>([]);
  const [modalMobileAberto, setModalMobileAberto] = useState(false);

  // Converte dia numérico (ex: 15) + ano/mes atual para ISO string e abre modal mobile
  const handleDiaSelecionadoMobile = (dia: number) => {
    const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    handleChange("data", dataISO);
    setModalMobileAberto(true);
  };

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const handleServicoChange = (idServico: string) => {
    const servicoSelecionado = servicos.find((servico) => servico.value === idServico);
    if (!servicoSelecionado) return;
    getServicosDaEmpresa(form.servico.idEmpresa ?? "").then((lista) => {
      const encontrado = lista.find((item) => item.id === idServico);
      if (encontrado) {
        setForm((prev) => ({ ...prev, servico: encontrado, horario: "" }));
      }
    }).catch(() => showAlerta("Erro", "Não foi possível carregar o serviço.", "erro"));
  };

  const handleClickAgendar = async () => {
    if (form.servico && form.data && form.horario) {
      try {
        await agendarServico(form, getAuth().currentUser!.uid);
        if (idAgendamentoOriginal) await cancelarAgendamento(idAgendamentoOriginal);
        showAlerta(
          "Sucesso",
          idAgendamentoOriginal ? "Agendamento reagendado com sucesso!" : "Agendamento realizado com sucesso!",
          "sucesso",
        );
        navigate("/feed");
      } catch (error) {
        console.error("Erro ao agendar serviço:", error);
        showAlerta(
          "Erro",
          "Não foi possível realizar o agendamento. Tente novamente.",
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
    const intervaloMs = form.servico.modoHorario === "livre"
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
      .then((agendamentos) => setAgendaDoServico(
        agendamentos.filter((agendamento) => agendamento.data === form.data && agendamento.status !== "cancelado"),
      ))
      .catch(() => setAgendaDoServico([]));
  }, [form.data, form.servico.id]);

  const agendamentosNaAgenda = useMemo(() => [
    ...agendaDoServico,
    ...(form.horario ? [{ ...form, id: "selecionado", status: "agendado" as const, duracaoMinutos }] : []),
  ], [agendaDoServico, duracaoMinutos, form]);

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
    <div
      className={`${cor_fundo} h-dvh w-full flex flex-col overflow-hidden`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex min-h-0 flex-col grow w-full items-center overflow-hidden">
        <div className="flex min-h-0 w-full max-w-7xl flex-col gap-4 p-4 grow overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              className="ui-button-secondary px-4"
              onClick={() => navigate("/feed")}
            >
              <X
                size={20}
                strokeWidth={3}
                className="text-gray-500 dark:text-gray-300"
              />
            </button>
            <div className="ui-card flex w-full items-center px-4 py-2">
              <h1 className="text-gray-700 dark:text-gray-50 font-semibold">
                {empresa}
              </h1>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop */}
            <div className="ui-card hidden h-full md:block md:w-1/5 p-3 shrink-0 overflow-y-auto">
              <MiniCalendario
                onChange={(date) =>
                  handleChange("data", date?.toISOString().split("T")[0] ?? "")
                }
                agendamento
                value={form.data === undefined ? undefined : form.data}
              />
              {/* Adicionar seleção de serviço e horário e botão para agendar */}
              <div className="mt-6">
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
                  <TextInput titulo="Horário" type="time" value={form.horario} onChange={(value) => handleChange("horario", value)} />
                ) : (
                  <TextInput titulo="Horário" type="select" onChange={(value) => handleChange("horario", value)} options={horariosDisponiveis} />
                )}
                <TextInput
                  titulo="Observação"
                  type="text"
                  onChange={(value) => handleChange("obs", value)}
                  placeholder={configuracao.placeholderObservacao || "Observações para o prestador"}
                />
                {configuracao.observacaoObrigatoria && !form.obs.trim() && <p className="-mt-3 mb-3 text-xs font-medium text-red-600 dark:text-red-300">A observacao e obrigatoria para este servico.</p>}
                {configuracao.solicitarTelefone && (
                  <TextInput titulo="Telefone para contato" type="tel" required value={form.telefoneContato ?? ""} onChange={(value) => handleChange("telefoneContato", value)} />
                )}
                {configuracao.modalidade === "presencial-prestador" && <p className="mb-4 rounded-lg bg-orange-50 p-3 text-xs text-orange-900 dark:bg-orange-400/10 dark:text-orange-100">O prestador irá até o endereço salvo no seu perfil.</p>}
                {configuracao.modalidade === "online" && <p className="mb-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-900 dark:bg-violet-400/10 dark:text-violet-100">Este atendimento será online.</p>}
                <button
                  onClick={handleClickAgendar}
                  className={`
                  w-full py-4 rounded-xl text-white font-semibold mb-10
                  ${
                    isValid
                      ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed opacity-70"
                  }
                `}
                >
                  Agendar
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-4/5 min-h-0">
              <div className="ui-card flex min-h-0 flex-1 flex-col overflow-hidden p-3">
                {/* Aqui é o conteúdo do calendário do principal da empresa */}
                {form.data ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-zinc-700">
                      <div>
                        <h2 className="font-bold text-slate-800 dark:text-zinc-100">Escolha seu horário</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">{new Date(`${form.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
                      </div>
                      <button type="button" className="ui-button-secondary text-sm" onClick={() => handleChange("data", "")}>Alterar data</button>
                    </div>
                    <Agenda titulo="Agenda" data={form.data} agendamentos={agendamentosNaAgenda} selecionadoId="selecionado" rotuloAgendamento={(agendamento) => agendamento.id === "selecionado" ? "Horário selecionado" : "Horário reservado"} />
                    {modoHorarioLivre && !horarioLivreValido && form.horario && <p className="mt-3 text-center text-xs font-medium text-red-600 dark:text-red-300">Escolha um horário que termine dentro do período de funcionamento.</p>}
                  </>
                ) : (
                  <>
                    <h2 className="mb-2 font-bold text-slate-800 dark:text-zinc-100">Escolha uma data</h2>
                    <p className="mb-4 text-sm text-slate-500 dark:text-zinc-400">Depois, você verá os horários disponíveis em uma linha do tempo.</p>
                    <GradeDisponibilidade
                      ano={ano}
                      mes={mes}
                      diasFuncionamento={diasDisponiveis}
                      disponibilidades={atualizarDisponibilidade || {}}
                      onDiaSelecionado={handleDiaSelecionadoMobile}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom sheet mobile — aparece ao clicar num dia disponível ── */}
          {modalMobileAberto && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setModalMobileAberto(false)}
              />

              {/* Painel */}
              <div className="relative bg-white dark:bg-zinc-800 rounded-t-2xl p-5 flex flex-col gap-3 shadow-xl max-h-[85vh] overflow-y-auto">
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
                  <TextInput titulo="Horário" type="time" value={form.horario} onChange={(value) => handleChange("horario", value)} />
                ) : (
                  <TextInput titulo="Horário" type="select" onChange={(value) => handleChange("horario", value)} options={horariosDisponiveis} />
                )}
                <TextInput
                  titulo="Observação"
                  type="text"
                  onChange={(value) => handleChange("obs", value)}
                  placeholder={configuracao.placeholderObservacao || "Observações para o prestador"}
                />
                {configuracao.observacaoObrigatoria && !form.obs.trim() && <p className="-mt-3 mb-3 text-xs font-medium text-red-600 dark:text-red-300">A observacao e obrigatoria para este servico.</p>}
                {configuracao.solicitarTelefone && (
                  <TextInput titulo="Telefone para contato" type="tel" required value={form.telefoneContato ?? ""} onChange={(value) => handleChange("telefoneContato", value)} />
                )}
                {configuracao.modalidade === "presencial-prestador" && <p className="rounded-lg bg-orange-50 p-3 text-xs text-orange-900 dark:bg-orange-400/10 dark:text-orange-100">O prestador irá até o endereço salvo no seu perfil.</p>}
                {configuracao.modalidade === "online" && <p className="rounded-lg bg-violet-50 p-3 text-xs text-violet-900 dark:bg-violet-400/10 dark:text-violet-100">Este atendimento será online.</p>}

                <button
                  onClick={() => {
                    handleClickAgendar();
                    setModalMobileAberto(false);
                  }}
                  className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all
                    ${
                      isValid
                        ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer shadow-md"
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
