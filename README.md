# Calendas

Aplicação web para clientes encontrarem serviços e para prestadores gerenciarem empresas, serviços e agendamentos.

## Requisitos

- Node.js 22 ou superior
- Um projeto Firebase com Authentication (e-mail/senha) e Realtime Database

## Executar localmente

```bash
npm ci
npm run dev
```

Outros comandos:

```bash
npm run lint
npm run test
npm run build
```

## Segurança do Firebase

As regras do Realtime Database estão em `database.rules.json`. Antes de publicar o aplicativo, revise os IDs e a estrutura de dados do banco de produção e publique-as usando a Firebase CLI:

```bash
firebase deploy --only database
```

As regras exigem login, restringem perfis ao próprio usuário, restringem empresas e serviços ao prestador proprietário e limitam a leitura de agendamentos às partes envolvidas. O projeto permanece compatível com o plano Spark (gratuito), sem Cloud Functions.

## Reserva de horários

O aplicativo reserva primeiro o slot em `slots/{idServico}/{data}/{horario}` usando uma transação e só depois grava os dados relacionados. Isso evita a dupla reserva concorrente sem exigir Cloud Functions.

## Uploads

O upload usa Cloudinary. Para produção, o preset não deve aceitar uploads irrestritos: limite formatos, tamanho e origem e, idealmente, gere assinaturas em um backend. Nunca coloque um `api_secret` do Cloudinary no frontend.

## Deploy

O `vercel.json` contém o fallback para rotas do React Router. Configure o projeto no Vercel e use `npm run build` como comando de build.

## Estrutura

- `src/data`: repositórios internos do Firebase; não devem ser importados por telas ou componentes
- `src/features`: serviços públicos separados por domínio (`auth`, `agendamentos`, `empresas`, `perfil` e `servicos`)
- `src/pages`: composição das telas da aplicação
- `src/components`: componentes visuais reutilizáveis, já agrupados quando específicos de cadastro, cliente ou prestador
- `src/firebase`: somente a configuração e os tipos compartilhados do Firebase
- `src/lib`: regras puras de disponibilidade, cobertas por testes
- `database.rules.json`: regras versionadas do Firebase
