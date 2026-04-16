export interface Usuario
{
    email: string,
    senha: string,
    rSenha: string,

    nome: string,
    genero: string,
    dtnasc: string,
    telefone?: string,

    tipo: string
}


export interface Cliente
{
    cep: string,
    logradouro: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    estado: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Prestador 
{
    // add algo depois?
}

export interface Empresa
{
    nome: string,
    cnpj: string,
    tel: string,
    email: string,
    cep: string,
    logradouro: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    estado: string,
}

export interface Servico {
    cnpj: string;
    nome: string;
    descricao?: string;
    preco: number;
}