import { useEffect, useState } from "react";
import CabecalhoBranco from "../components/CabecalhoBranco";
import Formulario from "../components/Formulario";
import TextInput from "../components/TextInput";
import { getTipoUsuario } from "../firebase/auth";
import { getAuth } from "firebase/auth";
import { get, ref } from "firebase/database";
import { db } from "../firebase/config";

function TelaPerfil() 
{
  const [tipo, setTipo] = useState<"cliente" | "prestador" | null>(null);
  const [dados, setDados] = useState<Record<string, string>>({});

  useEffect(() => {
    getTipoUsuario().then(async (t) => {
      setTipo(t);
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      const colecao = t === "cliente" ? "clientes" : "prestadores";
      const snap = await get(ref(db, `${colecao}/${uid}`));
      if (snap.exists()) setDados(snap.val());
    }).catch(console.error);
  }, []);

  if (!tipo) return <p>Carregando...</p>;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <CabecalhoBranco titulo="Informações do seu Perfil" />
      <div className="w-[45%] min-w-75 relative flex flex-col gap-3 justify-items-center">
        <Formulario>

          {/* Campos comuns */}
          <TextInput titulo="Nome" type="text" value={dados.nome || ""} onChange={() => {}} disabled />
          <TextInput titulo="E-mail" type="email" value={dados.email || ""} onChange={() => {}} disabled />
          <TextInput titulo="Telefone" type="tel" value={dados.telefone || ""} onChange={() => {}} disabled />
          <TextInput titulo="Data de Nascimento" type="date" value={dados.dtnasc || ""} onChange={() => {}} disabled />

          {/* Campos exclusivos do cliente */}
          {tipo === "cliente" && (
            <>
              <TextInput titulo="CEP" type="text" value={dados.cep || ""} onChange={() => {}} disabled cep />
              <TextInput titulo="Logradouro" type="text" value={dados.logradouro || ""} onChange={() => {}} disabled />
              <div className="flex gap-3">
                <TextInput titulo="Número" type="text" value={dados.numero || ""} onChange={() => {}} disabled />
                <TextInput titulo="Complemento" type="text" value={dados.complemento || ""} onChange={() => {}} disabled />
              </div>
              <TextInput titulo="Bairro" type="text" value={dados.bairro || ""} onChange={() => {}} disabled />
              <div className="flex gap-3">
                <TextInput titulo="Cidade" type="text" value={dados.cidade || ""} onChange={() => {}} disabled />
                <TextInput titulo="Estado" type="text" value={dados.estado || ""} onChange={() => {}} disabled />
              </div>
            </>
          )}

          {/* Campos exclusivos do prestador (por enquanto só os comuns) */}
          {tipo === "prestador" && (
            <>
              {/* adicionar campos de prestador aqui quando necessário */}
            </>
          )}

        </Formulario>
      </div>
    </div>
  );
}

export default TelaPerfil;