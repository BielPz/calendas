import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { isToday } from "date-fns";

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
}

function MiniCalendario({ onChange, agendamento }: Props) {
  const [selected, setSelected] = useState<Date>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setSelected(today); // Define a data atual como selecionada inicialmente
  }, []);

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
      selected={selected}
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
        day: "text-center text-sm p-1 dark:text-gray-300",
        day_button:
          "w-6 h-6 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto",
        selected: "",
        today: "font-bold",
      }}
      modifiersClassNames={{
        selected: "!bg-gray-900 !text-white !rounded-full !mx-auto",
      }}
    />
  );
}

export default MiniCalendario;
