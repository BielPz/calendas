import { auth, db } from "./config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set, push } from "firebase/database";
import type { Usuario, Cliente, Prestador, Empresa } from "./types";

const salvarNoBanco = async (path: string, uid: string, dados: object) => {
  return set(ref(db, `${path}/${uid}`), {
    ...dados,
    uid,
    dataCadastro: new Date().toISOString(),
  });
};

export const registrarCliente = async (email: string, pass: string, dados: Usuario & Cliente) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: dados.nome });
  await salvarNoBanco("clientes", user.uid, dados);
  return user;
};

export const registrarPrestador = async (email: string, pass: string, dados: Prestador) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: dados.nome });
  await salvarNoBanco("prestadores", user.uid, dados);
  return user;
};

export const registrarEmpresa = async (uidPrestador: string, dados: Empresa) => {
  const novaEmpresaRef = push(ref(db, "empresas"));
  await set(novaEmpresaRef, {
    ...dados,
    uidDono: uidPrestador,
    dataCadastro: new Date().toISOString(),
  });
  return novaEmpresaRef.key;
};