import { useState } from "react";
import { IMaskInput } from "react-imask";

type Option = {
  label: string;
  value: string;
};

interface Props {
  titulo: string;
  type?:
    | "text"
    | "date"
    | "password"
    | "number"
    | "email"
    | "tel"
    | "file"
    | "select";
  required?: boolean;
  cep?: boolean;
  cnpj?: boolean;
  validador?: string;
  tipoValidacao?: "senha" | "data" | "padrão";
  options?: Option[];
  onChange?: (value: string) => void;
}

function TextInput({
  titulo,
  type = "text",
  required,
  cep,
  cnpj,
  validador,
  tipoValidacao,
  options = [],
  onChange,
}: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const [valor, setValor] = useState("");

  const today = new Date();
  today.setFullYear(today.getFullYear() - 16);
  const dataMinima = today.toLocaleDateString("en-CA");
  const hoje = new Date().toLocaleDateString("en-CA");

  const placeholders = {
    tel: "(xx) xxxxx-xxxx",
    email: "exemplo@email.com",
    password: "Digite sua senha",
    date: "dd/mm/aaaa",
    number: "0",
    text: "Digite seu " + titulo,
    file: "",
    select: "Selecione...",
  };

  const placeholderDinamico = placeholders[type];

  function validar(value: string) {
    if (tipoValidacao === "senha") {
      return validador !== value ? "As senhas não coincidem." : null;
    }
    
    if (tipoValidacao === "data") 
    {
      return value > hoje || value > dataMinima ? "Data invalida!" : null;
    }

    if (required && !value) {
      return "Você deve preencher esse campo.";
    }

    return null;
  }

  function handleChange(value: string) {
    setValor(value);
    onChange?.(value);
  }

  const baseClass =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none";

  const commonProps = {
    id: titulo.toLowerCase(),
    name: titulo.toLowerCase(),
    placeholder: placeholderDinamico,
    className: `${baseClass} no-spinner appearance-none`,
    onBlur: () => {
      setErro(validar(valor));
    },
    required,
  };

  return (
    <div className="w-full">
      <p>
        {titulo}
        {required && <b className="text-red-400 font-semibold">*</b>}
      </p>

      {type === "select" ? (
        <select
          className={baseClass}
          value={valor}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setErro(validar(valor))}
        >
          <option value="" disabled>
            {placeholderDinamico}
          </option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "tel" ? (
        <IMaskInput
          mask="(00) 00000-0000"
          {...commonProps}
          onAccept={(value) => handleChange(value)}
        />
      ) : cep ? (
        <IMaskInput
          mask="00000-000"
          {...commonProps}
          onAccept={(value) => handleChange(value)}
        />
      ) : cnpj ? (
        <IMaskInput
          mask="00.000.000/0000-00"
          {...commonProps}
          onAccept={(value) => handleChange(value)}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
          value={valor}
          onChange={(e) => handleChange(e.target.value)}
          //min={type === "date" ? hoje : undefined}
          //max={type === "date" ? dataMinima : undefined}
          onWheel={
            type === "number"
              ? (e) => (e.currentTarget as HTMLInputElement).blur()
              : undefined
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
