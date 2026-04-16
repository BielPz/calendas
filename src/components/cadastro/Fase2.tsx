import { useEffect, useState } from "react";
import Formulario from "../Formulario";
import Index from "./Index";
import TextInput from "../TextInput";
import UploadImagem from "../UploadImagem";
import Estados from "../../hooks/Estados";
import Cidades from "../../hooks/Cidades";
import type { Empresa } from "../../firebase/types";

interface Props {
  onValidate?: (valid: boolean) => void;
  onChange: (dados: Empresa) => void;
}

function Fase2({ onValidate, onChange }: Props) {
  const [form, setForm] = useState<Empresa>({
    nome: "",
    cnpj: "",
    tel: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const handleChange = (campo: string, value: string) => {
    const novoForm = { ...form, [campo]: value }
    onChange(novoForm)

    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const isValid = Boolean(
    form.nome &&
    form.cnpj &&
    form.tel &&
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
    <>
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
          cnpj
          required
        />
        <TextInput
          titulo="Telefone"
          type="tel"
          onChange={(value) => handleChange("tel", value)}
          required
        />
        <TextInput titulo="E-mail" type="email" onChange={(value) => handleChange("email", value)} />
        <TextInput
          titulo="CEP"
          type="number"
          onChange={(value) => handleChange("cep", value)}
          required
          cep
        />
        <TextInput titulo="Complemento" type="text" onChange={(value) => handleChange("complemento", value)} />
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
    </>
  );
}

export default Fase2;
