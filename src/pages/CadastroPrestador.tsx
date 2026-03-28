import { useState } from "react";
import Fase1 from "../components/Fase1";
import Fase2 from "../components/Fase2";
import Fase3 from "../components/Fase3";
import CheckBox from "../components/CheckBox";
import { useNavigate } from "react-router";

function CadastroUsuario() {
  const [isFormValid, setIsFormValid] = useState(false);
  const [checked, setChecked] = useState(false);
  const [fase, setFase] = useState(1);
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50">
      <div className="justify-items-center pt-5 pb-15">
        <div className="pb-4 w-4/5 justify-items-center rounded-3xl shadow-xl/30 bg-white">
          <div className="w-full justify-items-center">
            <div className={`w-full ${fase === 1 ? "block" : "hidden"}`}>
              <Fase1 onValidate={setIsFormValid} />
            </div>
            <div className={`w-full ${fase === 2 ? "block" : "hidden"}`}>
              <Fase2 onValidate={setIsFormValid} />
            </div>
            <div className={`w-full ${fase === 3 ? "block" : "hidden"}`}>
              <Fase3 onValidate={setIsFormValid} />
            </div>

            <CheckBox
              message="Declaro que os dados acima são legítimos"
              onChange={(e) => setChecked(e.target.checked)}
            />
          </div>
          <button
            className={`
          w-2/3 mt-5
          text-white font-medium
          transition-all duration-200
          px-3 py-1 rounded-lg
          mx-auto block
          ${
            isFormValid && checked
              ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }
          `}
            disabled={!(isFormValid && checked)}
            onClick={() => {
              if (fase < 3) {
                setFase(fase + 1);
                setIsFormValid(false);
              } else {
                navigate("/feed");
              }
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CadastroUsuario;
