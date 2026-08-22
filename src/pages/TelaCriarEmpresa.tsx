import { useState } from "react";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import UploadImagem from "../components/UploadImagem";
import CabecalhoBranco from "../components/CabecalhoBranco";
import type { Empresa } from "../firebase/types";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router";
import { useAlerta } from "../provider/AlertContext";
import Estados from "../hooks/Estados";
import Cidades from "../hooks/Cidades";
import { registrarEmpresa } from "@/features/empresas/empresa.service";

// ─── Componente ──────────────────────────────────────────────────────────────
function TelaAdicionarEmpresa() {
  const navigate = useNavigate();
  const { showAlerta } = useAlerta();

  const [form, setForm] = useState<Empresa>({
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
    imagem: "",
  });

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (campo: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const estados = Estados();
  const cidades = Cidades(String(form.estado));

  // ── Validação ──────────────────────────────────────────────────────────────
  const isValid = Boolean(
    form.nome &&
    form.cnpj &&
    form.tel &&
    form.cep &&
    form.logradouro &&
    form.numero &&
    form.bairro &&
    form.cidade &&
    form.estado,
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!isValid) return;

    setCarregando(true);
    setErro("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const idEmpresa = await registrarEmpresa(user.uid, form);
      showAlerta("Sucesso", "Empresa criada com sucesso!", "sucesso");
      navigate("/feed", { state: { idEmpresaCriada: idEmpresa } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar empresa";
      setErro(errorMessage);
      showAlerta("Erro", errorMessage, "erro");
    } finally {
      setCarregando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-start min-h-screen dark:bg-zinc-900">
      <CabecalhoBranco titulo="Cadastre uma Nova Empresa" />

      <div className="flex w-full max-w-xl flex-col gap-3 px-4">
        <Formulario>
          <TextInput
            titulo="Nome da Empresa"
            type="text"
            placeholder="Digite o nome da empresa"
            value={form.nome}
            onChange={(value) => handleChange("nome", value)}
            required
            maxLength={30}
          />

          <UploadImagem
            label="Logo/Imagem da Empresa"
            onUpload={(url) => handleChange("imagem", url)}
          />

          <TextInput
            titulo="CNPJ"
            type="text"
            value={form.cnpj}
            onChange={(value) => handleChange("cnpj", value)}
            cnpj
            required
          />

          <TextInput
            titulo="Telefone"
            type="tel"
            value={form.tel}
            onChange={(value) => handleChange("tel", value)}
            required
          />

          <TextInput
            titulo="E-mail"
            type="email"
            value={form.email}
            onChange={(value) => handleChange("email", value)}
            maxLength={50}
          />

          <TextInput
            titulo="CEP"
            type="text"
            value={form.cep}
            onChange={(value) => handleChange("cep", value)}
            required
            cep
          />

          <TextInput
            titulo="Logradouro"
            type="text"
            value={form.logradouro}
            onChange={(value) => handleChange("logradouro", value)}
            required
            maxLength={50}
          />

          <div className="flex gap-3">
            <TextInput
              titulo="Número"
              type="text"
              value={form.numero}
              onChange={(value) => handleChange("numero", value)}
              required
              maxLength={10}
            />
            <TextInput
              titulo="Complemento"
              type="text"
              value={form.complemento}
              onChange={(value) => handleChange("complemento", value)}
              maxLength={50}
            />
          </div>

          <TextInput
            titulo="Bairro"
            type="text"
            value={form.bairro}
            onChange={(value) => handleChange("bairro", value)}
            required
            maxLength={50}
          />

          <div className="flex gap-3">
            <TextInput
              titulo="Estado"
              type="select"
              options={estados}
              value={form.estado}
              onChange={(value) => handleChange("estado", value)}
              required
            />

            <TextInput
              titulo="Cidade"
              type="select"
              options={cidades}
              value={form.cidade}
              onChange={(value) => handleChange("cidade", value)}
              required
            />
          </div>
        </Formulario>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <button
          className={`
            w-full py-4 rounded-xl text-white font-semibold mb-10 transition-all
            ${
              isValid && !carregando
                ? "bg-linear-to-br from-orange-500 to-violet-600 hover:from-orange-600 hover:to-violet-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-70"
            }
          `}
          disabled={!isValid || carregando}
          onClick={handleConfirmar}
        >
          {carregando ? "Criando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}

export default TelaAdicionarEmpresa;
