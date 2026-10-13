import type { Servico } from "../../firebase/types";
import CardServico from "../modals/CardServico";

interface Props {
  servico: Servico;
  onClick?: () => void;
}

function ServicoCard({ servico, onClick }: Props) {
  return <CardServico servico={servico} onClick={onClick} />;
}

export default ServicoCard;
