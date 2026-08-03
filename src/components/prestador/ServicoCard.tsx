import type { Servico } from "../../firebase/types";
import imgErrorInternet from "../../images/erroInternet.jpg";

interface Props {
  servico: Servico;
  onClick?: () => void;
}

function ServicoCard({ servico, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="ui-card shrink-0 flex h-28 w-28 cursor-pointer flex-col justify-center overflow-hidden p-2 text-left transition hover:border-orange-300 hover:shadow-md sm:h-36 sm:w-36">
      {/* Imagem superior */}
      <div className="h-20 w-full bg-slate-100 dark:bg-zinc-800 sm:h-24">
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
      <div className="p-2 flex flex-col gap-0.5">
        <p className="font-semibold text-sm leading-tight sm:text-sm">
          {servico.nome}
        </p>
        <p className="text-xs text-slate-600 dark:text-zinc-300">R$ {servico.preco}</p>
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
