import {    useState } from "react"
import LoginCliente from "../components/LoginCliente"
import LoginPrestador from "../components/LoginPrestador"

function TelaLogin()
{
    const [tipo, setTipo] = useState("cliente")

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-[45%]">
                <div className="flex items-center w-full my-6">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="px-4 text-gray-500 font-medium">Fazer Login</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>
                <div className="flex items-center justify-center w-full gap-4">
                    <button
                        onClick={() => setTipo("cliente")}
                        className="flex-1 px-7 py-5 border border-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition"
                    >
                        Cliente
                    </button>

                    <button
                        onClick={() => setTipo("prestador")}
                        className="flex-1 px-7 py-5 border border-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition"
                    >
                        Prestador
                    </button>
                </div>
                <hr className="border-t border-gray-400 my-6" />
            </div>
            <div className="w-[45%] relative min-h-75">
                <div className={`w-full bg-amber-50 ${tipo === "cliente" ? "block" : "hidden"}`}>
                    <LoginCliente />
                </div>

                <div className={`w-full ${tipo === "prestador" ? "block" : "hidden"}`}>
                    <LoginPrestador />
                </div>
            </div>
        </div>
    )
}

export default TelaLogin