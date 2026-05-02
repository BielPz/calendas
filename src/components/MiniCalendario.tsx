import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

function MiniCalendario() {
  const [selected, setSelected] = useState<Date>();

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={setSelected}
      locale={ptBR}
      classNames={{
        month_caption:
          "flex justify-between items-center px-2 py-1 font-semibold",
        nav: "flex gap-1",
        button_previous: "p-1 hover:bg-gray-100 rounded",
        button_next: "p-1 hover:bg-gray-100 rounded",
        weekdays: "grid grid-cols-7 text-center text-xs text-gray-500 mb-1",
        weeks: "grid",
        week: "grid grid-cols-7",
        day: "text-center text-sm p-1",
        day_button: "w-8 h-8 rounded-full hover:bg-gray-100 transition-colors",
        selected: "bg-gray-900 text-white rounded-full",
        today: "font-bold",
      }}
    />
  );
}

export default MiniCalendario;
