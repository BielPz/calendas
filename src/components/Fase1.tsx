import { useEffect, useState } from "react";
import CheckBox from "./CheckBox";
import Formulario from "./Formulario";
import Index from "./Index";
import TextInput from "./TextInput";

interface Props {
  onValidate?: (valid: boolean) => void;
}

function Fase1({ onValidate }: Props) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    rSenha: "",
    genero: "",
    dtnasc: "",
  });

  const handleChange = (campo: string, value: string) => {
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
    <div className="w-full justify-items-center">
      <Formulario titulo="Prestador">
        <Index qntPages={3} itemOn="1" />
        <TextInput
          titulo="Nome"
          type="text"
          onChange={(e) => handleChange("nome", e.target.value)}
          required
        />
        <TextInput
          titulo="E-mail"
          type="email"
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
        <TextInput
          titulo="Senha"
          type="password"
          onChange={(e) => handleChange("senha", e.target.value)}
          required
        />
        <TextInput
          titulo="Repetir a senha"
          type="password"
          onChange={(e) => handleChange("rSenha", e.target.value)}
          tipoValidacao="senha"
          validador={form.senha}
          required
        />
        <TextInput titulo="Telefone" type="tel" />
        <TextInput
          titulo="Gênero"
          type="text"
          onChange={(e) => handleChange("genero", e.target.value)}
          required
        />
        <TextInput
          titulo="Data de nascimento"
          type="date"
          onChange={(e) => handleChange("dtnasc", e.target.value)}
          required
        />
      </Formulario>
    </div>
  );
}

export default Fase1;
