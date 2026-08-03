import { useEffect, useMemo, useState } from "react";
import Formulario from "../Formulario";
import TextInput from "../TextInput";
import UploadImagem from "../UploadImagem";
import Estados from "../../hooks/Estados";
import Cidades from "../../hooks/Cidades";
import type { Empresa } from "../../firebase/types";
import ConsultarCEP from "../../hooks/ConsultarCEP";
import { useAlerta } from "../../provider/AlertContext";

interface Props {
  onValidate?: (valid: boolean) => void;
  onChange: (dados: Empresa) => void;
}

function Fase2({ onValidate, onChange }: Props) {
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

  const [checkCEP, setCheckCEP] = useState(false);

  const handleChange = (campo: string, value: string) => {
    const novoForm = { ...form, [campo]: value };
    onChange(novoForm);

    setForm((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const isValid = Boolean(
    form.nome &&
    form.cnpj &&
    form.tel &&
    form.cep &&
    checkCEP &&
    form.logradouro &&
    form.numero &&
    form.bairro &&
    form.cidade &&
    form.estado,
  );

  const { showAlerta } = useAlerta();

  const estados = Estados();
  const cidades = Cidades(String(form.estado));

  const CEPdados = useMemo(
    () => (form.cep?.length === 9 ? ConsultarCEP(form.cep) : null),
    [form.cep],
  );

  // Atualiza os campos de endereço quando o CEP é consultado
  useEffect(() => {
    if (!CEPdados) return;

    CEPdados.then((dados) => {
      if (!dados || dados.erro) {
        showAlerta(
          "Falha na consulta",
          "Não foi possível consultar o CEP. Verifique o número e tente novamente.",
          "desconect",
        );
        setCheckCEP(false);
        return;
      }
      setForm((prev) => ({
        ...prev,
        logradouro: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        estado: dados.uf || "",
      }));
      setCheckCEP(true);
    });
  }, [CEPdados]);

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid]);

  return (
    <>
      <Formulario>
        <TextInput
          titulo="Nome da Empresa"
          type="text"
          placeholder="Digite o nome da empresa"
          onChange={(value) => handleChange("nome", value)}
          required
          maxLength={30}
        />
        <UploadImagem
          label="Imagem da empresa"
          onUpload={(url) => handleChange("imagem", url)}
        />
        <TextInput
          titulo="CNPJ"
          type="text"
          onChange={(value) => handleChange("cnpj", value)}
          cnpj
          required
        />
        <TextInput
          titulo="Telefone"
          type="tel"
          onChange={(value) => handleChange("tel", value)}
          required
        />
        <TextInput
          titulo="E-mail"
          type="email"
          onChange={(value) => handleChange("email", value)}
          maxLength={75}
        />
        <TextInput
          titulo="CEP"
          type="number"
          onChange={(value) => handleChange("cep", value)}
          required
          cep
        />
        <TextInput
          titulo="Complemento"
          type="text"
          onChange={(value) => handleChange("complemento", value)}
          maxLength={50}
        />
        <TextInput
          titulo="Logradouro"
          type="text"
          onChange={(value) => handleChange("logradouro", value)}
          value={form.logradouro === undefined ? undefined : form.logradouro}
          required
          maxLength={50}
        />
        <TextInput
          titulo="Número"
          type="number"
          onChange={(value) => handleChange("numero", value)}
          required
          maxLength={10}
        />
        <TextInput
          titulo="Bairro"
          type="text"
          onChange={(value) => handleChange("bairro", value)}
          value={form.bairro === undefined ? undefined : form.bairro}
          required
          maxLength={50}
        />
        <TextInput
          titulo="Estado"
          type="select"
          options={estados}
          onChange={(value) => handleChange("estado", value)}
          value={form.estado === undefined ? undefined : form.estado}
          required
        />
        <TextInput
          titulo="Cidade"
          type="select"
          options={cidades}
          onChange={(value) => handleChange("cidade", value)}
          value={form.cidade === undefined ? undefined : form.cidade}
          required
        />
      </Formulario>
    </>
  );
}

export default Fase2;
