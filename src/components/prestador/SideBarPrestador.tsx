import { useNavigate } from "react-router-dom";
import { CalendarClock, House, History } from "lucide-react";
import MenuPrincipal from "../MenuPrincipal";

export default function SideBarPrestador() {
  const navigate = useNavigate();
  return <MenuPrincipal itens={[{ id: "inicio", label: "Início", icon: <House size={18} /> }, { id: "agenda", label: "Agenda", icon: <CalendarClock size={18} />, onClick: () => navigate("/calendario") }, { id: "historico", label: "Histórico", icon: <History size={18} /> }]} />;
}
