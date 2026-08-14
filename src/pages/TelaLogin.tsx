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
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
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
        mensagens[code] ??
        (error instanceof Error
          ? error.message
          : "Erro desconhecido. Tente novamente.");
      setErro(mensagem);
      if (code === "auth/network-request-failed") {
        showAlerta("Desconectado", mensagem, "desconect");
      } else {
        showAlerta("Erro", mensagem, "erro");
      }
    }
  };

  return (
    <div className="flex h-dvh flex-col items-center overflow-hidden dark:bg-zinc-900">
      <CabecalhoBranco tipo={tipo} setTipo={setTipo} titulo="Login" />
      <div className="w-full max-w-xl flex-1 min-h-0 px-4">
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
          <Link to="/esqueci-senha" className="ui-link self-start mt-1 mb-5">
            Esqueci a senha
          </Link>
        </div>

        <div className="w-full">
          <button
            disabled={!isValid}
            onClick={handleLogin}
            className={`
            ui-button-primary w-full py-4 mb-3
            ${
              isValid
                ? "bg-linear-to-br from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          >
            Continuar
          </button>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-700 my-3" />
        <p className="text-start text-m mb-3 dark:text-gray-300">
          Não tem uma conta?{" "}
          <Link to="/cadastro" className="ui-link">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TelaLogin;
