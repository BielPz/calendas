import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarClock,
  House,
  History,
  MessageCircle,
} from "lucide-react";
import { useMensagensNaoLidas } from "../../hooks/useMensagensNaoLidas";
import MenuPrincipal from "../utils/MenuPrincipal";

function SideBarPrestador() {
  const navigate = useNavigate();
  const mensagensNaoLidas = useMensagensNaoLidas();

  return (
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
          label: "Agenda",
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
    />
  );
}

export default SideBarPrestador;
