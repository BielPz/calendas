import { useNavigate } from "react-router-dom";
import { CalendarClock, House, History } from "lucide-react";

function SideBarCliente() {
  const navigate = useNavigate();

  const commonButtonClasses =
    "flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-4 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors duration-200 sm:w-full sm:text-left";

  return (
    <>
      {/* Sidebar vertical — desktop */}
      <div className="hidden md:flex flex-col gap-1 w-full">
        <button className={commonButtonClasses}>
          {/*<img src={imgInicio} alt="Início" className="w-5 h-5" />*/}
          <House size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Início
          </span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          {/*<img src={imgAgenda} alt="Agenda" className="w-5 h-5" />*/}
          <CalendarClock size={25} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Minha Agenda
          </span>
        </button>

        <div className="mt-2">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-100 uppercase tracking-wide mb-1">
            Favoritos
          </p>
        </div>

        <button className={commonButtonClasses}>
          {/*<img src={imgHistorico} alt="Histórico" className="w-5 h-5" />*/}
          <History size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Histórico
          </span>
        </button>
      </div>

      {/* Barra horizontal de ícones — mobile */}
      <div className="flex md:hidden bg-white dark:bg-zinc-800 rounded-lg px-2 py-2 gap-1 w-full justify-around">
        <button className={commonButtonClasses}>
          {/*<img src={imgInicio} alt="Início" className="w-5 h-5" />*/}
          <House size={18} className="dark:text-gray-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Início
          </span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          {/*<img src={imgAgenda} alt="Agenda" className="w-5 h-5" />*/}
          <CalendarClock size={18} className="dark:text-gray-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Agenda
          </span>
        </button>

        <button className={commonButtonClasses}>
          {/*<img src={imgHistorico} alt="Histórico" className="w-5 h-5" />*/}
          <History size={18} className="dark:text-gray-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Histórico
          </span>
        </button>
      </div>
    </>
  );
}

export default SideBarCliente;
