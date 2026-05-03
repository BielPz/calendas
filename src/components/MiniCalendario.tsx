import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";

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
      <span className="font-semibold capitalize">
        {mes} {ano}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => previousMonth && goToMonth(previousMonth)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => nextMonth && goToMonth(nextMonth)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function MiniCalendario() {
  const [selected, setSelected] = useState<Date>();

  useEffect(() => {
    const today = new Date();
    setSelected(today); // Define a data atual como selecionada inicialmente
  }, []);

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={setSelected}
      locale={ptBR}
      components={{
        MonthCaption: CaptionComBotoes, // ← substitui o caption inteiro
      }}
      classNames={{
        nav: "hidden",
        weekdays: "grid grid-cols-7 text-center text-xs text-gray-500 mb-1",
        weeks: "grid",
        week: "grid grid-cols-7",
        day: "text-center text-sm p-1",
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
