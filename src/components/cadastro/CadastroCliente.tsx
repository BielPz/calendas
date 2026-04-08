import { useState } from "react";
import Formulario from "../Formulario";
import TextInput from "../TextInput";
import CheckBox from "../CheckBox";
import { useNavigate } from "react-router-dom";
import Estados from "./Estados";
import Cidades from "./Cidades";
import { registrarCliente } from "../../firebase/auth";

function CadastroUsuario() {
  const [form, setForm] = useState({
    // Credenciais
    email: "",
    senha: "",
    rSenha: "",

    // Dados pessoais
    nome: "",
    genero: "",
    dtnasc: "",
    telefone: "",

    // Endereço
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [checked, setChecked] = useState(false);

  const generos = [
    { label: "Masculino", value: "masculino" },
    { label: "Feminino", value: "feminino" },
    { label: "Não binário", value: "nao_binario" },
    { label: "Prefiro não informar", value: "nao_informar" },
    { label: "Outro", value: "outro" },
  ];

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

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const handleConfirmar = async () => {
    if (!isValid) return;

    const dadosParaSalvar = {
      nome: form.nome,
      email: form.email,
      genero: form.genero,
      dtnasc: form.dtnasc,
      telefone: form.telefone,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
    };

    try 
    {
      console.log("Iniciando cadastro para:", form.email);
      await registrarCliente(form.email, form.senha, dadosParaSalvar);
      console.log("Cadastro e gravação no banco concluídos!");
      navigate("/feed");
    } 
    catch (error) 
    { 
      // Verificamos se ele é um objeto que tem a propriedade message
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro: " + errorMessage);
    }
  };


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
        <TextInput
          titulo="Telefone"
          type="tel"
          onChange={(value) => handleChange("telefone", value)}
        />
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
        <TextInput titulo="CEP" type="number" cep onChange={(value) => handleChange("cep", value)} />
        <TextInput titulo="Complemento" type="text" onChange={(value) => handleChange("complemento", value)} />
        <TextInput titulo="Logradouro" type="text" onChange={(value) => handleChange("logradouro", value)} />
        <TextInput titulo="Número" type="number" onChange={(value) => handleChange("numero", value)} />
        <TextInput titulo="Bairro" type="text" onChange={(value) => handleChange("bairro", value)} />
        <TextInput titulo="Cidade" type="select" options={cidades} onChange={(value) => handleChange("cidade", value)}/>
        <TextInput titulo="Estado" type="select" options={estados} onChange={(value) => handleChange("estado", value)}/>
      </Formulario>
      <CheckBox
        message="Declaro que os dados acima são legítimos"
        onChange={(e) => setChecked(e.target.checked)}
      />
      <div>
        <button
          className={`
            w-full py-4 rounded-xl text-white font-semibold mb-10
            ${isValid
              ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          disabled={!isValid}
          onClick={handleConfirmar} // <-- Mude de navigate para handleConfirmar
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default CadastroUsuario;
