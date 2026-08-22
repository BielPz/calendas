import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlerta } from "../provider/AlertContext";
import { useGradiente } from "../hooks/useGradiente";
import { redefinirSenha } from "@/features/auth/auth.service";
import Cabecalho from "@/components/utils/Cabecalho";
import TextInput from "@/components/utils/TextInput";

function TelaEsqueciSenha() {
  const [form, setForm] = useState({ email: "" });
  // Validação simples: o email deve ser preenchido e ter um formato básico (ex: aluno@gmail.com)
  const isValid = form.email.trim() !== "" && /\S+@\S+\.\S+/.test(form.email);

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const navigate = useNavigate();
  const cor_fundo = useGradiente();
  const { showAlerta } = useAlerta();

  return (
    <div
      className={`${cor_fundo} min-h-screen w-full flex flex-col items-center justify-start`}
    >
      <Cabecalho />
      <div className="min-w-[300px] relative flex flex-col items-center gap-6 justify-center py-10 px-10">
        <div className="max-w-md justify-center items-center bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-md px-10 flex flex-col gap-6">
          <button
            className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-50 transition-colors self-start"
            onClick={() => navigate("/login")}
          >
            <span className="text-xl">X</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center px-4">
            Redefinir senha
          </h1>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center px-4 justify-self-start">
            Informe o email associado à sua conta para redefinir sua senha.
          </p>
          <TextInput
            titulo="Email"
            type="text"
            required={true}
            onChange={(value) => handleChange("email", value)}
          />
          <button
            className={`
            w-full py-4 rounded-xl text-white font-semibold mb-10 
            ${
              isValid
                ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700  dark:from-indigo-600 dark:to-zinc-600 dark:hover:from-indigo-950 dark:hover:to-zinc-950 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
            disabled={!isValid}
            onClick={() =>
              redefinirSenha(form.email)
                .then(() => {
                  showAlerta(
                    "Sucesso",
                    "Email de redefinição enviado! Verifique sua caixa de entrada.",
                    "sucesso",
                  );
                })
                .catch(() => {
                  showAlerta(
                    "Erro",
                    "Erro ao enviar email de redefinição. Verifique o email informado.",
                    "erro",
                  );
                })
            }
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelaEsqueciSenha;
