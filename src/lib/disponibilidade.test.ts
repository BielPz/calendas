import { describe, expect, it } from "vitest";
import type { Agendamento, Servico } from "../firebase/types";
import { calcularDisponibilidadeDiaria, calcularDisponibilidadeMensal } from "./disponibilidade";
import { estaDentroDoFuncionamento, horariosSeSobrepoem } from "./agenda";

const servico: Servico = {
  id: "servico-1", cnpj: "", nome: "Corte", preco: 50, duracao: "30", tempo: "minutos",
  diasDisponiveis: Array.from({ length: 7 }, (_, index) => ({
    ativo: index === 1, inicio: "09:00", fim: "12:00",
  })),
};

const agendamento: Agendamento = {
  id: "agendamento-1", servico, data: "2026-07-06", horario: "09:30", obs: "",
};

describe("disponibilidade", () => {
  it("trata corretamente as bordas entre dois atendimentos", () => {
    expect(horariosSeSobrepoem("09:00", 30, "09:30", 30)).toBe(false);
    expect(horariosSeSobrepoem("09:15", 30, "09:30", 30)).toBe(true);
  });

  it("não aceita horário que termina depois do funcionamento", () => {
    expect(estaDentroDoFuncionamento(servico, "2026-07-06", "11:30")).toBe(true);
    expect(estaDentroDoFuncionamento(servico, "2026-07-06", "11:45")).toBe(false);
    expect(estaDentroDoFuncionamento(servico, "2026-07-06", "23:00")).toBe(false);
  });

  it("bloqueia somente o horário já reservado", () => {
    expect(calcularDisponibilidadeDiaria(servico, "2026-07-06", ["09:00", "09:30"], [agendamento]))
      .toEqual({ "09:00": { label: "09:00", value: "09:00" }, "09:30": null });
  });

  it("bloqueia horários que se sobrepõem parcialmente", () => {
    expect(calcularDisponibilidadeDiaria(servico, "2026-07-06", ["09:00", "09:15", "10:00"], [agendamento]))
      .toEqual({ "09:00": { label: "09:00", value: "09:00" }, "09:15": null, "10:00": { label: "10:00", value: "10:00" } });
  });

  it("bloqueia dias fora do funcionamento", () => {
    expect(calcularDisponibilidadeDiaria(servico, "2026-07-07", ["09:00"], [])).toEqual({ "09:00": null });
  });

  it("marca o mês como parcial quando só parte dos horários está ocupada", () => {
    expect(calcularDisponibilidadeMensal(servico, 2026, 7, ["09:00", "09:30"], [agendamento])[6])
      .toBe("parcial");
  });

  it("destaca reservas antigas mesmo quando o horário não pertence à grade", () => {
    const reservaForaDaGrade = { ...agendamento, horario: "23:00" };
    expect(calcularDisponibilidadeMensal(servico, 2026, 7, ["09:00", "09:30"], [reservaForaDaGrade])[6])
      .toBe("parcial");
  });
});
