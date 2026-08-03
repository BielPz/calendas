import { Check, X, AlertTriangle, WifiOff, Info } from "lucide-react";
import { useEffect } from "react";

interface Props {
  aberto: boolean;
  type?: "sucesso" | "erro" | "desconect" | "aviso" | "info";
  titulo: string;
  label: string;
  onClose: () => void;
}

function CardAlerta({
  aberto,
  type = "sucesso",
  titulo,
  label,
  onClose,
}: Props) {
  // Adiciona um listener para fechar o card quando a tecla "Escape" for pressionada
  useEffect(() => {
    if (!aberto) return; // Se o card não estiver aberto, não precisa adicionar o listener

    // Função para lidar com a tecla "Escape"
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Adiciona o listener para a tecla "Escape" quando o card estiver aberto
    window.addEventListener("keydown", handleEsc);

    // Remove o listener quando o card for fechado ou quando o componente for desmontado
    return () => window.removeEventListener("keydown", handleEsc);
  }, [aberto, onClose]); // O listener só é adicionado quando o card está aberto, e é removido quando o card é fechado ou quando o componente é desmontado

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [aberto]);
  if (!aberto) return null;

  // Define os estilos e ícones para cada tipo de alerta
  const estilos = {
    sucesso: {
      bg: "bg-green-500",
      icon: <Check size={36} className="text-white" />,
    },
    erro: {
      bg: "bg-red-500",
      icon: <X size={36} className="text-white" />,
    },
    aviso: {
      bg: "bg-yellow-500",
      icon: <AlertTriangle size={36} className="text-white" />,
    },
    desconect: {
      bg: "bg-gray-500",
      icon: <WifiOff size={36} className="text-white" />,
    },
    info: {
      bg: "bg-violet-600",
      icon: <Info size={36} className="text-white" />,
    },
  };

  // Seleciona o estilo e ícone com base no tipo, ou usa o estilo de sucesso como padrão
  const atual = estilos[type] || estilos.sucesso;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className={`
          absolute inset-0 bg-black/50 transition-opacity duration-300
          ${aberto ? "opacity-100" : "opacity-0"}
      `}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`
          relative z-10 w-[320px]
          transition-all duration-300
          ${aberto ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
      >
        {/* Informativo (círculo em cima) */}
        <div
          className={`
            absolute -top-12 left-1/2 -translate-x-1/2
            w-24 h-24 rounded-full flex items-center justify-center
            border-8 border-white dark:border-zinc-900
            ${atual.bg}
          `}
        >
          {atual.icon}
        </div>

        {/* Card */}
        <div className="ui-card rounded-2xl p-6 pt-16 shadow-lg flex flex-col items-center text-center gap-4">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">{titulo}</h1>
          <p className="px-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">{label}</p>

          <button
            onClick={onClose}
            className="ui-button-primary mt-4 w-3/4"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardAlerta;
