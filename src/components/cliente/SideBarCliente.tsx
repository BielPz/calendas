import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  House,
  History,
  Heart,
  HeartOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Servico } from "../../firebase/types";

const LIMITE_FAVORITOS = 3;

interface Props {
  favoritos?: Servico[];
  onNavigateServico?: (servico: Servico) => void;
  onRemoverFavorito?: (idServico: string) => void;
}

function SideBarCliente({ favoritos = [], onNavigateServico, onRemoverFavorito }: Props) {
  const navigate = useNavigate();
  const [expandido, setExpandido] = useState(false);

  const favoritosVisiveis = expandido
    ? favoritos
    : favoritos.slice(0, LIMITE_FAVORITOS);
  const temMais = favoritos.length > LIMITE_FAVORITOS;

  const commonButtonClasses =
    "flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-4 sm:px-3 py-2 rounded-lg text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300 transition-colors duration-200 sm:w-full sm:text-left";

  // Item de favorito — compartilhado entre desktop e mobile
  const itemFavorito = (s: Servico) => (
    <div key={s.id} className="group flex items-center gap-1 rounded-lg px-1 py-0.5 hover:bg-orange-50 dark:hover:bg-zinc-700">
      <button
        onClick={() => onNavigateServico?.(s)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left"
      >
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-zinc-600">
          {s.imagem ? <img src={s.imagem} alt={s.nome} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
        </div>
        <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">{s.nome}</span>
      </button>
      {s.id && (
        <button
          type="button"
          onClick={() => onRemoverFavorito?.(s.id!)}
          className="rounded-md p-1.5 text-red-400 opacity-70 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-500/10"
          aria-label={`Remover ${s.nome} dos favoritos`}
          title="Remover dos favoritos"
        >
          <HeartOff size={14} />
        </button>
      )}
    </div>
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
                  className="flex items-center gap-1 px-3 py-1 text-[10px] text-orange-700 hover:text-violet-700 dark:text-orange-300 dark:hover:text-violet-300 transition-colors"
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
        <div className="ui-card flex gap-1 rounded-xl px-2 py-2 w-full justify-around">
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
          <div className="ui-card rounded-xl px-3 py-2 w-full">
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
                  className="flex items-center gap-0.5 text-[10px] text-orange-700 dark:text-orange-300"
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
                <div key={s.id} className="relative shrink-0">
                  <button
                    onClick={() => onNavigateServico?.(s)}
                    className="flex flex-col items-center gap-1"
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
                  {s.id && (
                    <button
                      type="button"
                      onClick={() => onRemoverFavorito?.(s.id!)}
                      className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-red-500 shadow-sm dark:bg-zinc-800"
                      aria-label={`Remover ${s.nome} dos favoritos`}
                      title="Remover dos favoritos"
                    >
                      <HeartOff size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SideBarCliente;
