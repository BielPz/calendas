import { auth, db } from "./config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

// Interface para facilitar o TypeScript e não esquecer nenhum campo
interface CadastroDados {
  nome: string;
  email: string;
  genero: string;
  dtnasc: string;
  estado: string;
  cidade?: string;
  // ... adicione outros campos que você tiver no formulário
}

/**
 * Função genérica interna para salvar no banco (para evitar repetição de código)
 */
const salvarNoBanco = async (path: string, uid: string, dados: CadastroDados) => {
  return set(ref(db, `${path}/${uid}`), {
    ...dados,
    uid: uid,
    dataCadastro: new Date().toISOString(),
  });
};

/**
 * CADASTRO DE CLIENTE
 */
export const registrarCliente = async (email: string, pass: string, dados: CadastroDados) => {
  // eslint-disable-next-line no-useless-catch
  try 
  {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    await updateProfile(user, { displayName: dados.nome });
    
    // Salva na pasta 'clientes'
    await salvarNoBanco('clientes', user.uid, dados);
    
    return user;
  } 
  catch (error) 
  {
    throw error;
  }
};

/**
 * CADASTRO DE PRESTADOR
 */
export const registrarPrestador = async (email: string, pass: string, dados: CadastroDados) => {
  // eslint-disable-next-line no-useless-catch
  try 
  {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    await updateProfile(user, { displayName: dados.nome });
    
    // Salva na pasta 'prestadores'
    await salvarNoBanco('prestadores', user.uid, dados);
    
    return user;
  } 
  catch (error) 
  {
    throw error;
  }
};