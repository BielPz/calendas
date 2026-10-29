import type { Servico } from "../firebase/types";

export const horarioParaMinutos = (horario: string): number => {
  const [hora, minuto] = horario.split(":").map(Number);
  return hora * 60 + minuto;
};

export const duracaoServicoEmMinutos = (servico: Servico): number => {
  const valor = Number(servico.duracao);
  if (!Number.isFinite(valor) || valor <= 0) return 60;
  if (servico.tempo === "dia") return valor * 24 * 60;
  if (servico.tempo === "hora") return valor * 60;
  return valor;
};

/** Retorna true quando os intervalos têm ao menos um minuto em comum. */
export const horariosSeSobrepoem = (inicioA: string, duracaoA: number, inicioB: string, duracaoB: number): boolean => {
  const a = horarioParaMinutos(inicioA);
  const b = horarioParaMinutos(inicioB);
  return a < b + duracaoB && a + duracaoA > b;
};

export const estaDentroDoFuncionamento = (servico: Servico, data: string, horario: string): boolean => {
  const dia = servico.diasDisponiveis[new Date(`${data}T12:00:00`).getDay()];
  if (!dia?.ativo || !dia.inicio || !dia.fim) return false;
  const inicio = horarioParaMinutos(horario);
  const fim = inicio + duracaoServicoEmMinutos(servico);
  return inicio >= horarioParaMinutos(dia.inicio) && fim <= horarioParaMinutos(dia.fim);
};