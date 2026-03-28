import imgLogo from "../images/logo.png";
import { Link } from "react-router-dom";

function Cabecalho() {
  return (
    <div className={`flex h-[10%] items-center justify-center`}>
      <div className="flex border-b border-white h-13 w-[98%] items-center p-3">
        <img src={imgLogo} alt="logo" className="w-30" />
        <div className="ml-auto flex gap-4">
          <Link
            to="/login"
            className="text-white font-medium
                        hover:bg-gray-800  
                        active:bg-gray-800
                        transition-colors duration-200 px-3 py-1 rounded-lg cursor-pointer"
          >
            Entrar
          </Link>
          <Link
            to="cadastro"
            className="text-white font-medium
                        hover:bg-gray-800  
                        active:bg-gray-800
                        transition-colors duration-200 px-3 py-1 rounded-lg cursor-pointer"
          >
            Cadastrar
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cabecalho;
