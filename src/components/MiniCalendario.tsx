import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

// Componente customizado para o caption do mês, incluindo os botões de navegação
function CaptionComBotoes() {
  // Acessa o contexto do DayPicker para obter as funções de navegação e o mês atual
  const { goToMonth, nextMonth, previousMonth, months } = useDayPicker();
  // O mês atual é o primeiro da lista de meses renderizados
  const currentMonth = months[0].date;
  const mes = currentMonth.toLocaleDateString("pt-BR", { month: "long" });
  const ano = currentMonth.getFullYear();

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <span className="font-semibold capitalize dark:text-white">
        {mes} {ano}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => previousMonth && goToMonth(previousMonth)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={16} className="dark:text-gray-100" />
        </button>
        <button
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={16} className="dark:text-gray-100" />
        </button>
      </div>
    </div>
  );
}

interface Props {
  onChange?: (date: Date | undefined) => void;
  agendamento?: boolean;
  value?: string;
  datasComAgendamento?: string[];
}

function MiniCalendario({ onChange, agendamento, value, datasComAgendamento = [] }: Props) {
  const [selected, setSelected] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diasAgendados = datasComAgendamento.map((data) => new Date(`${data}T12:00:00`));

  function handleChange(date: Date | undefined) {
    if (agendamento) {
      if (date && date >= today) {
        setSelected(date);
        onChange?.(date);
      }
    } else {
      setSelected(date);
      onChange?.(date);
    }
  }

  return (
    <DayPicker
      mode="single"
      selected={
        value
          ? new Date(new Date(value).setDate(new Date(value).getDate() + 1)) // Ajusta a data para o fuso horário local
          : selected
      }
      onSelect={handleChange}
      locale={ptBR}
      style={{ width: "100%" }}
      components={{
        MonthCaption: CaptionComBotoes, // substitui o caption inteiro
      }}
      classNames={{
        root: "w-full",
        month: "w-full",
        month_grid: "w-full",
        nav: "hidden",
        weekdays:
          "grid grid-cols-7 text-center text-xs text-gray-500 mb-1 dark:text-gray-200",
        weeks: "grid",
        week: "grid grid-cols-7",
        day: "text-center text-sm p-1 text-slate-700 dark:text-zinc-200 w-full flex items-center justify-center rounded-lg transition-colors",
        day_button:
          "w-10 h-7 rounded-full text-inherit hover:bg-orange-100 hover:text-orange-900 dark:hover:bg-orange-400/20 dark:hover:text-orange-100 transition-colors flex items-center justify-center",
        selected: "",
        today: "font-bold",
      }}
      modifiersClassNames={{
        selected: "!bg-violet-600 !text-white !rounded-full hover:!bg-violet-600 hover:!text-white",
        comAgendamento: "!bg-orange-100 !text-orange-900 !font-bold hover:!bg-orange-200 hover:!text-orange-950 dark:!bg-orange-400/20 dark:!text-orange-100",
      }}
      modifiers={{ comAgendamento: diasAgendados }}
    />
  );
}

export default MiniCalendario;
