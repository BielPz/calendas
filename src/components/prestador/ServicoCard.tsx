import type { Servico } from "../../firebase/types";
import imgErrorInternet from "../../images/erroInternet.jpg";

interface Props {
  servico: Servico;
  onClick?: () => void;
}

function ServicoCard({ servico, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="ui-card flex h-36 w-36 shrink-0 flex-col overflow-hidden p-2 text-left transition hover:border-orange-300 hover:shadow-md">
      {/* Imagem superior */}
      <div className="h-16 w-full shrink-0 bg-slate-100 dark:bg-zinc-800">
        {servico.imagem != undefined ? (
          <img
            src={servico.imagem}
            alt="imagem do serviço"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = imgErrorInternet;
            }}
          />
        ) : (
            <div className="h-full w-full bg-slate-100 dark:bg-zinc-800" />
        )}
      </div>

      {/* Informações abaixo */}
      <div className="flex min-h-0 flex-1 flex-col pt-2">
        <p className="min-h-7 line-clamp-2 font-semibold text-sm leading-tight">
          {servico.nome}
        </p>
        <p className="mt-auto text-xs text-slate-600 dark:text-zinc-300">R$ {servico.preco}</p>
        {/* Avaliação 
        {servico.avaliacao != undefined && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs text-gray-600">{servico.avaliacao}</span>
          </div>
        )}
      */}
      </div>
    </button>
  );
}

export default ServicoCard;
