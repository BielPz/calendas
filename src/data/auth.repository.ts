import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth, signOut } from "firebase/auth";
import { ref, get, set, push, update } from "firebase/database";
import type { Usuario, Cliente, Empresa } from "../firebase/types";

/* -----------------------------------------------------------------------------*/
/*                                    CADASTRO                                  */
/* -----------------------------------------------------------------------------*/

const salvarNoBanco = async (path: string, uid: string, dados: object) => {
  return set(ref(db, `${path}/${uid}`), {
    ...dados,
    uid,
    dataCadastro: new Date().toISOString(),
  });
};

/* -----------------------------------------------------------------------------*/

export const registrarCliente = async (email: string, pass: string, dados: Usuario & Cliente) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { senha, rSenha, ...dadosParaSalvar } = dados;

  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: dados.nome });
  await salvarNoBanco("clientes", user.uid, dadosParaSalvar);
  return user;
};

/* -----------------------------------------------------------------------------*/

export const registrarPrestador = async (email: string, pass: string, dados: Usuario) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { senha, rSenha, ...dadosParaSalvar } = dados;

  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await updateProfile(user, { displayName: dados.nome });
  await salvarNoBanco("prestadores", user.uid, dadosParaSalvar);
  return user;
};

/* -----------------------------------------------------------------------------*/

export const registrarEmpresa = async (uidPrestador: string, dados: Empresa) => {
  // Cria a empresa no nó global "empresas"
  const novaEmpresaRef = push(ref(db, "empresas"));
  const empresa = {
    ...dados,
    uidDono: uidPrestador,
    dataCadastro: new Date().toISOString(),
  };

  const idEmpresa = novaEmpresaRef.key!;

  await update(ref(db), {
    [`empresas/${idEmpresa}`]: empresa,
    [`prestadores/${uidPrestador}/empresas/${idEmpresa}`]: true,
  });

  return idEmpresa;
};

/* -----------------------------------------------------------------------------*/
/*                                      LOGIN                                   */
/* -----------------------------------------------------------------------------*/

export const login = async (email: string, pass: string, tipo: "cliente" | "prestador") => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  const colecaoPlural = tipo === "cliente" ? "clientes" : "prestadores";
  //console.log("UID do usuário:", user.uid);
  //console.log("Buscando em:", `${colecaoPlural}/${user.uid}`);

  const snapshot = await get(ref(db, `${colecaoPlural}/${user.uid}`));

  //console.log("Encontrou?", snapshot.exists());
  //console.log("Dados:", snapshot.val());

  if (!snapshot.exists()) {
    await signOut(auth);
    throw new Error(`Usuário não encontrado como ${tipo}`);
  }

  return user;
  
};

/* -----------------------------------------------------------------------------*/

export const getTipoUsuario = async (): Promise<"cliente" | "prestador"> => {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não logado");

  const clienteSnap = await get(ref(db, `clientes/${uid}`));
  if (clienteSnap.exists()) return "cliente";

  const prestadorSnap = await get(ref(db, `prestadores/${uid}`));
  if (prestadorSnap.exists()) return "prestador";

  throw new Error("Usuário não encontrado");
};

/* -----------------------------------------------------------------------------*/
/*                                 ESQUECI A SENHA                              */
/* -----------------------------------------------------------------------------*/

export const redefinirSenha = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
