import type { ReactNode } from "react";

interface Props {
  children: ReactNode[];
  className?: string;
}
// Arrumar o tamanho do form para porcentagem
function Formulario({ children, className = "" }: Props) {
  return (
    <>
      <form className={`mt-5 ${className}`}>
        {children.map((children, index) => (
          <div key={index} className="pb-3">
            {children}
          </div>
        ))}
      </form>
    </>
  );
}

export default Formulario;
