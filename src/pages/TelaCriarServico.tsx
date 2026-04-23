import { useState } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import type { Servico } from "../firebase/types";
import CabecalhoBranco from "../components/CabecalhoBranco";

function TelaCriarServico() {
  const [form, setForm] = useState<Servico>({
    cnpj: "",
    nome: "",
    preco: 0,
    incio: "",
    fim: "",
    duracao: ""
  });

  const handleChange = (campo: string, value: string) => {
    //const novoForm = { ...form, [campo]: value }
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const isValid = Boolean(form.cnpj && form.nome && form.preco && form.incio && form.fim && form.duracao);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
        <CabecalhoBranco titulo="Cadastre seu Serviço"/>
      <div className="w-[45%] min-w-[300px] relative flex flex-col gap-3 justify-items-center">
        
        <Formulario>
          <TextInput
            titulo="CNPJ"
            type="text"
            onChange={(value) => handleChange("cnpj", value)}
            cnpj
            required
          />
          <TextInput
            titulo="Nome"
            type="text"
            onChange={(value) => handleChange("nome", value)}
            required
          />
          <TextInput
            titulo="Descricao"
            type="text"
            onChange={(value) => handleChange("descricao", value)}
            required
          />
          <TextInput
            titulo="Preço"
            type="text"
            onChange={(value) => handleChange("preco", value)}
            required
          />
          <div className="flex gap-3">
            <TextInput
            titulo="Inicio"
            type="text"
            onChange={(value) => handleChange("inicio", value)}
            required
            />
            <TextInput
                titulo="Fim"
                type="text"
                onChange={(value) => handleChange("fim", value)}
                required
            />
          </div>
          <TextInput
            titulo="Duração"
            type="text"
            onChange={(value) => handleChange("duracao", value)}
            required
          />
        </Formulario>
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
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default TelaCriarServico;
