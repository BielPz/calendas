import { useNavigate } from "react-router-dom";
import Logo from "../images/logo.png";
import { getAuth } from "firebase/auth";

interface Props {
  tipo?: "cliente" | "prestador";
  setTipo?: React.Dispatch<React.SetStateAction<"cliente" | "prestador">>;
  titulo: string;
}

function CabecalhoBranco({ tipo, setTipo, titulo }: Props) {
  const navigate = useNavigate();

  const handleCliqueLogo = () => {
    const auth = getAuth();
    const usuarioLogado = auth.currentUser;
    if (usuarioLogado) {
      navigate("/feed");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-[45%] flex flex-col gap-2">
      <div className="w-full flex justify-center">
        <img
          src={Logo}
          alt="logo"
          className="w-80 object-contain cursor-pointer"
          onClick={handleCliqueLogo}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="px-4 text-gray-500 dark:text-white font-medium">
            {titulo}
          </span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        {tipo !== undefined && setTipo !== undefined && (
          <div>
            <div className="relative flex items-center w-full min-w-[280px] bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 rounded-full p-1 border border-gray-200 mb-5">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-600 rounded-full shadow transition-all duration-300 ease-in-out
                ${tipo === "cliente" ? "left-1" : "left-[calc(50%+3px)]"}`}
              />

              <button
                onClick={() => setTipo("cliente")}
                className={`relative flex-1 px-4 py-3 rounded-full cursor-pointer transition-colors duration-300 font-medium z-10 whitespace-nowrap text-sm
                ${tipo === "cliente" ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-400"}`}
              >
                Cliente
              </button>

              <button
                onClick={() => setTipo("prestador")}
                className={`relative flex-1 px-4 py-3 rounded-full cursor-pointer transition-colors duration-300 font-medium z-10 whitespace-nowrap text-sm
                ${tipo === "prestador" ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-400"}`}
              >
                Prestador
              </button>
            </div>
            <hr className="border-t border-gray-400 my-2" />
          </div>
        )}
      </div>
    </div>
  );
}

export default CabecalhoBranco;
