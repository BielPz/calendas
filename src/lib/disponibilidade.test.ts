import { describe, expect, it } from "vitest";
import type { Agendamento, Servico } from "../firebase/types";
import { calcularDisponibilidadeDiaria, calcularDisponibilidadeMensal } from "./disponibilidade";

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
  it("bloqueia somente o horário já reservado", () => {
    expect(calcularDisponibilidadeDiaria(servico, "2026-07-06", ["09:00", "09:30"], [agendamento]))
      .toEqual({ "09:00": { label: "09:00", value: "09:00" }, "09:30": null });
  });

  it("bloqueia dias fora do funcionamento", () => {
    expect(calcularDisponibilidadeDiaria(servico, "2026-07-07", ["09:00"], [])).toEqual({ "09:00": null });
  });

  it("marca o mês como parcial quando só parte dos horários está ocupada", () => {
    expect(calcularDisponibilidadeMensal(servico, 2026, 7, ["09:00", "09:30"], [agendamento])[6])
      .toBe("parcial");
  });
});
