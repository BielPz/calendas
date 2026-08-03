import { useNavigate } from "react-router-dom";
import { CalendarClock, House, History } from "lucide-react";

function SideBarPrestador() {
  const navigate = useNavigate();
  const commonButtonClasses =
    "flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-4 sm:px-3 py-2 rounded-lg text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300 transition-colors duration-200 sm:w-full sm:text-left";

  return (
    <>
      {/* Sidebar vertical — desktop */}
      <div className="hidden md:flex flex-col gap-1 w-full">
        <button className={commonButtonClasses}>
          <House size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Início</span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          <CalendarClock size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Agenda</span>
        </button>

        <button className={commonButtonClasses}>
          <History size={18} className="dark:text-gray-500  " />
          <span className="text-sm font-medium text-gray-700">Histórico</span>
        </button>
      </div>

      {/* Barra horizontal de ícones — mobile */}
      <div className="ui-card flex md:hidden rounded-xl px-2 py-2 gap-1 w-full justify-around">
        <button className={commonButtonClasses}>
          <House size={18} className="dark:text-gray-500" />
          <span className="text-xs text-gray-600">Início</span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          <CalendarClock size={18} className="dark:text-gray-500" />
          <span className="text-xs text-gray-600">Agenda</span>
        </button>

        <button className={commonButtonClasses}>
          <History size={18} className="dark:text-gray-500" />
          <span className="text-xs text-gray-600">Histórico</span>
        </button>
      </div>
    </>
  );
}

export default SideBarPrestador;
