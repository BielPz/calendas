import { useEffect, useState } from "react";
import Formulario from "../Formulario";
import Index from "./Index";
import TextInput from "../TextInput";
import UploadImagem from "../UploadImagem";

interface Props {
  onValidate?: (valid: boolean) => void;
}

function Fase2({ onValidate }: Props) {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const isValid = Boolean(
    form.nome &&
    form.cnpj &&
    form.telefone &&
    form.cep &&
    form.logradouro &&
    form.numero &&
    form.bairro &&
    form.cidade &&
    form.estado,
  );

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid]);

  return (
    <div className="w-full justify-items-center">
      <Formulario titulo="Prestador">
        <Index qntPages={3} itemOn="2" />
        <TextInput
          titulo="Nome da Empresa"
          type="text"
          onChange={(e) => handleChange("nome", e.target.value)}
          required
        />
        <UploadImagem label="Imagem da empresa" />
        <TextInput
          titulo="CNPJ"
          type="text"
          onChange={(e) => handleChange("cnpj", e.target.value)}
          required
        />
        <TextInput
          titulo="Telefone"
          type="tel"
          onChange={(e) => handleChange("telefone", e.target.value)}
          required
        />
        <TextInput titulo="E-mail" type="email" />
        <TextInput
          titulo="CEP"
          type="number"
          onChange={(e) => handleChange("cep", e.target.value)}
          required
        />
        <TextInput titulo="Complemento" type="text" />
        <TextInput
          titulo="Logradouro"
          type="text"
          onChange={(e) => handleChange("logradouro", e.target.value)}
          required
        />
        <TextInput
          titulo="Número"
          type="number"
          onChange={(e) => handleChange("numero", e.target.value)}
          required
        />
        <TextInput
          titulo="Bairro"
          type="text"
          onChange={(e) => handleChange("bairro", e.target.value)}
          required
        />
        <TextInput
          titulo="Cidade"
          type="text"
          onChange={(e) => handleChange("cidade", e.target.value)}
          required
        />
        <TextInput
          titulo="Estado"
          type="text"
          onChange={(e) => handleChange("estado", e.target.value)}
          required
        />
      </Formulario>
    </div>
  );
}

export default Fase2;
