import type { Servico, Agendamento } from "@/firebase/types";
import { duracaoServicoEmMinutos, horarioParaMinutos } from "./agenda";

export type StatusDisponibilidade = "sem-horario" | "parcial" | "disponivel";

export function calcularDisponibilidadeDiaria(
  servico: Servico,
  data: string,
  horarios: string[],
  agendamentos: Agendamento[],
): Record<string, { label: string; value: string } | null> {
  const diaSemana = new Date(`${data}T12:00:00`).getDay();
  if (!servico.diasDisponiveis[diaSemana]?.ativo) {
    return Object.fromEntries(horarios.map((horario) => [horario, null]));
  }

  const duracao = duracaoServicoEmMinutos(servico);
  return Object.fromEntries(
    horarios.map((horario) => [
      horario,
      agendamentos.some((agendamento) => {
        if (agendamento.data !== data || agendamento.status === "cancelado") return false;
        const inicio = horarioParaMinutos(horario);
        const inicioAgendamento = horarioParaMinutos(agendamento.horario);
        const duracaoAgendamento = agendamento.duracaoMinutos ?? duracaoServicoEmMinutos(agendamento.servico);
        return inicio < inicioAgendamento + duracaoAgendamento && inicio + duracao > inicioAgendamento;
      }) ? null : { label: horario, value: horario },
    ]),
  );
}

export function calcularDisponibilidadeMensal(
  servico: Servico,
  ano: number,
  mes: number,
  horarios: string[],
  agendamentos: Agendamento[],
): Record<number, StatusDisponibilidade> {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  return Object.fromEntries(
    Array.from({ length: diasNoMes }, (_, index) => {
      const dia = index + 1;
      const data = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const diario = calcularDisponibilidadeDiaria(servico, data, horarios, agendamentos);
      const livres = Object.values(diario).filter(Boolean).length;
      const possuiAgendamento = agendamentos.some((agendamento) => agendamento.data === data && agendamento.status !== "cancelado");
      const statusBase: StatusDisponibilidade = livres === 0
        ? "sem-horario"
        : livres === horarios.length ? "disponivel" : "parcial";
      const status: StatusDisponibilidade = possuiAgendamento && statusBase === "disponivel" ? "parcial" : statusBase;
      return [dia, status];
    }),
  );
}
