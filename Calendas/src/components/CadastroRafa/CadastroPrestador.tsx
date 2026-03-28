import { useState } from "react";
import Fase1 from "../Fase1";
import Fase2 from "../Fase2";
import Fase3 from "../Fase3";

function CadastroUsuario() {
  const [fase, setFase] = useState(1);

  return (
    <div>
      <div className="flex justify-between items-center w-full">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => setFase(num)}
            className={`w-20 h-20 rounded-full border flex items-center justify-center font-medium cursor-pointer text-2xl transition
                    ${
                      fase === num
                        ? "bg-gradient-to-br from-orange-400 to-purple-400 text-white"
                        : "border-gray-400 text-gray-600 hover:bg-gray-200"
                    }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="justify-items-center">
        <div className={`w-full ${fase === 1 ? "block" : "hidden"}`}>
          <Fase1 />
        </div>
        <div className={`w-full ${fase === 2 ? "block" : "hidden"}`}>
          <Fase2 />
        </div>
        <div className={`w-full ${fase === 3 ? "block" : "hidden"}`}>
          <Fase3 />
        </div>
      </div>
    </div>
  );
}

export default CadastroUsuario;
