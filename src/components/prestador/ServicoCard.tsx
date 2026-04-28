import type { Servico } from "../../firebase/types";

interface Props {
  servico: Servico;
}

function ServicoCard({ servico }: Props) {
  return (
    <div className="flex h-24 w-24 sm:h-32 sm:w-32 cursor-pointer flex-col justify-center rounded-lg bg-gray-200 p-2 hover:bg-gray-300 transition-colors">
      <p className="font-semibold text-xs sm:text-sm">{servico.nome}</p>
      <p className="text-xs text-gray-600">R$ {servico.preco}</p>
    </div>
  );
}

export default ServicoCard;