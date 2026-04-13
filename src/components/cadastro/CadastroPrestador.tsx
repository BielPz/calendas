import { useState } from "react";
import Fase1 from "./Fase1";
import Fase2 from "./Fase2";
import Fase3 from "./Fase3";
import CheckBox from "../CheckBox";
import { useNavigate } from "react-router-dom";
import { registrarEmpresa, registrarPrestador } from "../../firebase/auth";
import type { Usuario, Empresa } from "../../firebase/types";

function CadastroUsuario() {
  const [isFormValid, setIsFormValid] = useState(false);
  const [checked, setChecked] = useState(false);
  const [fase, setFase] = useState(1);
  const navigate = useNavigate();

  const [dadosPrestador, setDadosPrestador] = useState<Usuario>({
    nome: "",
    email: "", 
    senha: "", 
    rSenha: "", 
    genero: "", 
    dtnasc: ""
  });

  const [dadosEmpresa, setDadosEmpresa] = useState<Empresa>({
    nome: "", 
    cnpj: "", 
    tel: "", 
    email: "",
    cep: "", 
    logradouro: "", 
    numero: "",
    complemento: "", 
    bairro: "", 
    cidade: "", 
    estado: ""
  });

  const receberFase1 = (dados: Usuario) => {
    setDadosPrestador(dados);
  };

  const receberFase2 = (dados: Empresa) => {
    setDadosEmpresa(dados);
  };

  const handleConfirmar = async () => {
    if (!dadosPrestador || !dadosEmpresa) return;

    try {
      const user = await registrarPrestador(dadosPrestador.email, dadosPrestador.senha, dadosPrestador);
      await registrarEmpresa(user.uid, dadosEmpresa);
      navigate("/feed");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro: " + errorMessage);
    }
  };
  

  return (
    <div className="w-full flex flex-col gap-3">
      <div>
        <div className={`w-full ${fase === 1 ? "block" : "hidden"}`}>
          <Fase1 onValidate={setIsFormValid} onChange={receberFase1} />
        </div>
        <div className={`w-full ${fase === 2 ? "block" : "hidden"}`}>
          <Fase2 onValidate={setIsFormValid} onChange={receberFase2} />
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
        //disabled={!(isFormValid && checked)}
        onClick={() => {
          if (fase < 3) 
          {
            setFase(fase + 1);
            setIsFormValid(false);
          } 
          else 
          {
            handleConfirmar()
          }
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

export default CadastroUsuario;
