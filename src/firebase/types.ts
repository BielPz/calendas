export interface Usuario
{
    email: string,
    senha: string,
    rSenha: string,

    nome: string,
    genero: string,
    dtnasc: string,
    telefone?: string,
}


export interface Cliente
{
    cep: string,
    logradouro: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    estado: string,
}

export interface Prestador 
{
    email: string,
    senha: string,
    rSenha: string,

    nome: string,
    genero: string,
    dtnasc: string,
    telefone?: string,
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