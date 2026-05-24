type StatusDia = "passado" | "sem-horario" | "parcial" | "disponivel" | "vazio";

interface DiaDisponibilidade {
  dia: number;
  status: StatusDia;
}

interface Props {
  ano: number;
  mes: number; // 0-11
  diasFuncionamento: number[]; // [0-6] representando os dias da semana em que o serviço funciona
  disponibilidades: Record<number, "sem-horario" | "parcial" | "disponivel">;
  onDiaSelecionado?: (dia: number) => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_CLASSES: Record<StatusDia, string> = {
  passado: "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
  "sem-horario": "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors",
  parcial: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors",
  disponivel: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors shadow-sm",
  vazio: "bg-transparent",
};

function GradeDisponibilidade({
  ano,
  mes,
  diasFuncionamento,
  disponibilidades,
  onDiaSelecionado,
}: Props) {
  const hoje = new Date();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diaHoje = hoje.getDate();
  const mesAtual = hoje.getMonth() === mes && hoje.getFullYear() === ano;

  const celulas: DiaDisponibilidade[] = [
    ...Array(primeiroDia).fill({ dia: 0, status: "vazio" as StatusDia }),
    ...Array.from({ length: diasNoMes }, (_, i) => {
      const dia = i + 1;
      const passado = mesAtual ? dia < diaHoje : new Date(ano, mes) < hoje;
      const funcionamento = diasFuncionamento.includes(
        new Date(ano, mes, dia).getDay(),
      );
      return {
        dia,
        status: passado
          ? "passado"
          : funcionamento
            ? (disponibilidades[dia] ?? "sem-horario")
            : "sem-horario",
      } as DiaDisponibilidade;
    }),
  ];

  return (
    <div className="w-full">
      {/* Cabeçalho */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {celulas.map((celula, i) => (
          <button
            key={i}
            onClick={() =>
              celula.status !== "vazio" &&
              celula.status !== "passado" &&
              onDiaSelecionado?.(celula.dia)
            }
            disabled={celula.status === "vazio" || celula.status === "passado"}
            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold
              ${STATUS_CLASSES[celula.status]}
              ${mesAtual && celula.dia === diaHoje ? "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-zinc-800" : ""}
            `}
          >
            {celula.dia > 0 ? celula.dia : ""}
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-zinc-700">
        {[
          { cor: "bg-gray-200 dark:bg-zinc-700", label: "Dias passados" },
          { cor: "bg-red-100 dark:bg-red-900/30", label: "Sem horários" },
          { cor: "bg-amber-100 dark:bg-amber-900/30", label: "Parcialmente disponível" },
          { cor: "bg-green-100 dark:bg-green-900/30", label: "Totalmente disponível" },
        ].map(({ cor, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
          >
            <div className={`w-3 h-3 rounded ${cor}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GradeDisponibilidade;