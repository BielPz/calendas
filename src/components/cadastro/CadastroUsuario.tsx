import { useState } from "react";
import Formulario from "../Formulario";
import TextInput from "../TextInput";
import CheckBox from "../CheckBox";
import { useNavigate } from "react-router-dom";
import Estados from "./Estados";
import Cidades from "./Cidades";

function CadastroUsuario() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    rSenha: "",
    genero: "",
    dtnasc: "",
    estado: "",
  });

  const generos = [
    { label: "Masculino", value: "masculino" },
    { label: "Feminino", value: "feminino" },
    { label: "Não binário", value: "nao_binario" },
    { label: "Prefiro não informar", value: "nao_informar" },
    { label: "Outro", value: "outro" },
  ];

  const [checked, setChecked] = useState(false);

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const isValid =
    form.dtnasc &&
    form.email &&
    form.genero &&
    form.nome &&
    form.rSenha &&
    form.senha &&
    form.senha === form.rSenha &&
    checked;

  const navigate = useNavigate();

  const estados = Estados();
  const cidades = Cidades(String(form.estado));

  return (
    <div className="w-full flex flex-col gap-3 justify-items-center">
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
        <TextInput titulo="Telefone" type="tel" />
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
          required
        />
        <TextInput titulo="CEP" type="number" cep />
        <TextInput titulo="Complemento" type="text" />
        <TextInput titulo="Logradouro" type="text" />
        <TextInput titulo="Número" type="number" />
        <TextInput titulo="Bairro" type="text" />
        <TextInput
          titulo="Estado"
          type="select"
          options={estados}
          onChange={(value) => handleChange("estado", value)}
        />
        <TextInput titulo="Cidade" type="select" options={cidades} />
      </Formulario>
      <CheckBox
        message="Declaro que os dados acima são legítimos"
        onChange={(e) => setChecked(e.target.checked)}
      />
      <div>
        <button
          className={`
            w-full py-4 rounded-xl 
            text-white 
            font-semibold 
            bg-gradient-to-br 
            from-orange-400 
            to-purple-400 
            cursor-pointer mb-10
          ${
            isValid
              ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }
          `}
          disabled={!isValid}
          onClick={() => {
            navigate("/feed");
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default CadastroUsuario;
