import { useState } from "react";
import CabecalhoBranco from "../components/CabecalhoBranco";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../components/TextInput";
import { login } from "../firebase/auth";
import { useAlerta } from "../provider/AlertContext";

function TelaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"cliente" | "prestador">("cliente");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { showAlerta } = useAlerta();

  const isValid = Boolean(email && senha);

  const handleLogin = async () => {
    if (!isValid) return;
    try {
      await login(email, senha, tipo);
      navigate("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
      showAlerta("Erro", errorMessage, "erro"); // Exibe um alerta global de erro usando o contexto de alerta para informar o usuário sobre o problema de login
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen dark:bg-zinc-900">
      <CabecalhoBranco tipo={tipo} setTipo={setTipo} titulo="Login" />
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
            className="text-m text-blue-700 dark:text-blue-400 dark:hover:text-blue-50 hover:text-black transition-colors duration-200 self-start mt-1 mb-5"
          >
            Esqueci a senha
          </Link>
        </div>

        <div className="w-full min-w-75">
          <button
            disabled={!isValid}
            onClick={handleLogin}
            className={`
            w-full py-4 rounded-xl text-white font-semibold mb-10
            ${
              isValid
                ? "bg-linear-to-br from-orange-500 to-purple-500 dark:from-indigo-600 dark:to-zinc-600 dark:hover:from-indigo-950 dark:hover:to-zinc-950 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelaLogin;
