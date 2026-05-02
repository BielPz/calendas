import { Check, X, AlertTriangle, WifiOff, Info } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [visivel, setVisivel] = useState(false);

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

  // Controla a visibilidade do card para permitir a animação de saída
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden"; // Impede o scroll do fundo quando o card estiver aberto
      setVisivel(true); // Permite que o card seja renderizado para a animação de entrada
    } else {
      document.body.style.overflow = "auto"; // Restaura o scroll do fundo quando o card for fechado
      setTimeout(() => setVisivel(false), 300); // tempo da animação de saída para remover o card do DOM após a animação
    }

    // Limpa o estilo de overflow quando o componente for desmontado para evitar efeitos colaterais
    return () => {
      document.body.style.overflow = "auto"; // Restaura o scroll do fundo se o componente for desmontado enquanto o card estiver aberto
    };
  }, [aberto]);
  if (!visivel) return null; // Não renderiza o card se ele não for visível (após a animação de saída)

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
      bg: "bg-blue-500",
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
            border-8 border-gray-100
            ${atual.bg}
          `}
        >
          {atual.icon}
        </div>

        {/* Card */}
        <div className="bg-gray-300 rounded-3xl p-6 pt-16 shadow-inner flex flex-col items-center text-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">{titulo}</h1>
          <p className="text-gray-700 text-sm leading-relaxed px-2">{label}</p>

          <button
            onClick={onClose}
            className="mt-4 w-3/4 py-3 rounded-full bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardAlerta;
