interface Props {
  inicio?: number; // hora de início (0-23)
  fim?: number; // hora de término (0-23)
}

function TimelineHoras({ inicio = 0, fim = 23 }: Props) {
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
          className="flex items-start gap-2 h-14 border-b border-gray-100"
        >
          <span className="text-xs text-gray-400 w-12 shrink-0 -translate-y-2">
            {String(h).padStart(2, "0")}:00
          </span>
          <div className="flex-1 border-t border-gray-200 mt-0" />
        </div>
      ))}

      {/* Linha do horário atual */}
      {percentual >= 0 && percentual <= 100 && (
        <div
          className="absolute left-0 right-0 flex items-center pointer-events-none"
          style={{ top: `${percentual}%` }}
        >
          <span className="w-12 shrink-0" /> {/* espaço da coluna de hora */}
          <div className="w-3 h-3 rounded-full bg-orange-500 -ml-1.5 shrink-0" />
          <div className="flex-1 h-px bg-orange-500" />
        </div>
      )}
    </div>
  );
}

export default TimelineHoras;
