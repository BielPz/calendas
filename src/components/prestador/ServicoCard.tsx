import type { Servico } from "../../firebase/types";
import CardServico from "../CardServico";

interface Props { servico: Servico; onClick?: () => void; }

export default function ServicoCard({ servico, onClick }: Props) {
  return <CardServico servico={servico} onClick={onClick} />;
}
