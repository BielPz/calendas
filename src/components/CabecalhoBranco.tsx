import Logo from "../images/logo.png";

interface Props {
  tipo: string;
  setTipo: React.Dispatch<React.SetStateAction<string>>;
  titulo: string;
}

function CabecalhoBranco({ tipo, setTipo, titulo }: Props) {
  return (
    <div className="w-[45%] flex flex-col gap-2">
      <div className="w-full flex justify-center">
        <img
          src={Logo}
          alt="logo"
          className="w-80 object-contain cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="px-4 text-gray-500 font-medium">{titulo}</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <div className="flex items-center justify-center w-full gap-4">
          <button
            onClick={() => setTipo("cliente")}
            className={`flex-1 px-7 py-5 border border-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition 
                    ${tipo === "cliente" ? "bg-gray-300" : ""}`}
          >
            Cliente
          </button>

          <button
            onClick={() => setTipo("prestador")}
            className={`flex-1 px-7 py-5 border border-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition 
                    ${tipo === "prestador" ? "bg-gray-300" : ""}`}
          >
            Prestador
          </button>
        </div>

        <hr className="border-t border-gray-400 my-2" />
      </div>
    </div>
  );
}

export default CabecalhoBranco;
