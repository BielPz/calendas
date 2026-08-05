import { useEffect, useState } from "react";
import type { Agendamento } from "../firebase/types";

interface Props {
  inicio?: number;
  fim?: number;
  agendamentos?: Agendamento[];
  selecionadoId?: string;
  onSelecionar?: (agendamento: Agendamento) => void;
  pixelsPorHora?: number;
  rotuloAgendamento?: string | ((agendamento: Agendamento) => string);
}

const LARGURA_COLUNA_HORA = 64;

const duracaoEmMinutos = (agendamento: Agendamento) => {
  if (agendamento.duracaoMinutos) return agendamento.duracaoMinutos;
  const valor = Number(agendamento.servico.duracao) || 60;
  if (agendamento.servico.tempo === "hora") return valor * 60;
  if (agendamento.servico.tempo === "dia") return valor * 1440;
  return valor;
};

const horarioFim = (agendamento: Agendamento) => {
  const [hora, minuto] = agendamento.horario.split(":").map(Number);
  const total = hora * 60 + minuto + duracaoEmMinutos(agendamento);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function TimelineHoras({ inicio = 0, fim = 24, agendamentos = [], selecionadoId, onSelecionar, pixelsPorHora = 112, rotuloAgendamento }: Props) {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(new Date()), 1_000);
    return () => window.clearInterval(intervalo);
  }, []);
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const totalMinutos = (fim - inicio) * 60;
  const posicaoAgora = ((minutosAgora - inicio * 60) / 60) * pixelsPorHora;
  const horas = Array.from({ length: fim - inicio }, (_, indice) => inicio + indice);
  const intervaloMinutos = pixelsPorHora >= 160 ? 15 : pixelsPorHora >= 136 ? 30 : 60;
  const marcacoes = Array.from({ length: totalMinutos / intervaloMinutos }, (_, indice) => {
    const minutos = inicio * 60 + indice * intervaloMinutos;
    return {
      minutos,
      top: ((minutos - inicio * 60) / 60) * pixelsPorHora,
      rotulo: `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`,
    };
  });
  const eventosBase = agendamentos
    .filter((agendamento) => agendamento.status !== "cancelado")
    .map((agendamento) => {
      const [hora, minuto] = agendamento.horario.split(":").map(Number);
      const inicioMinutos = hora * 60 + minuto;
      return {
        agendamento,
        inicioMinutos,
        fimMinutos: inicioMinutos + duracaoEmMinutos(agendamento),
        top: ((inicioMinutos - inicio * 60) / 60) * pixelsPorHora,
        altura: Math.max((duracaoEmMinutos(agendamento) / 60) * pixelsPorHora, 44),
      };
    }).sort((a, b) => a.inicioMinutos - b.inicioMinutos || a.fimMinutos - b.fimMinutos);

  const eventos = (() => {
    const resultado: Array<typeof eventosBase[number] & { coluna: number; colunas: number }> = [];
    let grupo: Array<typeof eventosBase[number] & { coluna: number }> = [];
    let fimGrupo = -Infinity;
    const finalizarGrupo = () => {
      const colunas = Math.max(1, ...grupo.map((evento) => evento.coluna + 1));
      resultado.push(...grupo.map((evento) => ({ ...evento, colunas })));
      grupo = [];
      fimGrupo = -Infinity;
    };
    eventosBase.forEach((evento) => {
      if (grupo.length && evento.inicioMinutos >= fimGrupo) finalizarGrupo();
      const colunasOcupadas = new Set(grupo.filter((outro) => outro.fimMinutos > evento.inicioMinutos).map((outro) => outro.coluna));
      let coluna = 0;
      while (colunasOcupadas.has(coluna)) coluna += 1;
      grupo.push({ ...evento, coluna });
      fimGrupo = Math.max(fimGrupo, evento.fimMinutos);
    });
    if (grupo.length) finalizarGrupo();
    return resultado;
  })();
  const obterRotulo = (agendamento: Agendamento) => typeof rotuloAgendamento === "function"
    ? rotuloAgendamento(agendamento)
    : rotuloAgendamento ?? agendamento.servico.nome;

  return (
    <div className="relative w-full select-none" style={{ minHeight: `${horas.length * pixelsPorHora}px` }}>
      {horas.map((hora, indice) => (
        <div key={hora} className="absolute inset-x-0 grid grid-cols-[64px_minmax(0,1fr)]" style={{ top: `${indice * pixelsPorHora}px` }}>
          <span className="-translate-y-1/2 pr-3 text-right text-xs font-semibold text-slate-500 dark:text-zinc-400">
            {String(hora).padStart(2, "0")}:00
          </span>
          <div className="border-t border-slate-200 dark:border-zinc-700" />
        </div>
      ))}

      {intervaloMinutos < 60 && marcacoes.filter((marcacao) => marcacao.minutos % 60 !== 0).map((marcacao) => (
        <div key={marcacao.minutos} className="absolute inset-x-0 grid grid-cols-[64px_minmax(0,1fr)]" style={{ top: `${marcacao.top}px` }}>
          <span className="-translate-y-1/2 pr-3 text-right text-[10px] font-medium text-slate-400 dark:text-zinc-500">{marcacao.rotulo}</span>
          <div className="border-t border-dashed border-slate-200 dark:border-zinc-700/70" />
        </div>
      ))}

      {posicaoAgora >= 0 && posicaoAgora <= horas.length * pixelsPorHora && (
        <div className="pointer-events-none absolute inset-x-0 z-20 grid grid-cols-[64px_minmax(0,1fr)]" style={{ top: `${posicaoAgora}px` }}>
          <span />
          <div className="relative flex h-0.5 items-center bg-black dark:bg-white">
            <span className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black dark:bg-white" />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded bg-white/90 px-1.5 py-0.5 text-xs font-bold text-black shadow-sm dark:bg-zinc-100">
              {String(agora.getHours()).padStart(2, "0")}:{String(agora.getMinutes()).padStart(2, "0")}:{String(agora.getSeconds()).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-0 right-0 bottom-0 z-10" style={{ left: `${LARGURA_COLUNA_HORA}px` }}>
        {eventos.map(({ agendamento, coluna, colunas, top, altura }) => (
          <button
            type="button"
            key={agendamento.id}
            onClick={() => onSelecionar?.(agendamento)}
            className={`absolute overflow-hidden rounded-lg border border-white/30 p-2 text-left text-xs text-white shadow-sm transition hover:brightness-110 ${selecionadoId === agendamento.id ? "ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-zinc-900" : ""} ${coluna % 2 === 0 ? "bg-linear-to-br from-orange-500 to-violet-600" : "bg-linear-to-br from-violet-600 to-fuchsia-600"}`}
            style={{ top: `${top}px`, height: `${altura}px`, left: `calc(${(coluna / colunas) * 100}% + 0.25rem)`, width: `calc(${100 / colunas}% - 0.5rem)` }}
            aria-label={`${obterRotulo(agendamento)}, ${agendamento.horario} até ${horarioFim(agendamento)}`}
          >
            <span className="block font-bold">{obterRotulo(agendamento)}</span>
            <span className="mt-0.5 block opacity-90">{agendamento.horario} · {agendamento.servico.duracao} {agendamento.servico.tempo}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimelineHoras;
