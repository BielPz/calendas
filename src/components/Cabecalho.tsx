import imgLogo from "../images/logo.png";
import { Link } from "react-router-dom";

interface Props 
{
  perfil?: boolean
  nome?: string
}

function Cabecalho({perfil, nome}: Props) {
  return (
    <div className="w-full z-50 flex justify-center">
      <div className="w-[95%] border-b border-white flex items-center py-2 px-3">
        
        <img
          src={imgLogo}
          alt="logo"
          className="w-24 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
        {perfil === undefined && (
          <div className="ml-auto flex gap-3">
            <Link
              to="/login"
              className="text-white text-sm font-medium
                        hover:bg-gray-800  
                        transition-colors duration-200 px-3 py-1 rounded-lg"
            >
              Entrar
            </Link>

            <Link
              to="/cadastro"
              className="text-white text-sm font-medium
                        hover:bg-gray-800  
                        transition-colors duration-200 px-3 py-1 rounded-lg"
            >
              Cadastrar
            </Link>
          </div>
        )}

        {perfil !== undefined && (
          <div className="ml-auto flex gap-3">
            <Link
            to="/"
            className="text-white text-sm font-medium
                      hover:bg-gray-800  
                      transition-colors duration-200 px-3 py-1 rounded-lg"
            >
              {nome || "Perfil"}            
            </Link>
          </div>
        )}
      </div>
</div>
  );
}

export default Cabecalho;
