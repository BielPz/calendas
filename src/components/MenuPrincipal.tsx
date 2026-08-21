import type { ReactNode } from "react";

export interface ItemMenuPrincipal {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  contador?: number;
}

interface Props {
  itens: ItemMenuPrincipal[];
  conteudoExtra?: ReactNode;
}

function MenuPrincipal({ itens, conteudoExtra }: Props) {
  const classe =
    "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-slate-600 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300 sm:flex-row sm:gap-3 sm:px-3 sm:w-full sm:text-left";

  return (
    <>
      <nav className="hidden w-full flex-col gap-1 md:flex">
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={classe}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
            {item.contador ? (
              <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {item.contador}
              </span>
            ) : null}
          </button>
        ))}
        {conteudoExtra}
      </nav>
      <nav className="ui-card flex w-full justify-around gap-1 rounded-xl px-2 py-2 md:hidden">
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={classe}
          >
            <span className="relative">
              {item.icon}
              {item.contador ? (
                <i className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-orange-500" />
              ) : null}
            </span>
            <span className="text-xs">
              {item.label === "Minha Agenda" ? "Agenda" : item.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default MenuPrincipal;
