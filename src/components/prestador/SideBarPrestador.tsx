import { useNavigate } from "react-router-dom";
import { Bell, CalendarClock, House, History } from "lucide-react";
import MenuPrincipal from "../MenuPrincipal";

export default function SideBarPrestador() {
  const navigate = useNavigate();
  return <MenuPrincipal itens={[{ id: "inicio", label: "Início", icon: <House size={18} />, onClick: () => navigate("/feed") }, { id: "agenda", label: "Agenda", icon: <CalendarClock size={18} />, onClick: () => navigate("/calendario") }, { id: "notificacoes", label: "Notificações", icon: <Bell size={18} />, onClick: () => navigate("/notificacoes") }, { id: "historico", label: "Histórico", icon: <History size={18} /> }]} />;
}
