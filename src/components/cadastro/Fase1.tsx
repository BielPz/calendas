import { useEffect, useState } from "react";
import Formulario from "../Formulario";
import TextInput from "../TextInput";
import type { Usuario } from "../../firebase/types";

interface Props {
  onValidate?: (valid: boolean) => void;
  onChange: (dados: Usuario) => void;
}

function Fase1({ onValidate, onChange }: Props) {
  const [form, setForm] = useState<Usuario>({
    nome: "",
    email: "",
    senha: "",
    rSenha: "",
    genero: "",
    dtnasc: "",
    tipo: "prestador"
  });

  const generos = [
    { label: "Masculino", value: "masculino" },
    { label: "Feminino", value: "feminino" },
    { label: "Não binário", value: "nao_binario" },
    { label: "Prefiro não informar", value: "nao_informar" },
    { label: "Outro", value: "outro" },
  ];

  const handleChange = (campo: string, value: string) => {
    const novoForm = { ...form, [campo]: value }
    onChange(novoForm)
    
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const isValid = Boolean(
    form.dtnasc &&
    form.email &&
    form.genero &&
    form.nome &&
    form.rSenha &&
    form.senha &&
    form.senha === form.rSenha,
  );

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid]);

  return (
    <>
      <Formulario>
        <TextInput
          titulo="Nome"
          type="text"
          onChange={(value) => handleChange("nome", value)}
          required
        />
        <TextInput
          titulo="E-mail"
          type="email"
          onChange={(value) => handleChange("email", value)}
          required
        />
        <TextInput
          titulo="Senha"
          type="password"
          onChange={(value) => handleChange("senha", value)}
          required
        />
        <TextInput
          titulo="Repetir a senha"
          type="password"
          onChange={(value) => handleChange("rSenha", value)}
          tipoValidacao="senha"
          validador={form.senha}
          required
        />
        <TextInput titulo="Telefone" type="tel" onChange={(value) => handleChange("telefone", value)} />
        <TextInput
          titulo="Gênero"
          type="select"
          options={generos}
          onChange={(value) => handleChange("genero", value)}
          required
        />
        <TextInput
          titulo="Data de nascimento"
          type="date"
          onChange={(value) => handleChange("dtnasc", value)}
          tipoValidacao="data"
          required
        />
      </Formulario>
    </>
  );
}

export default Fase1;
