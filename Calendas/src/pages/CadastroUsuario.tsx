import { useState } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import Cabecalho from "../components/Cabecalho";
import CheckBox from "../components/CheckBox";


function CadastroUsuario() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    rSenha: "",
    genero: "",
    dtnasc: "",
  });

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

  return (
    <>
      <div>
        <Cabecalho /> 
      </div>
      <div className="justify-items-center">
        <div className="pb-4 bg-red-50 w-4/5">
            <div className="w-3/4">
                <Formulario>
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
                    <TextInput titulo="CEP" type="number" />
                    <TextInput titulo="Complemento" type="text" />
                    <TextInput titulo="Logradouro" type="text" />
                    <TextInput titulo="Número" type="number" />
                    <TextInput titulo="Bairro" type="text" />
                    <TextInput titulo="Cidade" type="text" />
                    <TextInput titulo="Estado" type="text" />
                </Formulario>
                <CheckBox message="Declaro que os dados acima são legítimos" onChange={(e) => setChecked(e.target.checked)} />
                <button
                className={`
                text-white font-medium
                transition-all duration-200
                px-3 py-1 rounded-lg
                w-1/3
                justify-self-center
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
      </div>
    </>
  );
}

export default CadastroUsuario;