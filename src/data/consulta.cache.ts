type Entrada<T> = { expiraEm: number; valor?: T; pendente?: Promise<T> };

const consultas = new Map<string, Entrada<unknown>>();

export async function consultarComCache<T>(chave: string, carregar: () => Promise<T>, duracaoMs = 15_000): Promise<T> {
  const agora = Date.now();
  const existente = consultas.get(chave) as Entrada<T> | undefined;
  if (existente?.valor !== undefined && existente.expiraEm > agora) return existente.valor;
  if (existente?.pendente) return existente.pendente;

  const pendente = carregar().then((valor) => {
    consultas.set(chave, { valor, expiraEm: Date.now() + duracaoMs });
    return valor;
  }).catch((erro) => {
    consultas.delete(chave);
    throw erro;
  });
  consultas.set(chave, { expiraEm: 0, pendente });
  return pendente;
}

export function invalidarConsultas(prefixo: string) {
  for (const chave of consultas.keys()) if (chave.startsWith(prefixo)) consultas.delete(chave);
}
