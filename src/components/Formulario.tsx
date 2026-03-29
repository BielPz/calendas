import type { ReactNode } from "react";

interface Props {
  children: ReactNode[];
  titulo: string;
}
// Arrumar o tamanho do form para porcentagem
function Formulario({ children, titulo }: Props) {
  return (
    <>
      <h1 className="font-bold text-4xl py-6">Cadastro {titulo}</h1>
      <form>
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
