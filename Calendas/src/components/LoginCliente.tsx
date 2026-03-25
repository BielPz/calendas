import TextInput from "./TextInput"

function LoginCliente()
{
    return (
        <div className="w-[45%] flex flex-col gap-6 p-3">
            <TextInput titulo='email' type='text' required={true} />
            <TextInput titulo='senha' type='password' required={true} />
        </div>
    )
}

export default LoginCliente