import type { ReactNode } from "react";

interface Props {
  children: ReactNode[];
}
// Arrumar o tamanho do form para porcentagem
function Formulario({ children }: Props) {
  return (
    <>
      <form className="mt-5">
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
