import type { ReactNode } from "react";

interface Props {
  children: ReactNode[];
}
// Arrumar o tamanho do form para porcentagem
function Formulario({ children }: Props) {
  return (
    <form className="w-2/3">
      {children.map((children, index) => (
        <div key={index} className="pb-4">
          {children}
        </div>
      ))}
    </form>
  );
}

export default Formulario;