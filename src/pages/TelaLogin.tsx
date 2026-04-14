import { useState } from "react";
import CabecalhoBranco from "../components/CabecalhoBranco";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../components/TextInput";
import { login } from "../firebase/auth";

function TelaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"cliente" | "prestador">("cliente");  
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const isValid = Boolean(email && senha);

  const handleLogin = async () => {
    if (!isValid) return;

    try {
      await login(email, senha, tipo);
      if (tipo === "cliente")
      {
        //navigate("/feed/cliente");
        navigate("/feed");
      }
      else 
      {
        //navigate("/feed/prestador");
        navigate("/feed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CabecalhoBranco
          tipo={tipo}
          setTipo={setTipo}
          titulo="Login"
      />
      <div className="w-[45%] min-w-75 relative">
        <div className="w-full flex flex-col gap-3">
            <TextInput
              titulo="E-mail"
              type="email"
              onChange={(value) => setEmail(value)}
              required
            />
            <TextInput
              titulo="Senha"
              type="password"
              onChange={(value) => setSenha(value)}
              required
            />
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <Link
              to="/esqueci-senha"
              className="text-sm text-gray-400 hover:text-black transition-colors duration-200 self-start mt-1 mb-5"
            >
              Esqueci a senha
            </Link>
        </div>

        <div className="w-full min-w-75">
          <button
            disabled={!isValid}
            onClick={handleLogin}
            className="w-full py-4 rounded-xl text-white font-semibold bg-linear-to-br from-orange-400 to-purple-400 cursor-pointer mb-10"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelaLogin;
