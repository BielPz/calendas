import { useState } from "react";
import Cabecalho from "../components/Cabecalho";
import TextInput from "../components/TextInput";
import { useNavigate } from "react-router-dom";

interface Props {
  cor_fundo: string;
}

function TelaEsqueciSenha({ cor_fundo }: Props) {
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

  return (
    <div
      className={`${cor_fundo} min-h-screen w-full flex flex-col items-center justify-start`}
    >
      <Cabecalho />
      <div className="min-w-[300px] relative flex flex-col items-center gap-6 justify-center py-10 px-10">
        <div className="max-w-md justify-center items-center bg-white p-6 rounded-lg shadow-md px-10 flex flex-col gap-6">
          <button
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors self-start"
            onClick={() => navigate("/login")}
          >
            <span className="text-xl">X</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center px-4">
            Redefinir senha
          </h1>
          <p className="text-lg font-medium text-gray-700 mb-4 text-center px-4 justify-self-start">
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
                ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
            disabled={!isValid}
            onClick={() => navigate("/reset-senha")}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelaEsqueciSenha;
