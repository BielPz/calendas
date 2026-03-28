import TextInput from "./TextInput"

function LoginPrestador()
{
    return(
        <div className="w-full flex flex-col gap-3">
            <div>
                <TextInput titulo='Email' type='text' required={true} />
            </div>

            <div>
                <TextInput titulo='Senha' type='text' required={true} />
            </div>

            <div>
                <TextInput titulo='Token' type='text' required={true} />
            </div>
        </div>
    )
}

export default LoginPrestador