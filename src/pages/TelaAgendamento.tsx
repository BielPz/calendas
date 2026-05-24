import { useEffect, useMemo, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import MiniCalendario from "../components/MiniCalendario";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { X } from "lucide-react";
import type { Agendamento, Servico } from "../firebase/types";
import TextInput from "../components/TextInput";
import {
  agendarServico,
  getAgendamentosDoServico,
  getDisponibilidadeMensal,
  getServicosDaEmpresa,
} from "../firebase/database";
import GradeDisponibilidade from "../components/GradeDisponibilidade";
import { useGradiente } from "../hooks/useGradiente";
import { useAlerta } from "../provider/AlertContext";
import Loading from "../components/Loading";

interface Disponibilidade {
  [dia: number]: "sem-horario" | "parcial" | "disponivel";
}

function TelaAgendamento() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [servicos, setServicos] = useState<{ label: string; value: string }[]>(
    [],
  );
  const navigate = useNavigate();
  const cor_fundo = useGradiente();
  const { showAlerta } = useAlerta();

  const location = useLocation();
  const { servico, empresa } = location.state as {
    servico: Servico;
    empresa: string;
  };

  const [form, setForm] = useState<Agendamento>({
    servico: servico,
    data: "",
    horario: "",
    obs: "",
  });

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
  const [atualizarDisponibilidade, setAtualizarDisponibilidade] =
    useState<Disponibilidade | null>(null);

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const handleClickAgendar = () => {
    if (form.servico && form.data && form.horario) {
      const auth = getAuth();
      agendarServico(form, auth.currentUser!.uid)
        .then(() => {
          showAlerta(
            "Sucesso",
            "Agendamento realizado com sucesso!",
            "sucesso",
          );
          navigate("/feed");
        })
        .catch((error) => {
          console.error("Erro ao agendar serviço:", error);
          showAlerta(
            "Erro",
            "Não foi possível realizar o agendamento. Tente novamente.",
            "erro",
          );
        });
    } else {
      showAlerta(
        "info",
        "Por favor, preencha todos os campos obrigatórios.",
        "info",
      );
    }
  };

  const isValid = Boolean(form.servico && form.data && form.horario);

  // Carrega os serviços da empresa para preencher o dropdown de seleção
  useEffect(() => {
    async function carregar() {
      const data = await getServicosDaEmpresa(servico.idEmpresa!); // Garantindo que idEmpresa não é undefined
      const opcoes = data // Filtra serviços sem ID e mapeia para o formato esperado pelo TextInput
        .filter((s) => s.id !== undefined)
        .map((s) => ({
          label: s.nome, // Exibe o nome do serviço
          value: s.id!, // Usa o ID do serviço como valor
        }));
      setServicos(opcoes);
    }
    carregar();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, servico })); // Atualiza o serviço selecionado no formulário
  }, [servico]);

  // Atualiza o serviço no formulário quando a data ou horário mudar (para refletir disponibilidade)
  useEffect(() => {
    if (form.servico) {
      setForm((prev) => ({
        ...prev,
        servico: { ...prev.servico, ...servico },
      })); // Atualiza os dados do serviço no formulário, mantendo o que já estava preenchido (como ID e nome) e atualizando os diasDisponiveis
    }
  }, [form.data, form.horario]);

  // Atualiza os dias de funcionamento com base no serviço selecionado ou na data selecionada
  useEffect(() => {
    if (form.servico) {
      diasDisponiveis.length = 0; // Limpa o array antes de preenchê-lo
      form.servico.diasDisponiveis.forEach((dia, index) => {
        if (dia.ativo) {
          diasDisponiveis.push(index); // Adiciona o índice do dia da semana (0-6) ao array de dias de funcionamento
        }
      });
    }
  }, [form.servico]);

  // Atualiza os horários disponíveis
  useEffect(() => {
    if (!form.servico) return;

    const duracaoNum = Number(form.servico.duracao);
    const unidade = form.servico.tempo.toLowerCase();
    const intervaloMs = unidade.startsWith("hora")
      ? duracaoNum * 60 * 60 * 1000
      : unidade.startsWith("dia")
        ? duracaoNum * 24 * 60 * 60 * 1000
        : duracaoNum * 60 * 1000; // minuto (default)

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
    setHorariosDisponiveis(novosHorarios);
  }, [form.servico]);

  // Busca disponibilidade — só roda quando horariosDisponiveis já está populado
  useEffect(() => {
    if (!form.servico?.id || !ano || horariosDisponiveis.length === 0) return;

    const atualizar = async () => {
      const agendamentos = await getAgendamentosDoServico(form.servico!.id!);
      const disponibilidade = await getDisponibilidadeMensal(
        form.servico!.id!,
        ano,
        mes + 1, // 1-12
        horariosDisponiveis.map((h) => h.value),
        agendamentos,
      );
      setAtualizarDisponibilidade(disponibilidade);
    };

    atualizar();
  }, [ano, mes, form.servico, horariosDisponiveis]);

  const auth = getAuth();
  useEffect(() => {
    setNomeUsuario(auth.currentUser?.displayName || "");
  }, [auth]);

  if (!nomeUsuario) return <Loading />;

  return (
    <div
      className={`${cor_fundo} h-screen w-full flex flex-col overflow-hidden`}
    >
      <Cabecalho perfil nome={nomeUsuario} />
      <div className="flex flex-col grow w-full items-center overflow-hidden">
        <div className="flex flex-col w-full max-w-[95%] md:max-w-[80%] gap-4 p-4 grow overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              className="px-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none bg-white dark:bg-zinc-700"
              onClick={() => navigate("/feed")}
            >
              <X
                size={20}
                strokeWidth={3}
                className="text-gray-500 dark:text-gray-300"
              />
            </button>
            <div className="relative flex items-center bg-white dark:bg-zinc-700 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 w-full">
              <h1 className="text-gray-700 dark:text-gray-50 font-semibold">
                {empresa}
              </h1>
            </div>
          </div>

          {/* Barra horizontal de ícones — só mobile */}
          <div className="md:hidden shrink-0"></div>

          <div className="flex flex-col md:flex-row gap-3 grow min-h-0">
            {/* Sidebar vertical — só desktop */}
            <div className="hidden md:block bg-white dark:bg-zinc-700 md:w-1/5 p-3 rounded-lg shrink-0 overflow-y-auto">
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
                  onChange={(value) => handleChange("servico", value)}
                  selected={servico?.nome}
                  options={servicos}
                />
                <TextInput
                  titulo="Data"
                  type="date"
                  value={form.data === undefined ? undefined : form.data}
                  onChange={(value) => handleChange("data", value)}
                  agendamento
                />
                <TextInput
                  titulo="Horário"
                  type="select"
                  onChange={(value) => handleChange("horario", value)}
                  options={horariosDisponiveis}
                />
                <TextInput
                  titulo="Observação"
                  type="text"
                  onChange={(value) => handleChange("obs", value)}
                />
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
              <div className="bg-white dark:bg-zinc-700 p-3 rounded-lg overflow-y-auto flex-1 min-h-0">
                {/* Aqui é o conteúdo do calendário do principal da empresa */}
                <GradeDisponibilidade
                  ano={ano}
                  mes={mes}
                  diasFuncionamento={diasDisponiveis}
                  disponibilidades={atualizarDisponibilidade || {}} // Passa as disponibilidades para a grade
                  onDiaSelecionado={() =>
                    console.log(getAgendamentosDoServico(form.servico!.id!))
                  } // Para teste, loga os agendamentos do serviço ao clicar em um dia
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelaAgendamento;
