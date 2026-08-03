import type { Agendamento, Servico } from "../firebase/types";

export type StatusDisponibilidade = "sem-horario" | "parcial" | "disponivel";

function horariosAgendados(data: string, agendamentos: Agendamento[]) {
  return new Set(
    agendamentos.filter((agendamento) => agendamento.data === data).map((agendamento) => agendamento.horario),
  );
}

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

  const ocupados = horariosAgendados(data, agendamentos);
  return Object.fromEntries(
    horarios.map((horario) => [
      horario,
      ocupados.has(horario) ? null : { label: horario, value: horario },
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
      const status: StatusDisponibilidade = livres === 0
        ? "sem-horario"
        : livres === horarios.length ? "disponivel" : "parcial";
      return [dia, status];
    }),
  );
}
