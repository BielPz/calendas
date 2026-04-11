import { Link } from "react-router-dom";
import TextInput from "../TextInput";

function LoginCliente() {
  return (
    <div className="w-full flex flex-col gap-3">
      <div>
        <TextInput titulo="Email" type="text" required={true} />
      </div>

      <div>
        <TextInput titulo="Senha" type="text" required={true} />
        <Link
          to="/esqueci-senha"
          // Arrumar o estilo do link depois
          className="text-black text-sm font-medium justify-self-start
                      hover:bg-gray-800
                      transition-colors duration-200 px-3 py-1 rounded-lg mt-2 text-right block mb-5"
        >
          Esqueci a senha
        </Link>
      </div>
    </div>
  );
}

export default LoginCliente;
