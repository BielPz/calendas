import { useEffect, useState } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import type { Servico } from "../firebase/types";
import CabecalhoBranco from "../components/CabecalhoBranco";
import { criarServico, getEmpresaPorId } from "../firebase/database";
import { useLocation, useNavigate } from "react-router";
import UploadImagem from "../components/UploadImagem";
import { useAlerta } from "../provider/AlertContext";

function TelaCriarServico() {
  const location = useLocation();
  const idEmpresa = location.state?.idEmpresa; // O ID que passamos no navigate
  const [form, setForm] = useState<Servico>({
    cnpj: "",
    nome: "",
    banner: "",
    descricao: "",
    preco: 0,
    inicio: "",
    fim: "",
    duracao: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (idEmpresa) {
      // Busca os dados da empresa para pegar o CNPJ
      getEmpresaPorId(idEmpresa).then((dados) => {
        if (dados && dados.cnpj) {
          setForm((prev) => ({
            ...prev,
            cnpj: dados.cnpj, // Preenche o CNPJ automaticamente no estado
          }));
        }
      });
    }
  }, [idEmpresa]);

  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: campo === "preco" ? Number(value) : value,
    }));
  };

  const isValid = Boolean(
    form.cnpj &&
    form.nome &&
    form.preco &&
    form.inicio &&
    form.fim &&
    form.duracao,
  );

  const navigate = useNavigate();
  const { showAlerta } = useAlerta();

  const handleConfirmar = async () => {
    if (!isValid || !idEmpresa) return;
    try {
      await criarServico(form, idEmpresa);
      showAlerta("Sucesso", "Serviço criado com sucesso!", "sucesso");
      navigate("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
      showAlerta("Erro", errorMessage, "erro");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CabecalhoBranco titulo="Cadastre seu Serviço" />
      <div className="w-[45%] min-w-75 relative flex flex-col gap-3 justify-items-center">
        <Formulario>
          <TextInput
            titulo="CNPJ da Empresa"
            type="text"
            value={form.cnpj} // Vincula o valor ao estado preenchido
            onChange={() => {}} // Bloqueia edição manual se desejar
            disabled // Deixa o campo desabilitado já que é automático
            cnpj
          />
          <TextInput
            titulo="Nome"
            type="text"
            onChange={(value) => handleChange("nome", value)}
            required
          />
          <UploadImagem
            label="Imagem do Serviço"
            onUpload={(url) => handleChange("imagem", url)}
          />
          <TextInput
            titulo="Descricao"
            type="text"
            onChange={(value) => handleChange("descricao", value)}
            required
          />
          <TextInput
            titulo="Preço"
            type="number"
            onChange={(value) => handleChange("preco", value)}
            required
          />
          <div className="flex gap-3">
            <TextInput
              titulo="Inicio"
              type="time"
              onChange={(value) => handleChange("inicio", value)}
              required
            />
            <TextInput
              titulo="Fim"
              type="time"
              onChange={(value) => handleChange("fim", value)}
              required
            />
          </div>
          <TextInput
            titulo="Duração"
            type="time"
            onChange={(value) => handleChange("duracao", value)}
            required
          />
        </Formulario>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <button
          className={`
            w-full py-4 rounded-xl text-white font-semibold mb-10
            ${
              isValid
                ? "bg-linear-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          disabled={!isValid}
          onClick={handleConfirmar}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default TelaCriarServico;
