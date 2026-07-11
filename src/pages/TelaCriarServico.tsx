import { useEffect, useState, useRef } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import type { Servico, DiaDisponivel } from "../firebase/types";
import CabecalhoBranco from "../components/CabecalhoBranco";
import { criarServico, getEmpresaPorId } from "../firebase/database";
import { useLocation, useNavigate } from "react-router";
import UploadImagem from "../components/UploadImagem";
import { useAlerta } from "../provider/AlertContext";

// ─── Configuração dos dias da semana ─────────────────────────────────────────
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Dias úteis (Seg–Sex) ativos por padrão
const diasPadrao = (): DiaDisponivel[] =>
  DIAS_SEMANA.map((_, i) => ({
    ativo: i >= 1 && i <= 5,
    inicio: "",
    fim: "",
  }));

// ─── Componente ──────────────────────────────────────────────────────────────
function TelaCriarServico() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlerta } = useAlerta();
  const idEmpresa = location.state?.idEmpresa;

  const [form, setForm] = useState<Servico>({
    cnpj: "",
    nome: "",
    imagem: "",
    descricao: "",
    preco: 0,
    duracao: "",
    tempo: "",
    diasDisponiveis: diasPadrao(),
  });
  const [erro, setErro] = useState("");

  // Refs síncronas para gravar qual índice de dia ativou a propagação inicial.
  // Evita lags de estado assíncrono entre keystrokes rápidas.
  const origemPropagacaoInicio = useRef<number | null>(null);
  const origemPropagacaoFim = useRef<number | null>(null);

  useEffect(() => {
    if (idEmpresa) {
      getEmpresaPorId(idEmpresa).then((dados) => {
        if (dados?.cnpj) {
          setForm((prev) => ({ ...prev, cnpj: dados.cnpj }));
        }
      });
    }
  }, [idEmpresa]);

  // ── Handlers gerais ────────────────────────────────────────────────────────
  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: campo === "preco" ? Number(value) : value,
    }));
  };

  // ── Handlers dos dias ─────────────────────────────────────────────────────
  const toggleDia = (index: number) => {
    // Se desativar o dia que estava controlando a propagação, limpa a referência
    if (origemPropagacaoInicio.current === index)
      origemPropagacaoInicio.current = null;
    if (origemPropagacaoFim.current === index)
      origemPropagacaoFim.current = null;

    setForm((prev) => {
      const dias = [...prev.diasDisponiveis];
      dias[index] = { ...dias[index], ativo: !dias[index].ativo };
      return { ...prev, diasDisponiveis: dias };
    });
  };

  const handleHorarioDia = (
    index: number,
    campo: "inicio" | "fim",
    valor: string,
  ) => {
    if (campo === "inicio") {
      // Se for a primeira digitação geral da tela, este campo vira o "master" da propagação
      if (origemPropagacaoInicio.current === null) {
        origemPropagacaoInicio.current = index;
      }
    } else {
      if (origemPropagacaoFim.current === null) {
        origemPropagacaoFim.current = index;
      }
    }

    setForm((prev) => {
      const dias = [...prev.diasDisponiveis];

      // Só propaga se o usuário continuar digitando no MESMO campo que iniciou tudo
      const podePropagar =
        campo === "inicio"
          ? origemPropagacaoInicio.current === index
          : origemPropagacaoFim.current === index;

      if (podePropagar) {
        return {
          ...prev,
          diasDisponiveis: dias.map((d) =>
            d.ativo ? { ...d, [campo]: valor } : d,
          ),
        };
      }

      // Se ele trocou de campo ou mudou de dia (individualização), altera estritamente o alvo
      dias[index] = { ...dias[index], [campo]: valor };
      return { ...prev, diasDisponiveis: dias };
    });
  };

  // ── Validação ──────────────────────────────────────────────────────────────
  const diasAtivos = form.diasDisponiveis.filter((d) => d.ativo);
  const diasValidos = diasAtivos.every((d) => d.inicio && d.fim);

  const isValid = Boolean(
    form.cnpj &&
    form.nome &&
    form.preco &&
    form.duracao &&
    diasAtivos.length > 0 &&
    diasValidos,
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!isValid || !idEmpresa) return;
    try {
      // Correção do Bug 2: Limpa horários de dias inativos antes de salvar no Firebase
      const formSanitizado: Servico = {
        ...form,
        diasDisponiveis: form.diasDisponiveis.map((d) =>
          d.ativo ? d : { ...d, inicio: "", fim: "" },
        ),
      };

      await criarServico(formSanitizado, idEmpresa);
      showAlerta("Sucesso", "Serviço criado com sucesso!", "sucesso");
      navigate("/feed");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
      showAlerta("Erro", errorMessage, "erro");
    }
  };

  const tempos = [
    { label: "Dias", value: "dia" },
    { label: "Horas", value: "hora" },
    { label: "Minutos", value: "minuto" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-start min-h-screen dark:bg-zinc-900">
      <CabecalhoBranco titulo="Cadastre seu Serviço" />
      <div className="w-[45%] min-w-75 relative flex flex-col gap-3 justify-items-center">
        <Formulario>
          <TextInput
            titulo="CNPJ da Empresa"
            type="text"
            value={form.cnpj}
            onChange={() => {}}
            disabled
            cnpj
          />
          <TextInput
            titulo="Nome"
            type="text"
            onChange={(value) => handleChange("nome", value)}
            required
            maxLength={75}
          />
          <UploadImagem
            label="Imagem do Serviço"
            onUpload={(url) => handleChange("imagem", url)}
          />
          <TextInput
            titulo="Descrição"
            type="text"
            onChange={(value) => handleChange("descricao", value)}
            required
            maxLength={200}
          />
          <TextInput
            titulo="Preço"
            type="number"
            onChange={(value) => handleChange("preco", value)}
            required
          />
          <div className="flex gap-3">
            <TextInput
              titulo="Duração"
              type="number"
              onChange={(value) => handleChange("duracao", value)}
              required
            />
            <TextInput
              titulo="Tempo"
              type="select"
              options={tempos}
              onChange={(value) => handleChange("tempo", value)}
              required
            />
          </div>

          {/* ── Dias disponíveis ────────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              Dias disponíveis
            </span>
            <p className="text-xs text-gray-400 mb-2">
              Ao preencher o horário de um dia, ele será aplicado a todos os
              outros dias ativos automaticamente.
            </p>

            <div className="flex flex-col gap-2">
              {DIAS_SEMANA.map((dia, i) => {
                const d = form.diasDisponiveis[i];
                return (
                  <div key={dia} className="flex items-center gap-3">
                    {/* Bolinha do dia */}
                    <button
                      type="button"
                      onClick={() => toggleDia(i)}
                      className={`w-10 h-10 rounded-full text-xs font-bold shrink-0 transition-all border-2
                        ${
                          d.ativo
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-400 border-gray-300 hover:border-blue-300"
                        }`}
                    >
                      {dia}
                    </button>

                    {/* Campos de horário — desabilitados se dia inativo */}
                    <div
                      className={`flex gap-2 flex-1 transition-opacity ${
                        d.ativo
                          ? "opacity-100"
                          : "opacity-30 pointer-events-none"
                      }`}
                    >
                      <TextInput
                        titulo="Início"
                        type="time"
                        value={d.inicio}
                        onChange={(v) => handleHorarioDia(i, "inicio", v)}
                        disabled={!d.ativo}
                      />
                      <TextInput
                        titulo="Fim"
                        type="time"
                        value={d.fim}
                        onChange={(v) => handleHorarioDia(i, "fim", v)}
                        disabled={!d.ativo}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aviso se nenhum dia ativo */}
            {diasAtivos.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Selecione ao menos um dia disponível.
              </p>
            )}
          </div>
        </Formulario>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <button
          className={`
            w-full py-4 rounded-xl text-white font-semibold mb-10
            ${
              isValid
                ? "bg-linear-to-br from-orange-500 to-purple-500 hover:from-orange-700 hover:to-purple-700 dark:from-indigo-600 dark:to-zinc-600 dark:hover:from-indigo-950 dark:hover:to-zinc-950 cursor-pointer"
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
