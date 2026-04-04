import { useState } from "react";
import { IMaskInput } from "react-imask";

interface Props {
  titulo: string;
  type?: "text" | "date" | "password" | "number" | "email" | "tel" | "file";
  required?: boolean;
  cep?: boolean;
  validador?: string;
  tipoValidacao?: "senha" | "padrão";
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function TextInput({
  titulo,
  type = "text",
  required,
  cep,
  validador,
  tipoValidacao,
  onChange,
}: Props) {
  const [erro, setErro] = useState<string | null>(null);

  const today = new Date();
  today.setFullYear(today.getFullYear() - 14);
  const dataMinima = today.toLocaleDateString("en-CA");

  const placeholders = {
    tel: "(xx) xxxxx-xxxx",
    email: "exemplo@email.com",
    password: "Digite sua senha",
    date: "dd/mm/aaaa",
    number: "0",
    text: "Digite seu " + titulo,
    file: "",
  };

  const placeholderDinamico = placeholders[type];

  const commonProps = {
    id: titulo.toLowerCase(),
    name: titulo.toLowerCase(),
    placeholder: placeholderDinamico,
    className:
      "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none no-spinner appearance-none",
    onChange,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (tipoValidacao === "senha") {
        setErro(validador !== value ? "As senhas não coincidem" : null);
      } else {
        setErro(!value && required ? "Você deve preencher esse campo" : null);
      }
    },
    required,
  };

  return (
    <div className="w-full">
      <p>
        {titulo}
        {required && <b className="text-red-400 font-semibold"> *</b>}
      </p>

      {type === "tel" ? (
        <IMaskInput
          mask="(00) 00000-0000"
          {...commonProps}
          onAccept={(value) => {
            // simula o onChange padrão
            onChange?.({
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
        />
      ) : cep ? (
        <IMaskInput
          mask="00000-000"
          {...commonProps}
          onAccept={(value) => {
            // simula o onChange padrão
            onChange?.({
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>);
          }}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
          max={type === "date" ? dataMinima : undefined}
          onWheel={
            type === "number" ? (e) => e.currentTarget.blur() : undefined
          }
        />
      )}

      <div className="min-h-[20px] transition-all duration-200">
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
      </div>
    </div>
  );
}

export default TextInput;
