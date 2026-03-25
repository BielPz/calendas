import { useState } from "react";

interface Props 
{
    titulo: string;
    type?: "text" | "date" | "password" | "number" | "email" | "tel";
    required?: boolean;
    validador?: string;
    tipoValidacao?: "senha" | "padrão";
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function TextInput({
    titulo,
    type = "text",
    required,
    validador,
    tipoValidacao,
    onChange,
}: Props) {

    const [erro, setErro] = useState<string | null>(null);

    const placeholders = {
        tel: "(xx) xxxxx-xxxx",
        email: "exemplo@email.com",
        password: "Digite sua senha",
        date: "dd/mm/aaaa",
        number: "0",
        text: "Digite seu " + titulo,
    };

    const placeholderDinamico = placeholders[type];

    return (
        <div className="w-full">
        <p className="text-gray-500 font-semibold text-xl">
            {titulo}
            {required ? <b className="text-red-400 font-semibold"> *</b> : null}
        </p>
        <input
            type={type}
            id={titulo.toLowerCase()}
            name={titulo.toLowerCase()}
            placeholder={placeholderDinamico}
            pattern={type === "tel" ? "\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}" : ""}
            className="p-1 rounded-xs outline-2 outline-gray-400 outline-black/100 w-full"
            onChange={onChange}
            onBlur={(e) => {
            const value = e.target.value;

            if (tipoValidacao === "senha") {
                setErro(validador !== value ? "As senhas não coincidem" : null);
            } else {
                setErro(
                !value && required ? "Você deve preencher esse campo" : null,
                );
            }
            }}
            required={required}
        />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        </div>
    );
}

export default TextInput;

