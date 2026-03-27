import TextInput from "./TextInput"

function LoginCliente()
{
    return (
        <div className="w-full flex flex-col gap-6">
            <div>
                <TextInput titulo='Email' type='text' required={true} />
            </div>

            <div>
                <TextInput titulo='Senha' type='text' required={true} />
            </div>
        </div>
    )
}

export default LoginCliente