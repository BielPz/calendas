import { useState } from "react";
import TextInput from "../TextInput";

interface Props {
  onClick: () => void;
}

function EsqueciSenha2({ onClick }: Props) {
  const [form, setForm] = useState({ token: "" });
  // Validação simples: o token deve ser preenchido e ter um formato básico (ex: 6 dígitos) para simular um código de verificação
  const isValid = form.token.trim() !== "" && /^\d{6}$/.test(form.token);

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  return (
    <div className="w-full justify-center items-center bg-white p-6 rounded-lg shadow-md px-10 flex flex-col gap-6">
      <p className="text-lg font-medium text-gray-700 mb-4 text-center">
        Digite o token de verificação que enviamos para seu email
      </p>
      <TextInput
        titulo="Token de Verificação"
        type="text"
        required={true}
        onChange={(value) => handleChange("token", value)}
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
        onClick={onClick}
      >
        Continuar
      </button>
    </div>
  );
}

export default EsqueciSenha2;
