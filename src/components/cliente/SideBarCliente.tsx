import imgInicio from "../../images/inicio.png";
import imgAgenda from "../../images/agenda.png";
import imgHistorico from "../../images/historico.png";
import { useNavigate } from "react-router-dom";

function SideBarCliente() {
  const navigate = useNavigate();

  const commonButtonClasses =
    "flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-4 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 sm:w-full sm:text-left";

  return (
    <>
      {/* Sidebar vertical — desktop */}
      <div className="hidden md:flex flex-col gap-1 w-full">
        <button className={commonButtonClasses}>
          <img src={imgInicio} alt="Início" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Início</span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          <img src={imgAgenda} alt="Agenda" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">
            Minha Agenda
          </span>
        </button>

        <div className="mt-2">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Favoritos
          </p>
        </div>

        <button className={commonButtonClasses}>
          <img src={imgHistorico} alt="Histórico" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Histórico</span>
        </button>
      </div>

      {/* Barra horizontal de ícones — mobile */}
      <div className="flex md:hidden bg-white rounded-lg px-2 py-2 gap-1 w-full justify-around">
        <button className={commonButtonClasses}>
          <img src={imgInicio} alt="Início" className="w-5 h-5" />
          <span className="text-xs text-gray-600">Início</span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          <img src={imgAgenda} alt="Agenda" className="w-5 h-5" />
          <span className="text-xs text-gray-600">Agenda</span>
        </button>

        <button className={commonButtonClasses}>
          <img src={imgHistorico} alt="Histórico" className="w-5 h-5" />
          <span className="text-xs text-gray-600">Histórico</span>
        </button>
      </div>
    </>
  );
}

export default SideBarCliente;
