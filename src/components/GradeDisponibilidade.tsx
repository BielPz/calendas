type StatusDia = "passado" | "sem-horario" | "parcial" | "disponivel" | "com-agendamento" | "vazio";

interface DiaDisponibilidade { dia: number; status: StatusDia; }

interface Props {
  ano: number;
  mes: number;
  diasFuncionamento: number[];
  disponibilidades: Record<number, "sem-horario" | "parcial" | "disponivel">;
  onDiaSelecionado?: (dia: number) => void;
  /** Modo usado pelas agendas gerais, mantendo a mesma grade do agendamento. */
  modo?: "disponibilidade" | "agenda";
  datasComAgendamento?: string[];
  dataSelecionada?: string;
  preencherAltura?: boolean;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_CLASSES: Record<StatusDia, string> = {
  passado: "bg-gray-200 text-gray-400 dark:bg-zinc-700 dark:text-gray-500 cursor-not-allowed",
  "sem-horario": "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
  parcial: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50",
  disponivel: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
  "com-agendamento": "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-400/20 dark:text-orange-100 dark:hover:bg-orange-400/30",
  vazio: "bg-transparent",
};

function GradeDisponibilidade({ ano, mes, diasFuncionamento, disponibilidades, onDiaSelecionado, modo = "disponibilidade", datasComAgendamento = [], dataSelecionada, preencherAltura = false }: Props) {
  const hoje = new Date();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const diaHoje = hoje.getDate();
  const mesAtual = hoje.getMonth() === mes && hoje.getFullYear() === ano;
  const datasAgendadas = new Set(datasComAgendamento);
  const paraData = (dia: number) => `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const celulas: DiaDisponibilidade[] = [
    ...Array(primeiroDia).fill({ dia: 0, status: "vazio" as StatusDia }),
    ...Array.from({ length: diasNoMes }, (_, indice) => {
      const dia = indice + 1;
      const passado = mesAtual ? dia < diaHoje : new Date(ano, mes) < hoje;
      const funcionamento = diasFuncionamento.includes(new Date(ano, mes, dia).getDay());
      const status = modo === "agenda"
        ? (datasAgendadas.has(paraData(dia)) ? "com-agendamento" : "disponivel")
        : passado ? "passado" : funcionamento ? (disponibilidades[dia] ?? "sem-horario") : "sem-horario";
      return { dia, status } as DiaDisponibilidade;
    }),
  ];

  return <div className={`w-full ${preencherAltura ? "flex min-h-0 flex-1 flex-col" : ""}`}>
    <div className="mb-2 grid grid-cols-7 gap-1.5">
      {DIAS_SEMANA.map((dia) => <div key={dia} className="py-1 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">{dia}</div>)}
    </div>
    <div className={`mb-2 grid grid-cols-7 gap-1.5 ${preencherAltura ? "min-h-0 flex-1 auto-rows-fr" : ""}`}>
      {celulas.map((celula, indice) => {
        const selecionado = celula.dia > 0 && dataSelecionada === paraData(celula.dia);
        const hojeSelecionado = mesAtual && celula.dia === diaHoje;
        const bloqueado = celula.status === "vazio" || (modo !== "agenda" && celula.status === "passado");
        return <button key={celula.dia ? paraData(celula.dia) : `vazio-${indice}`} type="button" disabled={bloqueado} onClick={() => !bloqueado && onDiaSelecionado?.(celula.dia)} className={`flex items-center justify-center rounded-lg border-2 border-transparent text-sm font-semibold transition-colors ${preencherAltura ? "h-full min-h-0" : "h-12 sm:h-14 lg:h-16"} ${STATUS_CLASSES[celula.status]} ${selecionado || hojeSelecionado ? "border-orange-500 dark:border-orange-400" : ""}`}>{celula.dia || ""}</button>;
      })}
    </div>
    <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3 dark:border-zinc-700">
      {modo === "agenda" ? <>
        <Legenda cor="bg-green-100 dark:bg-green-900/30" texto="Dia sem agendamento" />
        <Legenda cor="bg-orange-100 dark:bg-orange-400/20" texto="Dia com agendamento" />
      </> : <>
        <Legenda cor="bg-gray-200 dark:bg-zinc-700" texto="Dias passados" />
        <Legenda cor="bg-red-100 dark:bg-red-900/30" texto="Sem horários" />
        <Legenda cor="bg-amber-100 dark:bg-amber-900/30" texto="Parcialmente disponível" />
        <Legenda cor="bg-green-100 dark:bg-green-900/30" texto="Totalmente disponível" />
      </>}
    </div>
  </div>;
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><span className={`h-3 w-3 rounded ${cor}`} />{texto}</div>;
}

export default GradeDisponibilidade;
