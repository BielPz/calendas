import logoClaro from "@/images/logo.png";
import logoEscuro from "@/images/logo_escuro.png";

interface Props {
  onClick?: () => void;
  className?: string;
}

function MarcaLogo({ onClick, className = "w-24" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0"
      aria-label="Ir para o início"
    >
      <img
        src={logoClaro}
        alt="CalendaS"
        className={`${className} cursor-pointer object-contain dark:hidden`}
      />
      <img
        src={logoEscuro}
        alt="CalendaS"
        className={`hidden ${className} cursor-pointer object-contain dark:block`}
      />
    </button>
  );
}

export default MarcaLogo;
