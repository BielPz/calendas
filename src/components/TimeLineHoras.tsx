interface Props {
  inicio?: number; // hora de início (0-24)
  fim?: number; // hora de término (0-24)
}

function TimelineHoras({ inicio = 0, fim = 24 }: Props) {
  // Calcula a posição da linha do horário atual
  const agora = new Date();
  // Converte o horário atual para minutos desde o início do dia
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  // Converte o horário de início e término para minutos
  const totalMinutos = (fim - inicio) * 60;
  // Calcula o percentual da posição da linha do horário atual em relação ao início e término
  const percentual = ((minutosAgora - inicio * 60) / totalMinutos) * 100;

  // Gera um array de horas para exibir na timeline
  const horas = Array.from({ length: fim - inicio }, (_, i) => inicio + i);

  return (
    <div className="relative w-full select-none">
      {/* Coluna de horas*/}
      {horas.map((h) => (
        <div
          key={h}
          className="flex items-start gap-3 h-16 border-b border-gray-100 dark:border-zinc-700/50"
        >
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-14 shrink-0 -translate-y-3 text-right pr-2">
            {String(h).padStart(2, "0")}:00
          </span>
          <div className="flex-1 border-t border-gray-200 dark:border-zinc-700 mt-0" />
        </div>
      ))}

      {/* Linha do horário atual */}
      {percentual >= 0 && percentual <= 100 && (
        <div
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: `${percentual}%` }}
        >
          <span className="w-14 shrink-0" /> {/* espaço da coluna de hora */}
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 dark:bg-orange-400 -ml-2 shrink-0 shadow-md" />
          <div className="flex-1 h-0.5 bg-orange-500 dark:bg-orange-400" />
        </div>
      )}
    </div>
  );
}

export default TimelineHoras;