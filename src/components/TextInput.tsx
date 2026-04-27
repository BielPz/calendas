import { useState } from "react";
import { IMaskInput } from "react-imask";

type Option = {
  label: string;
  value: string;
};

interface Props {
  titulo: string;
  value?: string;
  disabled?: boolean;
  type?:
    | "text"
    | "date"
    | "time"
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
  value,
  disabled,
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
  const [valorInterno, setValorInterno] = useState("");

  // 👇 controlado ou não
  const valor = value !== undefined ? value : valorInterno;

  const today = new Date();
  today.setFullYear(today.getFullYear() - 16);
  const dataMinima = today.toLocaleDateString("en-CA");
  const hoje = new Date().toLocaleDateString("en-CA");

  const placeholders = {
    tel: "(xx) xxxxx-xxxx",
    email: "exemplo@email.com",
    password: "Digite sua senha",
    date: "dd/mm/aaaa",
    time: "00:00",
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

    if (tipoValidacao === "data") {
      return value > hoje || value > dataMinima ? "Data invalida!" : null;
    }

    if (required && !value) {
      return "Você deve preencher esse campo.";
    }

    return null;
  }

  function handleChange(v: string) {
    if (value === undefined) {
      setValorInterno(v); // 👈 só atualiza interno se não for controlado
    }
    onChange?.(v);
  }

  const baseClass =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none disabled:bg-gray-100";

  const commonProps = {
    id: titulo.toLowerCase(),
    name: titulo.toLowerCase(),
    placeholder: placeholderDinamico,
    className: `${baseClass} no-spinner appearance-none`,
    onBlur: () => setErro(validar(valor)),
    required,
    disabled,
  };

  return (
    <div className="w-full">
      <p>
        {titulo}
        {required && <b className="text-red-400 font-semibold">*</b>}
      </p>

      {type === "select" ? (
        <select
          {...commonProps}
          value={valor}
          onChange={(e) => handleChange(e.target.value)}
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
          value={valor}
          onAccept={(v) => handleChange(String(v))}
        />
      ) : cep ? (
        <IMaskInput
          mask="00000-000"
          {...commonProps}
          value={valor}
          onAccept={(v) => handleChange(String(v))}
        />
      ) : cnpj ? (
        <IMaskInput
          mask="00.000.000/0000-00"
          {...commonProps}
          value={valor}
          onAccept={(v) => handleChange(String(v))}
        />
      ) : type === "time" ? (
        <IMaskInput
          mask="00:00"
          {...commonProps}
          value={valor}
          onAccept={(v) => handleChange(String(v))}
          onBlur={() => {
            const horaValida = /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
            setErro(!horaValida ? "Hora inválida." : validar(valor));
          }}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
          value={valor}
          onChange={(e) => handleChange(e.target.value)}
          onWheel={
            type === "number"
              ? (e) => (e.currentTarget as HTMLInputElement).blur()
              : undefined
          }
        />
      )}

      <div className="min-h-5 transition-all duration-200">
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
      </div>
    </div>
  );
}

export default TextInput;