import type { ReactNode } from "react";

export interface ItemMenuPrincipal {
  id: string;
  label: string;
  icon: ReactNode;
  labelCurto?: string;
  onClick?: () => void;
  contador?: number;
}

interface Props {
  itens: ItemMenuPrincipal[];
  conteudoExtra?: ReactNode;
}

function MenuPrincipal({ itens, conteudoExtra }: Props) {
  const classeDesktop =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-slate-600 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300";

  const classeMobile =
    "flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-slate-600 transition hover:bg-orange-50 hover:text-orange-700 active:bg-orange-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300 dark:active:bg-zinc-800";

  return (
    <>
      {/* Desktop: lista vertical */}
      <nav
        aria-label="Menu principal"
        className="hidden w-full flex-col gap-1 md:flex"
      >
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={classeDesktop}
          >
            {item.icon}
            <span className="truncate text-sm font-medium">{item.label}</span>
            {item.contador ? (
              <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {item.contador}
              </span>
            ) : null}
          </button>
        ))}
        {conteudoExtra}
      </nav>

      {/* Mobile: grade com uma coluna por item */}
      <nav
        aria-label="Menu principal"
        className="ui-card grid w-full gap-1 rounded-xl p-1.5 md:hidden"
        style={{
          gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))`,
        }}
      >
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            aria-label={item.label}
            className={classeMobile}
          >
            <span className="relative">
              {item.icon}
              {item.contador ? (
                <i className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-orange-500" />
              ) : null}
            </span>
            <span className="w-full truncate text-center text-[11px] leading-tight sm:text-xs">
              {item.labelCurto ?? item.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default MenuPrincipal;
