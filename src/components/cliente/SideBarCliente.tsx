import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  House,
  History,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Servico } from "../../firebase/types";

const LIMITE_FAVORITOS = 3;

interface Props {
  favoritos?: Servico[];
  onNavigateServico?: (servico: Servico) => void;
}

function SideBarCliente({ favoritos = [], onNavigateServico }: Props) {
  const navigate = useNavigate();
  const [expandido, setExpandido] = useState(false);

  const favoritosVisiveis = expandido
    ? favoritos
    : favoritos.slice(0, LIMITE_FAVORITOS);
  const temMais = favoritos.length > LIMITE_FAVORITOS;

  const commonButtonClasses =
    "flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-4 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors duration-200 sm:w-full sm:text-left";

  // Item de favorito — compartilhado entre desktop e mobile
  const itemFavorito = (s: Servico) => (
    <button
      key={s.id}
      onClick={() => onNavigateServico?.(s)}
      className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors text-left group"
    >
      <div className="w-6 h-6 rounded shrink-0 bg-gray-200 dark:bg-zinc-600 overflow-hidden">
        {s.imagem ? (
          <img
            src={s.imagem}
            alt={s.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
        {s.nome}
      </span>
      <Heart size={10} className="text-red-400 shrink-0 fill-red-400" />
    </button>
  );

  return (
    <>
      {/* ── SIDEBAR DESKTOP ───────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col gap-1 w-full">
        <button className={commonButtonClasses}>
          <House size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Início
          </span>
        </button>

        <button
          className={commonButtonClasses}
          onClick={() => navigate("/calendario")}
        >
          <CalendarClock size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Minha Agenda
          </span>
        </button>

        <button className={commonButtonClasses}>
          <History size={18} className="dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Histórico
          </span>
        </button>

        {/* Seção Favoritos */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-700">
          <div className="flex items-center justify-between px-3 mb-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-100 uppercase tracking-wide">
              Favoritos
            </p>
            {favoritos.length > 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {favoritos.length}
              </span>
            )}
          </div>

          {favoritos.length === 0 ? (
            <p className="px-3 text-xs text-gray-300 dark:text-zinc-600 italic">
              Nenhum favorito ainda
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {favoritosVisiveis.map(itemFavorito)}

              {temMais && (
                <button
                  onClick={() => setExpandido(!expandido)}
                  className="flex items-center gap-1 px-3 py-1 text-[10px] text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {expandido ? (
                    <>
                      <ChevronUp size={11} /> Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown size={11} /> +
                      {favoritos.length - LIMITE_FAVORITOS} mais
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BARRA MOBILE ──────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col gap-2 w-full">
        {/* Ícones principais */}
        <div className="flex bg-white dark:bg-zinc-800 rounded-lg px-2 py-2 gap-1 w-full justify-around">
          <button className={commonButtonClasses}>
            <House size={18} className="dark:text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Início
            </span>
          </button>
          <button
            className={commonButtonClasses}
            onClick={() => navigate("/calendario")}
          >
            <CalendarClock size={18} className="dark:text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Agenda
            </span>
          </button>
          <button className={commonButtonClasses}>
            <History size={18} className="dark:text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Histórico
            </span>
          </button>
        </div>

        {/* Favoritos mobile — aparece abaixo dos ícones */}
        {favoritos.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 w-full">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Heart size={11} className="text-red-400 fill-red-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Favoritos
                </span>
                <span className="text-[10px] text-gray-300 dark:text-zinc-600">
                  ({favoritos.length})
                </span>
              </div>
              {temMais && (
                <button
                  onClick={() => setExpandido(!expandido)}
                  className="text-[10px] text-blue-500 flex items-center gap-0.5"
                >
                  {expandido ? (
                    <>
                      <ChevronUp size={10} />
                      Menos
                    </>
                  ) : (
                    <>
                      <ChevronDown size={10} />
                      Ver tudo
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Lista horizontal no mobile */}
            <div
              className={`flex gap-2 ${expandido ? "flex-wrap" : "overflow-x-auto"}`}
            >
              {favoritosVisiveis.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigateServico?.(s)}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-700 overflow-hidden relative">
                    {s.imagem ? (
                      <img
                        src={s.imagem}
                        alt={s.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                    <Heart
                      size={8}
                      className="absolute bottom-0.5 right-0.5 text-red-400 fill-red-400"
                    />
                  </div>
                  <span className="text-[9px] text-gray-600 dark:text-gray-400 max-w-[44px] truncate">
                    {s.nome}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SideBarCliente;
