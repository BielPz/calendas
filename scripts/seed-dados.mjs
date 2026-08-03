import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, update } from "firebase/database";

const app = initializeApp({ apiKey: "AIzaSyCaehx_gf0BJTd1Vjksg2GWoAZiu6r7QOQ", authDomain: "calendas-6d477.firebaseapp.com", databaseURL: "https://calendas-6d477-default-rtdb.firebaseio.com", projectId: "calendas-6d477" });
const auth = getAuth(app);
const db = getDatabase(app);
const dias = () => [false, true, true, true, true, true, false].map((ativo) => ({ ativo, inicio: ativo ? "09:00" : "", fim: ativo ? "18:00" : "" }));
const atendimento = (modalidade, solicitarTelefone = false, placeholderObservacao = "") => ({ modalidade, solicitarTelefone, placeholderObservacao });

async function criar(email, nome, empresaId, empresaNome, servicos) {
  let credencial;
  try { credencial = await createUserWithEmailAndPassword(auth, email, "123456"); } catch (error) { if (error.code !== "auth/email-already-in-use") throw error; credencial = await signInWithEmailAndPassword(auth, email, "123456"); }
  await updateProfile(credencial.user, { displayName: nome });
  const uid = credencial.user.uid;
  await set(ref(db, `prestadores/${uid}`), { uid, nome, email, genero: "nao informado", dtnasc: "2000-01-01", telefone: "11999990000", tipo: "prestador", dataCadastro: new Date().toISOString(), empresas: { [empresaId]: true } });
  await set(ref(db, `empresas/${empresaId}`), { nome: empresaNome, cnpj: empresaId === "empresa-1" ? "11111111111111" : "22222222222222", tel: "11999990000", email, cep: "01001000", logradouro: "Rua Teste", numero: "100", complemento: "", bairro: "Centro", cidade: "Sao Paulo", estado: "SP", uidDono: uid, dataCadastro: new Date().toISOString(), servicos: Object.fromEntries(servicos.map((s) => [s.id, true])) });
  for (const servico of servicos) await set(ref(db, `servicos/${servico.id}`), { ...servico, idEmpresa: empresaId });
}

await criar("empresa1@gmail.com", "Prestador Um", "empresa-1", "Empresa Um", [
  { id: "corte", cnpj: "11111111111111", nome: "Corte", descricao: "Corte no estabelecimento", preco: 35, duracao: "30", tempo: "minuto", diasDisponiveis: dias(), modoHorario: "duracao", visibilidadeAgenda: "todos", configuracaoAtendimento: atendimento("presencial-cliente", false, "Informe como prefere o corte"), servicosConflitantes: ["barba"] },
  { id: "barba", cnpj: "11111111111111", nome: "Barba", descricao: "Barba no estabelecimento", preco: 25, duracao: "30", tempo: "minuto", diasDisponiveis: dias(), modoHorario: "duracao", visibilidadeAgenda: "dia", configuracaoAtendimento: atendimento("presencial-cliente"), servicosConflitantes: ["corte"] },
  { id: "consultoria-online", cnpj: "11111111111111", nome: "Consultoria Online", descricao: "Atendimento online", preco: 80, duracao: "45", tempo: "minuto", diasDisponiveis: dias(), modoHorario: "livre", visibilidadeAgenda: "oculta", configuracaoAtendimento: atendimento("online", true, "Descreva o tema da consultoria") },
]);
await criar("empresa2@gmail.com", "Prestador Dois", "empresa-2", "Empresa Dois", [
  { id: "visita-tecnica", cnpj: "22222222222222", nome: "Visita Tecnica", descricao: "Visita no endereco do cliente", preco: 120, duracao: "1", tempo: "hora", diasDisponiveis: dias(), modoHorario: "livre", visibilidadeAgenda: "todos", configuracaoAtendimento: atendimento("presencial-prestador", true, "Descreva o problema encontrado"), servicosConflitantes: ["manutencao"] },
  { id: "manutencao", cnpj: "22222222222222", nome: "Manutencao", descricao: "Manutencao no local", preco: 90, duracao: "1", tempo: "hora", diasDisponiveis: dias(), modoHorario: "duracao", visibilidadeAgenda: "dia", configuracaoAtendimento: atendimento("presencial-cliente", true), servicosConflitantes: ["visita-tecnica"] },
  { id: "aula-online", cnpj: "22222222222222", nome: "Aula Online", descricao: "Aula individual pela internet", preco: 60, duracao: "50", tempo: "minuto", diasDisponiveis: dias(), modoHorario: "livre", visibilidadeAgenda: "oculta", configuracaoAtendimento: atendimento("online", false, "Informe seu objetivo para a aula") },
]);
console.log("Dados criados com sucesso.");
