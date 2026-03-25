import LoginCliente from "../components/LoginCliente"

function TelaLogin()
{
    return (
        
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-[45%]">
                <div className="flex items-center w-full my-6">
                    <div className="flex-grow border-t-1 border-gray-400"></div>
                    <span className="px-4 text-gray-500 font-medium">Fazer Login</span>
                    <div className="flex-grow border-t-1 border-gray-400"></div>
                </div>
                <hr className="border-t-1 border-gray-400 my-6" />
            </div>
            <LoginCliente />
        </div>
    )
}

export default TelaLogin