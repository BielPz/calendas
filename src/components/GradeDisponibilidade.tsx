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
  passado: "bg-gray-300 text-gray-600",
  "sem-horario": "bg-red-300 text-red-900 cursor-pointer hover:opacity-80",
  parcial: "bg-amber-300 text-amber-900 cursor-pointer hover:opacity-80",
  disponivel: "bg-green-300 text-green-900 cursor-pointer hover:opacity-80",
  vazio: "dark:bg-zinc-700",
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
    <div>
      {/* Cabeçalho */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-500 dark:text-gray-200 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade */}
      <div className="grid grid-cols-7 gap-1">
        {celulas.map((celula, i) => (
          <div
            key={i}
            onClick={() =>
              celula.status !== "vazio" &&
              celula.status !== "passado" &&
              onDiaSelecionado?.(celula.dia)
            }
            className={`aspect-square rounded-lg flex items-end justify-end p-1.5 text-xs font-medium
              ${STATUS_CLASSES[celula.status]}
              ${mesAtual && celula.dia === diaHoje ? "ring-2 ring-gray-800 dark:ring-white ring-offset-1" : ""}
            `}
          >
            {celula.dia > 0 ? celula.dia : ""}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mt-3">
        {[
          { cor: "bg-gray-300", label: "Dias passados" },
          { cor: "bg-red-300", label: "Sem horários" },
          { cor: "bg-amber-300", label: "Parcialmente disponível" },
          { cor: "bg-green-300", label: "Totalmente disponível" },
        ].map(({ cor, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-200"
          >
            <div className={`w-3 h-3 rounded ${cor}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GradeDisponibilidade;
