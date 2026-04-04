import { useEffect, useState } from "react";
import Formulario from "../Formulario";
import Index from "./Index";
import TextInput from "../TextInput";
import UploadImagem from "../UploadImagem";
import Estados from "./Estados";
import Cidades from "./Cidades";

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

  const estados = Estados();
  const cidades = Cidades(String(form.estado));

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid]);

  return (
    <div className="w-full justify-items-center">
      <Formulario>
        <Index qntPages={3} itemOn="2" />
        <TextInput
          titulo="Nome da Empresa"
          type="text"
          onChange={(value) => handleChange("nome", value)}
          required
        />
        <UploadImagem label="Imagem da empresa" />
        <TextInput
          titulo="CNPJ"
          type="text"
          onChange={(value) => handleChange("cnpj", value)}
          required
        />
        <TextInput
          titulo="Telefone"
          type="tel"
          onChange={(value) => handleChange("telefone", value)}
          required
        />
        <TextInput titulo="E-mail" type="email" />
        <TextInput
          titulo="CEP"
          type="number"
          onChange={(value) => handleChange("cep", value)}
          required
          cep
        />
        <TextInput titulo="Complemento" type="text" />
        <TextInput
          titulo="Logradouro"
          type="text"
          onChange={(value) => handleChange("logradouro", value)}
          required
        />
        <TextInput
          titulo="Número"
          type="number"
          onChange={(value) => handleChange("numero", value)}
          required
        />
        <TextInput
          titulo="Bairro"
          type="text"
          onChange={(value) => handleChange("bairro", value)}
          required
        />
        <TextInput
          titulo="Estado"
          type="select"
          options={estados}
          onChange={(value) => handleChange("estado", value)}
          required
        />
        <TextInput
          titulo="Cidade"
          type="select"
          options={cidades}
          onChange={(value) => handleChange("cidade", value)}
          required
        />
      </Formulario>
    </div>
  );
}

export default Fase2;
