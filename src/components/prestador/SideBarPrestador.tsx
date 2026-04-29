import imgInicio from "../../images/inicio.png";
import imgAgenda from "../../images/agenda.png";
import imgHistorico from "../../images/historico.png";

function SideBarPrestador() {
  return (
    <>
      {/* Sidebar vertical — desktop */}
      <div className="hidden md:flex flex-col gap-1 w-full">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-left">
          <img src={imgInicio} alt="Início" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Início</span>
        </button>

        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-left">
          <img src={imgAgenda} alt="Agenda" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Agenda</span>
        </button>

        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full text-left">
          <img src={imgHistorico} alt="Histórico" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Histórico</span>
        </button>
      </div>

      {/* Barra horizontal de ícones — mobile */}
      <div className="flex md:hidden bg-white rounded-lg px-2 py-2 gap-1 w-full justify-around">
        <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <img src={imgInicio} alt="Início" className="w-5 h-5" />
          <span className="text-xs text-gray-600">Início</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <img src={imgAgenda} alt="Agenda" className="w-5 h-5" />
          <span className="text-xs text-gray-600">Agenda</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <img src={imgHistorico} alt="Histórico" className="w-5 h-5" />
          <span className="text-xs text-gray-600">Histórico</span>
        </button>
      </div>
    </>
  );
}

export default SideBarPrestador;