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
    } catch (error: any) {
      const mensagens: Record<string, string> = {
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/user-disabled":
          "Conta desativada. Entre em contato com o suporte.",
        "auth/too-many-requests":
          "Muitas tentativas. Tente novamente mais tarde.",
        "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
      };
      const mensagem =
        mensagens[error.code] ?? "Erro desconhecido. Tente novamente.";
      setErro(mensagem);
      mensagem == "auth/network-request-failed"
        ? showAlerta("Desconectado", mensagem, "desconect")
        : showAlerta("Erro", mensagem, "erro");
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
            w-full py-4 rounded-xl text-white font-semibold mb-3
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
        <div className="border-t border-gray-300 dark:border-gray-700 my-3" />
        <p className="text-start text-m mb-10">
          Não tem uma conta?{" "}
          <Link
            to="/cadastro"
            className="text-blue-700 dark:text-blue-400 dark:hover:text-blue-50 hover:text-black transition-colors duration-200 font-semibold"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TelaLogin;
