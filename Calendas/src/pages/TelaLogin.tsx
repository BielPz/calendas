import {    useState } from "react"
import LoginCliente from "../components/LoginCliente"
import LoginPrestador from "../components/LoginPrestador"
import Logo from "../images/logo.png";

function TelaLogin()
{
    const [tipo, setTipo] = useState("cliente")

    return (
        <div className="flex flex-col items-center justify-start min-h-screen">
            <div>
                <img
                    src={Logo}
                    alt="logo"
                    className="w-80 object-contain cursor-pointer"
                    onClick={() => window.location.href = "/"}
                />
            </div>
            <div className="w-[45%] min-w-[300px] flex flex-col gap-2">
                <div className="flex items-center w-full my-2">
                    <div className="flex-grow border-t border-gray-400"></div>
                        <span className="px-4 text-gray-500 font-medium">Fazer Login</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </div>

                <div className="flex items-center justify-center w-full gap-4">
                <button
                    onClick={() => setTipo("cliente")}
                    className={`flex-1 px-7 py-5 border border-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition 
                    ${tipo === "cliente" ? "bg-gray-300" : ""}`}
                >
                    Cliente
                </button>

                <button
                    onClick={() => setTipo("prestador")}
                    className={`flex-1 px-7 py-5 border border-gray-200 rounded-xl hover:bg-gray-300 cursor-pointer transition 
                    ${tipo === "prestador" ? "bg-gray-300" : ""}`}
                >
                    Prestador
                </button>
                </div>

                <hr className="border-t border-gray-400 my-2" />
            </div>

            <div className="w-[45%] min-w-[300px] relative">
                <div className={`w-full ${tipo === "cliente" ? "block" : "hidden"}`}>
                <LoginCliente />
                </div>

                <div className={`w-full ${tipo === "prestador" ? "block" : "hidden"}`}>
                <LoginPrestador />
                </div>
            </div>

            <div className="w-[45%] min-w-[300px]">
                <button className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-br from-orange-400 to-purple-400 
                cursor-pointer">
                Continuar
                </button>
            </div>
            </div>
    )
}

export default TelaLogin