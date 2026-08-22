import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  House,
  History,
  Heart,
  HeartOff,
  Bell,
  MessageCircle,
} from "lucide-react";
import type { Servico } from "../../firebase/types";
import { useMensagensNaoLidas } from "@/hooks/useMensagensNaoLidas";
import MenuPrincipal from "../utils/MenuPrincipal";

const LIMITE_FAVORITOS = 3;

interface Props {
  favoritos?: Servico[];
  onNavigateServico?: (servico: Servico) => void;
  onRemoverFavorito?: (idServico: string) => void;
}

function SideBarCliente({
  favoritos = [],
  onNavigateServico,
  onRemoverFavorito,
}: Props) {
  const navigate = useNavigate();
  const [expandido, setExpandido] = useState(false);

  const mensagensNaoLidas = useMensagensNaoLidas();

  const itens = expandido ? favoritos : favoritos.slice(0, LIMITE_FAVORITOS);

  const lista = (
    <section className="mt-3 border-t border-slate-200 pt-3 dark:border-zinc-700">
      <div className="mb-2 flex items-center justify-between px-3">
        <span className="text-xs font-black uppercase tracking-wide text-slate-500">
          Favoritos
        </span>
        {favoritos.length > LIMITE_FAVORITOS && (
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="text-xs font-semibold text-orange-700 dark:text-orange-300"
          >
            {expandido ? "Ver menos" : "Ver todos"}
          </button>
        )}
      </div>
      {itens.length ? (
        <div className="space-y-1">
          {itens.map((servico) => (
            <div
              key={servico.id}
              className="group flex items-center gap-1 rounded-lg px-1 hover:bg-orange-50 dark:hover:bg-zinc-700"
            >
              <button
                type="button"
                onClick={() => onNavigateServico?.(servico)}
                className="flex min-w-0 flex-1 items-center gap-2 p-2 text-left"
              >
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded bg-slate-200 dark:bg-zinc-600">
                  {servico.imagem && (
                    <img
                      src={servico.imagem}
                      alt={servico.nome}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="truncate text-xs text-slate-700 dark:text-zinc-200">
                  {servico.nome}
                </span>
              </button>
              {servico.id && (
                <button
                  type="button"
                  onClick={() => onRemoverFavorito?.(servico.id!)}
                  className="p-2 text-red-500"
                  aria-label="Remover favorito"
                >
                  <HeartOff size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 text-xs italic text-slate-400">
          Nenhum favorito ainda.
        </p>
      )}
    </section>
  );

  return (
    <div className="w-full">
      <MenuPrincipal
        itens={[
          {
            id: "inicio",
            label: "Início",
            icon: <House size={18} />,
            onClick: () => navigate("/feed"),
          },
          {
            id: "agenda",
            label: "Minha Agenda",
            icon: <CalendarClock size={18} />,
            onClick: () => navigate("/calendario"),
          },
          {
            id: "mensagens",
            label: "Mensagens",
            icon: <MessageCircle size={18} />,
            contador: mensagensNaoLidas,
            onClick: () => navigate("/mensagens"),
          },
          {
            id: "notificacoes",
            label: "Notificações",
            icon: <Bell size={18} />,
            onClick: () => navigate("/notificacoes"),
          },
          { id: "historico", label: "Histórico", icon: <History size={18} /> },
        ]}
        conteudoExtra={lista}
      />
      {favoritos.length > 0 && (
        <div className="ui-card mt-2 p-2 md:hidden">
          <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-500">
            <Heart size={13} className="fill-current text-red-500" /> Favoritos
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {itens.map((servico) => (
              <button
                key={servico.id}
                type="button"
                onClick={() => onNavigateServico?.(servico)}
                className="w-16 shrink-0 text-center"
              >
                <div className="mx-auto h-10 w-10 overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-700">
                  {servico.imagem && (
                    <img
                      src={servico.imagem}
                      alt={servico.nome}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="mt-1 block truncate text-[10px] text-slate-600 dark:text-zinc-300">
                  {servico.nome}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBarCliente;
