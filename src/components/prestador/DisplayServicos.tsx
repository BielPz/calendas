import { useNavigate } from "react-router-dom";

interface DisplayProps {
  idEmpresa: string;
}

function DisplayServicos({ idEmpresa }: DisplayProps) {
  const navigate = useNavigate();

  const handleNovoServico = () => {
    if (!idEmpresa) {
      alert("Por favor, selecione uma empresa no topo da página.");
      return;
    }
    // Envia o ID da empresa via estado de navegação
    navigate("/cadastro-servico", { state: { idEmpresa } });
  };

  return (
    <div className="flex flex-wrap gap-4">
      {/* Botão de Quadrado Cinza com o símbolo de + */}
      <div 
        onClick={handleNovoServico}
        className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        <span className="pb-3 text-8xl leading-0 text-gray-600 select-none">+</span>
      </div>

      {/* Aqui viria a sua lista de serviços existentes... */}
    </div>
  );
}
export default DisplayServicos