import CheckBox from "../CheckBox"
import TextInput from "../TextInput"

function Fase1()
{
    return (
        <div className="justify-items-center pb-2">
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
                    //={(e) => handleChange("genero", e.target.value)}
                    required
                />
                <TextInput
                    titulo="Data de nascimento"
                    type="date"
                    //onChange={(e) => handleChange("dtnasc", e.target.value)}
                    required
                />
                <CheckBox
                message="Declaro que os dados acima são legítimos"
                //onChange={(e) => setChecked(e.target.checked)}
                />
            </div>
        </div>
    )
}

export default Fase1