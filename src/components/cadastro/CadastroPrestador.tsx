import { useState } from "react";
import Fase1 from "./Fase1";
import Fase2 from "./Fase2";
import Fase3 from "./Fase3";
import CheckBox from "../CheckBox";
import { useNavigate } from "react-router-dom";
import { registrarEmpresa, registrarPrestador } from "../../firebase/auth";
import type { Usuario, Empresa } from "../../firebase/types";
import Index from "./Index";

function CadastroUsuario() {
  const [isFormValid, setIsFormValid] = useState([false, false, false]); // 3 fases
  const [checked, setChecked] = useState(false);
  const [fase, setFase] = useState(1);
  const navigate = useNavigate();

  const [dadosPrestador, setDadosPrestador] = useState<Usuario>({
    nome: "",
    email: "",
    senha: "",
    rSenha: "",
    genero: "",
    dtnasc: "",
    tipo: "prestador",
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
    estado: "",
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
      const user = await registrarPrestador(
        dadosPrestador.email,
        dadosPrestador.senha,
        dadosPrestador,
      );
      await registrarEmpresa(user.uid, dadosEmpresa);
      navigate("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      alert("Erro: " + errorMessage);
    }
  };

  const handleClick = (novaFase: number) => {
    if (novaFase < fase) setFase(novaFase);
  };

  // validar cada fase individualmente e atualizar o estado de isFormValid para cada fase
  const handleValidate = (faseIndex: number, valid: boolean) => {
    setIsFormValid((prev) => {
      const novo = [...prev];
      novo[faseIndex] = valid;
      return novo;
    });
  };

  // verificar se a fase atual é válida para habilitar o botão de avançar
  const podeAvancar = isFormValid[fase - 1];

  return (
    <div className="w-full flex flex-col gap-3">
      <Index qntPages={3} itemOn={fase} onClick={(i) => handleClick(i)} />
      <div>
        <div className={`w-full ${fase === 1 ? "block" : "hidden"}`}>
          <Fase1
            onValidate={(valid) => handleValidate(0, valid)}
            onChange={receberFase1}
          />
        </div>
        <div className={`w-full ${fase === 2 ? "block" : "hidden"}`}>
          <Fase2
            onValidate={(valid) => handleValidate(1, valid)}
            onChange={receberFase2}
          />
        </div>
        <div className={`w-full ${fase === 3 ? "block" : "hidden"}`}>
          <Fase3 onValidate={(valid) => handleValidate(2, valid)} />
        </div>

        <CheckBox
          message="Declaro que os dados acima são legítimos"
          onChange={(e) => setChecked(e.target.checked)}
        />
      </div>
      <button
        className={`
          w-full py-4 rounded-xl text-white font-semibold mb-10
          ${
            isFormValid[fase - 1] && checked
              ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }
        `}
        disabled={!(isFormValid[fase - 1] && checked)}
        onClick={() => {
          if (fase < 3 && podeAvancar) {
            setFase(fase + 1);
          } else {
            handleConfirmar();
          }
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

export default CadastroUsuario;
