import TextInput from "../TextInput";
import CheckBox from "../CheckBox";

function CadastroCliente()
{
    return (
        <div>
            <div className="justify-items-center pb-3">
                <div className="w-full justify-items-center">
                    <TextInput
                        titulo="Nome"
                        type="text"
                        //onChange={(e) => handleChange("nome", e.target.value)}
                        required
                    />
                    <TextInput
                        titulo="E-mail"
                        type="email"
                        //onChange={(e) => handleChange("email", e.target.value)}
                        required
                    />
                    <TextInput
                        titulo="Senha"
                        type="password"
                        //onChange={(e) => handleChange("senha", e.target.value)}
                        required
                    />
                    <TextInput
                        titulo="Repetir a senha"
                        type="password"
                        //onChange={(e) => handleChange("rSenha", e.target.value)}
                        tipoValidacao="senha"
                        //validador={form.senha}
                        required
                    />
                    <TextInput titulo="Telefone" type="tel" />
                    <TextInput
                        titulo="Gênero"
                        type="text"
                        //onChange={(e) => handleChange("genero", e.target.value)}
                        required
                    />
                    <TextInput
                        titulo="Data de nascimento"
                        type="date"
                        //onChange={(e) => handleChange("dtnasc", e.target.value)}
                        required
                    />
                    <TextInput titulo="CEP" type="number" />
                    <TextInput titulo="Complemento" type="text" />
                    <TextInput titulo="Logradouro" type="text" />
                    <TextInput titulo="Número" type="number" />
                    <TextInput titulo="Bairro" type="text" />
                    <TextInput titulo="Cidade" type="text" />
                    <TextInput titulo="Estado" type="text" />
                    <CheckBox
                    message="Declaro que os dados acima são legítimos"
                    //onChange={(e) => setChecked(e.target.checked)}
                    />
                </div>
            </div>
        </div>
    );
}

export default CadastroCliente
