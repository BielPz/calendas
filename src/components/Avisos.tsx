
interface Props{
    type: 
    | "sucesso"
    | "erro"
    | "desconect"
    | "aviso"
    | "info";
    titulo: string;
    label: string;
}

// Não está funcional
function Avisos({type,titulo,label}: Props) {
    return(
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-[320px]">
        {/* Informativo (círculo em cima) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gray-300 border-8 border-gray-100 z-10" />

        {/* Card */}
        <div className="bg-gray-300 rounded-3xl p-6 pt-16 shadow-inner flex flex-col items-center text-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {titulo}
          </h1>
          <p className="text-gray-700 text-sm leading-relaxed px-2">
            {label}
          </p>

          <button
            onClick={()=> {}}
            className="mt-4 w-3/4 py-3 rounded-full bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
    );
}

export default Avisos;