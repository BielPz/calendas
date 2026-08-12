import type { Agendamento } from "@/firebase/types";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import TimelineHoras from "./TimeLineHoras";

interface Props {
  titulo: string;
  data: string;
  agendamentos?: Agendamento[];
  selecionadoId?: string;
  inicio?: number;
  fim?: number;
  janelaHoras?: number;
  onSelecionar?: (agendamento: Agendamento) => void;
  rotuloAgendamento?: string | ((agendamento: Agendamento) => string);
  acaoCabecalho?: ReactNode;
}

function Agenda({
  titulo,
  data,
  agendamentos = [],
  selecionadoId,
  inicio = 0,
  fim = 24,
  janelaHoras,
  onSelecionar,
  rotuloAgendamento,
  acaoCabecalho,
}: Props) {
  const [pixelsPorHora, setPixelsPorHora] = useState(112);
  const painelRef = useRef<HTMLDivElement>(null);
  const legendaZoom =
    pixelsPorHora >= 160
      ? "15 min"
      : pixelsPorHora >= 136
        ? "30 min"
        : "1 hora";
  const tituloData = useMemo(
    () =>
      new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
    [data],
  );

  useEffect(() => {
    const agendamentoSelecionado = agendamentos.find(
      (agendamento) => agendamento.id === selecionadoId,
    );
    if (!agendamentoSelecionado) return;
    const [hora, minuto] = agendamentoSelecionado.horario
      .split(":")
      .map(Number);
    requestAnimationFrame(() =>
      painelRef.current?.scrollTo({
        top: Math.max(
          0,
          (hora - inicio + minuto / 60) * pixelsPorHora - pixelsPorHora,
        ),
        behavior: "smooth",
      }),
    );
  }, [agendamentos, inicio, pixelsPorHora, selecionadoId]);

  return (
    <section className="ui-card relative flex h-full min-h-0 flex-col p-3">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-zinc-700">
        <div>
          <h2 className="font-bold text-slate-800 dark:text-zinc-100">
            {titulo}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {tituloData}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {acaoCabecalho}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() =>
                setPixelsPorHora((valor) => Math.max(112, valor - 24))
              }
              className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-orange-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              −
            </button>
            <span className="border-x border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
              {legendaZoom}
            </span>
            <button
              type="button"
              onClick={() =>
                setPixelsPorHora((valor) => Math.min(184, valor + 24))
              }
              className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-orange-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              +
            </button>
          </div>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-400/10 dark:text-orange-200">
            {agendamentos.length} agendamento(s)
          </span>
        </div>
      </header>
      <div
        ref={painelRef}
        className="min-h-0 flex-1 overflow-y-auto pr-1"
        style={
          janelaHoras
            ? { maxHeight: `${pixelsPorHora * janelaHoras}px` }
            : undefined
        }
      >
        <TimelineHoras
          inicio={inicio}
          fim={fim}
          agendamentos={agendamentos}
          selecionadoId={selecionadoId}
          onSelecionar={onSelecionar}
          pixelsPorHora={pixelsPorHora}
          rotuloAgendamento={rotuloAgendamento}
        />
      </div>
    </section>
  );
}

export default Agenda;
