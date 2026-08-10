import type { Servico } from "@/firebase/types";

export const horarioParaMinutos = (horario: string): number => {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
};

export const duracaoServicoEmMinutos = (servico: Servico): number => {
    const valor = Number(servico.duracao);
    if (!Number.isFinite(valor) || valor <= 0) return 60;
    if (servico.tempo === "dia") return valor * 24 * 60;
    if (servico.tempo === "hora") return valor * 60;
    return valor;
};

// Retorna true quando os intervalos têm algum ponto em comum, ou seja, quando se sobrepõem.
export const horariosSeSobrepoem = (horario1: string, duracao1: number, horario2: string, duracao2: number): boolean => {
    const inicio1 = horarioParaMinutos(horario1);
    const inicio2 = horarioParaMinutos(horario2);
    return (inicio1 < inicio2 + duracao2) && (inicio2 < inicio1 + duracao1);
};

export const estaDentroDoFuncionamento = (servico: Servico, data: string, horario: string): boolean => {
    const dia = servico.diasDisponiveis[new Date(`${data}T12:00:00`).getDay()];
    if (!dia?.ativo || !dia.inicio || !dia.fim) return false;
    const inicio = horarioParaMinutos(horario);
    const fim = inicio + duracaoServicoEmMinutos(servico);
    const inicioDia = horarioParaMinutos(dia.inicio);
    const fimDia = horarioParaMinutos(dia.fim);
    return inicio >= inicioDia && fim <= fimDia;
}

