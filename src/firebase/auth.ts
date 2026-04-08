import { auth, db } from "./config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

interface CadastroDados 
{
  // Credenciais
  email: string;
  
  // Dados pessoais
  nome: string;
  genero: string;
  dtnasc: string;
  telefone: string;

  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const salvarNoBanco = async (path: string, uid: string, dados: CadastroDados) => {
  return set(ref(db, `${path}/${uid}`), {
    ...dados,
    uid,
    dataCadastro: new Date().toISOString(),
  });
};

export const registrarCliente = async (email: string, pass: string, dados: CadastroDados) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: dados.nome });
  await salvarNoBanco("clientes", user.uid, dados);
  return user;
};

export const registrarPrestador = async (email: string, pass: string, dados: CadastroDados) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: dados.nome });
  await salvarNoBanco("prestadores", user.uid, dados);
  return user;
};