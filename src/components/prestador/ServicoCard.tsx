import type { Servico } from "../../firebase/types";
import imgErrorInternet from "../../images/erroInternet.jpg";

interface Props {
  servico: Servico;
}

function ServicoCard({ servico }: Props) {
  return (
    <div className="shrink-0 flex h-24 w-24 sm:h-32 sm:w-32 cursor-pointer flex-col justify-center rounded-lg bg-gray-200 p-2 hover:bg-gray-300 transition-colors">
      {/* Imagem superior */}
      <div className="w-full h-24 sm:h-28 bg-gray-200">
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
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Informações abaixo */}
      <div className="p-2 flex flex-col gap-0.5">
        <p className="font-semibold text-sm leading-tight sm:text-sm">
          {servico.nome}
        </p>
        <p className="text-xs text-gray-600">R$ {servico.preco}</p>
        {/* Avaliação 
        {servico.avaliacao != undefined && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs text-gray-600">{servico.avaliacao}</span>
          </div>
        )}
      */}
      </div>
    </div>
  );
}

export default ServicoCard;
