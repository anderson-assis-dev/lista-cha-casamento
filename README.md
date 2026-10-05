# Chá de Casa Nova — João & Ellen

Convite online com confirmação de presença, lista de presentes (sem itens repetidos), Pix e painel administrativo com insights.

- **Evento:** domingo, 08/11/2026, às 13h, no Colégio Adventista de Lauro de Freitas (BA)
- **Convite:** `/`
- **Painel:** `/admin` (usuário e senha definidos em `ADMIN_USER` / `ADMIN_PASSWORD`)

## Como funciona para o convidado

1. Informa nome, WhatsApp, se vai ou não, quantos adultos e crianças levará, e pode deixar um recado.
2. Depois escolhe como presentear (é opcional):
   - **Lista de presentes:** 50 sugestões. Cada item só pode ser escolhido por uma pessoa, e a reserva é atômica no banco.
   - **Pix:** a pessoa informa o valor e *só então* vê o QR Code, que não tem valor fixo (ela digita o valor no app do banco).
   - **Outro presente:** descreve o que pretende levar.
3. O navegador lembra do convidado, então ele pode voltar depois e escolher/adicionar presentes.

## Painel administrativo

- **Visão geral:** respostas, quem vai ou não vai, adultos/crianças, total em Pix (quantidade e média), progresso da lista, gráficos por tipo de presente e categoria, respostas e Pix por dia, últimos Pix e recados.
- **Convidados:** tabela com filtros (presença, tipo de presente), busca, link direto para o WhatsApp, edição/exclusão e exportação para CSV, Excel (com aba da lista de presentes) e impressão.
- **Lista de presentes:** quem escolheu cada item; permite adicionar, editar, ocultar, excluir e liberar itens.
- **Pix & ajustes:** código Pix Copia e Cola, link do Nubank, chave, nome e cidade, com pré-visualização do QR Code.

## Stack

React + Vite + Tailwind 4 + Framer Motion + Recharts · Express + Prisma + PostgreSQL · JWT

## Rodando localmente

```bash
pnpm install
cp backend/.env.example backend/.env   # ajuste DATABASE_URL
cd backend && pnpm exec prisma migrate deploy && pnpm run prisma:seed && cd ..
pnpm --filter backend dev    # http://localhost:3001
pnpm --filter frontend dev   # http://localhost:5173
```

Para apagar todas as respostas e recriar a lista padrão: `pnpm --filter backend db:reset-dados`.

## Variáveis de ambiente (backend)

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL (ex.: Neon) — use um banco **novo**, separado do chá do Davi |
| `JWT_SECRET` | string aleatória longa |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_USER` / `ADMIN_PASSWORD` | acesso ao painel |
| `CORS_ORIGIN` | URL do site ou `*` |
| `PIX_COPIA_E_COLA` | código Pix sem valor (tem prioridade sobre a chave) |
| `PIX_LINK` | link de cobrança do banco (opcional) |
| `PIX_CHAVE` / `PIX_NOME` / `PIX_CIDADE` | usados para gerar o QR Code se não houver código |

As variáveis `PIX_*` são usadas só para preencher a configuração na primeira vez. Depois disso, edite pelo painel em **Pix & ajustes**.

## Deploy na Vercel

Mesmo processo do projeto base: *Root Directory* vazio, `vercel.json` já incluso, e as variáveis acima em Production e Preview. O build roda `prisma migrate deploy`, e a lista de 50 presentes é criada automaticamente na primeira inicialização.
