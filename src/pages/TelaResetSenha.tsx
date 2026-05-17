import { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho";
import TextInput from "../components/TextInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import Formulario from "../components/Formulario";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAlerta } from "../provider/AlertContext";
import { useGradiente } from "../hooks/useGradiente";

function TelaResetSenha() {
  const [form, setForm] = useState({ novaSenha: "", confirmarSenha: "" });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cor_fundo = useGradiente();
  const { showAlerta } = useAlerta();

  const [codigoValido, setCodigoValido] = useState(false);
  const [erro, setErro] = useState("");

  // O código de redefinição é passado como um parâmetro na URL (ex: /reset-senha?oobCode=abc123)
  const oobCode = searchParams.get("oobCode");

  // Validação simples: as senhas devem ser preenchidas e iguais
  const isValid =
    form.novaSenha.trim() !== "" &&
    form.confirmarSenha.trim() !== "" &&
    form.novaSenha === form.confirmarSenha;

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  // Verifica o código de redefinição ao carregar a página para garantir que o link é válido
  useEffect(() => {
    if (!oobCode) return; // Se não houver código, não é possível redefinir a senha, então não faz nada

    // Verifica o código de redefinição usando a função do Firebase e atualiza o estado com base no resultado
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setCodigoValido(true)) // Código válido, permite que o usuário redefina a senha
      .catch(() => {
        setErro("Link inválido ou expirado");
        showAlerta("Erro", "Link inválido ou expirado", "erro");
      }); // Código inválido ou expirado, exibe uma mensagem de erro
  }, [oobCode]); // Verifica o código de redefinição quando o componente é montado e quando o oobCode muda

  // Função para lidar com a redefinição da senha quando o usuário clica no botão "Continuar"
  const handleReset = async () => {
    try {
      // Tenta confirmar a redefinição da senha usando o código e a nova senha fornecida pelo usuário
      await confirmPasswordReset(auth, oobCode!, form.novaSenha);
      showAlerta("Sucesso", "Senha redefinida com sucesso!"); // Exibe um alerta global de sucesso usando o contexto de alerta
      navigate("/login"); // Redireciona o usuário para a tela de login após redefinir a senha
    } catch (e) {
      setErro("Erro ao redefinir senha"); // Se ocorrer um erro durante a redefinição da senha, exibe uma mensagem de erro para o usuário
      showAlerta(
        "Erro",
        "Não foi possível redefinir a senha. Tente novamente.",
        "erro",
      ); // Exibe um alerta global de erro usando o contexto de alerta para informar o usuário sobre o problema
    }
  };

  return (
    <div
      className={`${cor_fundo} min-h-screen w-full flex flex-col items-center`}
    >
      <Cabecalho />

      <div className="flex flex-1 items-center justify-center w-full px-4">
        <div className="min-w-[300px] w-full max-w-md bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
          <button
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors self-start"
            onClick={() => navigate("/login")}
          >
            <span className="text-xl">X</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Redefinir senha
          </h1>
          {codigoValido && (
            <Formulario>
              <TextInput
                titulo="Nova senha"
                type="password"
                required
                onChange={(value) => handleChange("novaSenha", value)}
              />
              <TextInput
                titulo="Confirmar nova senha"
                type="password"
                required
                onChange={(value) => handleChange("confirmarSenha", value)}
              />
            </Formulario>
          )}
          {erro && <p className="text-red-500 text-center">{erro}</p>}
          <button
            className={`
          w-full py-4 rounded-xl text-white font-semibold
          ${
            isValid
              ? "bg-gradient-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }
        `}
            disabled={!isValid}
            onClick={handleReset}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TelaResetSenha;
