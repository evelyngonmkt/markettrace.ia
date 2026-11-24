# MarketTrace AI

Fundação técnica independente da MarketTrace AI, com uma interface web dark para organizar o fluxo de brief de negócio, pesquisa de mercado, memória empresarial e relatório fundamentado.

Esta entrega é deliberadamente independente do projeto MarketTrace anterior. Ela não conecta Supabase, banco de dados, autenticação, provedores de IA ou qualquer serviço exclusivo do Manus.

## Stack

- TypeScript strict
- React 18 + Vite
- Node.js LTS (20+)
- Fastify 5 + Zod
- pnpm workspaces
- Vitest, ESLint, Prettier e GitHub Actions
- Dockerfile e Docker Compose para servir o frontend compilado

## Estrutura

```text
apps/
  api/       Fastify estrutural com contratos de saúde
  web/       React/Vite com as rotas reais da interface
packages/
  shared/    Contratos Zod e navegação compartilhada
public/      Logo da MarketTrace AI
```

## Requisitos

Node.js 20 ou superior e pnpm 10. O `packageManager` do projeto fixa `pnpm@10.10.0`.

## Instalação

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install
```

Copie `.env.example` para `.env` apenas se quiser ajustar portas locais. Esta fundação não exige credenciais.

## Desenvolvimento

Para iniciar a interface:

```bash
pnpm dev
```

O Vite abre na porta `3000` e aceita acesso externo com `--host 0.0.0.0`. O backend estrutural pode ser executado separadamente:

```bash
pnpm --filter @markettrace/api dev
```

O endpoint de saúde fica em `http://localhost:3333/health`. Nenhuma funcionalidade de domínio é chamada pelo frontend nesta entrega.

## Validação

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build
```

O comando `pnpm check` executa todos esses passos em sequência.

## Docker

Com Docker instalado localmente:

```bash
docker compose up --build
```

O frontend compilado será servido em `http://localhost:3000` por Nginx. O ambiente de execução usado para esta entrega não possui o binário Docker, então a validação efetiva da imagem/Compose deve ser executada em uma máquina com Docker disponível.

## Rotas implementadas

| Rota            | Propósito                                                     |
| --------------- | ------------------------------------------------------------- |
| `/login`        | Experiência visual de acesso, sem autenticação implementada   |
| `/`             | Dashboard e fluxo Brief → Pesquisa → Contexto → Relatório     |
| `/intelligence` | Estrutura do brief de negócio e qualidade do raciocínio       |
| `/research`     | Estrutura de pesquisa, fontes e princípios de rastreabilidade |
| `/memory`       | Estrutura da memória empresarial, sem persistência            |
| `/reports`      | Empty state e anatomia de um relatório fundamentado           |
| `/company`      | Workspace, empresa e equipe, sem usuários/permissões          |
| `/settings`     | Preferências, privacidade e sessão, sem persistência          |

Todas as rotas estão declaradas em `apps/web/public/manus-routes.json` e usam o mesmo shell visual responsivo.

## Escopo explícito desta entrega

A navegação, o sistema visual, a hierarquia de informação e os estados de preparação estão implementados no frontend real. Entradas, pesquisa, ingestão de fontes, memória, relatórios, usuários, permissões, configurações persistentes, autenticação e IA permanecem desabilitados e sinalizados na interface. Não há dados fictícios apresentados como dados reais.
