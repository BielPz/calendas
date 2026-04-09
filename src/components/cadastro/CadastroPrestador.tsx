import { useState } from "react";
import Fase1 from "./Fase1";
import Fase2 from "./Fase2";
import Fase3 from "./Fase3";
import CheckBox from "../CheckBox";
import { useNavigate } from "react-router-dom";

function CadastroUsuario() {
  const [isFormValid, setIsFormValid] = useState(false);
  const [checked, setChecked] = useState(false);
  const [fase, setFase] = useState(1);
  const navigate = useNavigate();

  interface prestador
  {
    nome: string,
    email: string,
    tel: string,
    genero: string,
    dtnasc: string
  }

  interface empresa
  {
    nome: string,
    cnpj: string,
    tel: string,
    email: string,
    cep: string,
    logradouro: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    estado: string,
  }

  const [dadosPrestador, setDadosPrestador] = useState<prestador>()

  const [dadosEmpresa, setDadosEmpresa] = useState<empresa>()

  const receberFase1 = (dadosPrestador: prestador) => {
    setDadosPrestador(dadosPrestador);
  };

  const receberFase2 = (dadosEmpresa: empresa) => {
    setDadosEmpresa(dadosEmpresa);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div>
        <div className={`w-full ${fase === 1 ? "block" : "hidden"}`}>
          <Fase1 onValidate={setIsFormValid} onChange={receberFase1} />
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
          w-full py-4 rounded-xl text-white font-semibold
          bg-linear-to-br from-orange-400 to-purple-400 cursor-pointer mb-10
          ${isFormValid && checked
              ? "bg-linear-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"}
          `}
        disabled={!(isFormValid && checked)}
        onClick={() => {
          if (fase < 3) 
          {
            setFase(fase + 1);
            setIsFormValid(false);
          } 
          else 
          {
            navigate("/feed");
          }
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

export default CadastroUsuario;
