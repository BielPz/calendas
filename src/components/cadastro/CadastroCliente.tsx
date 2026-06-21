import { useEffect, useMemo, useState } from "react";
import Formulario from "../Formulario";
import TextInput from "../TextInput";
import CheckBox from "../CheckBox";
import { useNavigate } from "react-router-dom";
import Estados from "../../hooks/Estados";
import Cidades from "../../hooks/Cidades";
import { registrarCliente } from "../../firebase/auth";
import type { Usuario, Cliente } from "../../firebase/types";
import { useAlerta } from "../../provider/AlertContext";
import ConsultarCEP from "../../hooks/ConsultarCEP";

function CadastroUsuario() {
  const [form, setForm] = useState<Usuario & Cliente>({
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
    tipo: "cliente",
  });

  const [checked, setChecked] = useState(false);
  const [checkCEP, setCheckCEP] = useState(false);

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
    checkCEP &&
    checked;

  const navigate = useNavigate();
  const { showAlerta } = useAlerta();

  const estados = Estados();
  const cidades = Cidades(String(form.estado));
  const CEPdados = useMemo(
    () => (form.cep?.length === 9 ? ConsultarCEP(form.cep) : null),
    [form.cep],
  );

  // Atualiza os campos de endereço quando o CEP é consultado
  useEffect(() => {
    if (!CEPdados) return;

    CEPdados.then((dados) => {
      if (!dados || dados.erro) {
        showAlerta(
          "Falha na consulta",
          "Não foi possível consultar o CEP. Verifique o número e tente novamente.",
          "erro",
        );
        setCheckCEP(false);
        return;
      }
      setForm((prev) => ({
        ...prev,
        logradouro: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        estado: dados.uf || "",
      }));
      setCheckCEP(true);
    });
  }, [CEPdados]);

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const handleConfirmar = async () => {
    if (!isValid) return;

    try {
      // console.log("Iniciando cadastro para:", form.email);
      await registrarCliente(form.email, form.senha, form);
      // console.log("Cadastro e gravação no banco concluídos!");
      showAlerta("Sucesso", "Cadastro realizado com sucesso!", "sucesso");
      navigate("/login");
    } catch (error) {
      // Verificamos se ele é um objeto que tem a propriedade message
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      showAlerta("Erro no cadastro", errorMessage, "erro");
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
          maxLength={35}
        />
        <TextInput
          titulo="E-mail"
          type="email"
          onChange={(value) => handleChange("email", value)}
          required
          maxLength={50}
        />
        <TextInput
          titulo="Senha"
          type="password"
          onChange={(value) => handleChange("senha", value)}
          required
          maxLength={100}
        />
        <TextInput
          titulo="Repetir a senha"
          type="password"
          onChange={(value) => handleChange("rSenha", value)}
          tipoValidacao="senha"
          validador={form.senha}
          required
          maxLength={100}
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
          tipoValidacao="data"
          required
        />
        <TextInput
          titulo="CEP"
          type="number"
          cep
          onChange={(value) => handleChange("cep", value)}
        />
        <TextInput
          titulo="Complemento"
          type="text"
          onChange={(value) => handleChange("complemento", value)}
        />
        <TextInput
          titulo="Logradouro"
          type="text"
          value={form.logradouro === undefined ? undefined : form.logradouro}
          onChange={(value) => handleChange("logradouro", value)}
          maxLength={50}
        />
        <TextInput
          titulo="Número"
          type="number"
          onChange={(value) => handleChange("numero", value)}
          maxLength={10}
        />
        <TextInput
          titulo="Bairro"
          type="text"
          value={form.bairro === undefined ? undefined : form.bairro}
          onChange={(value) => handleChange("bairro", value)}
          maxLength={50}
        />
        <TextInput
          titulo="Estado"
          type="select"
          options={estados}
          value={form.estado === undefined ? undefined : form.estado}
          onChange={(value) => handleChange("estado", value)}
        />
        <TextInput
          titulo="Cidade"
          type="select"
          options={cidades}
          value={form.cidade === undefined ? undefined : form.cidade}
          onChange={(value) => handleChange("cidade", value)}
        />
      </Formulario>
      <CheckBox
        message="Declaro que os dados acima são legítimos"
        onChange={(e) => setChecked(e.target.checked)}
      />
      <div>
        <button
          className={`
            w-full py-4 rounded-xl text-white font-semibold mb-3
            ${
              isValid
                ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          disabled={!isValid}
          onClick={handleConfirmar}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default CadastroUsuario;
