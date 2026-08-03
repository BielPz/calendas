interface Horario {
  label: string;
  value: string;
}

interface Props {
  horarios: Horario[];
  selecionado?: string;
  duracaoMinutos: number;
  livre?: boolean;
  onSelecionar: (horario: string) => void;
}

const paraMinutos = (horario: string) => {
  const [hora, minuto] = horario.split(":").map(Number);
  return hora * 60 + minuto;
};

function SeletorHorario({ horarios, selecionado, duracaoMinutos, livre = false, onSelecionar }: Props) {
  const pixelsPorHora = 72;
  const inicio = horarios.length ? Math.floor(Math.min(...horarios.map((horario) => paraMinutos(horario.value))) / 60) : 8;
  const fim = horarios.length
    ? Math.min(24, Math.ceil((Math.max(...horarios.map((horario) => paraMinutos(horario.value))) + duracaoMinutos) / 60))
    : 18;
  const horas = Array.from({ length: Math.max(1, fim - inicio) }, (_, indice) => inicio + indice);

  return (
    <div className="relative min-h-105 w-full select-none">
      {horas.map((hora) => (
        <div key={hora} className="flex items-start gap-3 border-b border-slate-200 dark:border-zinc-700" style={{ height: `${pixelsPorHora}px` }}>
          <span className="w-14 shrink-0 -translate-y-3 pr-2 text-right text-xs font-semibold text-slate-500 dark:text-zinc-400">{String(hora).padStart(2, "0")}:00</span>
          <div className="flex-1 border-t border-slate-200 dark:border-zinc-700" />
        </div>
      ))}
      <div className="absolute inset-y-0 left-17 right-0">
        {!livre && horarios.map((horario) => {
          const top = ((paraMinutos(horario.value) - inicio * 60) / 60) * pixelsPorHora;
          const altura = Math.max((duracaoMinutos / 60) * pixelsPorHora, 34);
          const ativo = selecionado === horario.value;
          return (
            <button
              type="button"
              key={horario.value}
              onClick={() => onSelecionar(horario.value)}
              className={`absolute right-2 left-2 rounded-lg border p-2 text-left text-sm font-bold transition ${ativo ? "border-white/30 bg-linear-to-br from-orange-500 to-violet-600 text-white shadow-md" : "border-orange-300 bg-orange-50 text-orange-900 hover:border-violet-400 hover:bg-violet-50 dark:border-orange-400/40 dark:bg-orange-400/10 dark:text-orange-100 dark:hover:bg-violet-400/15"}`}
              style={{ top: `${top}px`, height: `${altura}px` }}
            >
              {horario.label}
              <span className="ml-2 text-xs font-medium opacity-80">{duracaoMinutos} min</span>
            </button>
          );
        })}
        {livre && selecionado && (
          <div className="absolute right-2 left-2 rounded-lg border border-white/30 bg-linear-to-br from-orange-500 to-violet-600 p-2 text-left text-sm font-bold text-white shadow-md" style={{ top: `${((paraMinutos(selecionado) - inicio * 60) / 60) * pixelsPorHora}px`, height: `${Math.max((duracaoMinutos / 60) * pixelsPorHora, 34)}px` }}>
            {selecionado}<span className="ml-2 text-xs font-medium opacity-80">{duracaoMinutos} min</span>
          </div>
        )}
      </div>
      {horarios.length === 0 && <p className="absolute inset-x-16 top-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">Não há horários disponíveis para esta data.</p>}
    </div>
  );
}

export default SeletorHorario;
