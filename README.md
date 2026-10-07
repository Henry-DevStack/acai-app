# Açaí — cardápio digital

Cardápio digital para pedir açaí no balcão. O cliente abre no celular (QR code na porta),
escolhe um açaí pronto ou monta o seu, e faz o pedido com o nome. O dono acompanha a fila
num painel, marca o pedido como pronto e entregue, e controla os insumos: desligar um insumo
que acabou tira ele do "Monte o seu" e deixa esgotado todo açaí pronto que usa ele.

O visual segue o conceito do PDF do projeto (Cardapio_Acai_Design_e_Fluxograma).

## Estrutura

```
frontend/   React + Vite + Tailwind (tela do cliente e painel do dono)
backend/    Java 21 + Spring Boot + PostgreSQL (API, regras e pedidos)
```

### Telas

| Rota | Quem usa | O que faz |
| --- | --- | --- |
| `#/` | Cliente | Cardápio: Monte o seu e açaís prontos (com "Esgotado", "Montar parecido" e sugestão) |
| `#/montar` | Cliente | Tamanho, complementos (com limite) e extras pagos |
| `#/sacola` | Cliente | Itens, quantidade, nome, observação e "Fazer pedido" |
| `#/pedido` | Cliente | Número do pedido e status, atualizando sozinho |
| `#/dono` | Dono | Login, Pedidos (fila), Insumos (liga/desliga) e Produtos (prontos e tamanhos) |

### API

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/menu` | Tamanhos, insumos e prontos |
| POST | `/api/orders` | Cria o pedido (servidor valida e recalcula o total) |
| GET | `/api/orders/{id}` | Status do pedido para o cliente |
| POST | `/api/owner/login` | Senha do dono → token |
| GET | `/api/owner/orders` | Fila e histórico |
| PATCH | `/api/owner/orders/{id}/status` | RECEBIDO → PRONTO → ENTREGUE (ou CANCELADO) |
| POST/PUT/DELETE | `/api/owner/ingredients`, `/products`, `/sizes` | Cadastro do cardápio |

## Rodando localmente

**Só o front (modo protótipo):** sem backend, os dados ficam no navegador.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 — painel em #/dono, senha acai123
npm test           # regras do cardápio
```

**Front + backend:**

```bash
cd backend
mvn spring-boot:run          # http://localhost:8080, banco H2 em memória com dados de exemplo
mvn test

cd ../frontend
echo "VITE_API_URL=http://localhost:8080" > .env.local
npm run dev
```

### Variáveis do backend

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `DATABASE_URL` | H2 em memória | `jdbc:postgresql://…` em produção |
| `DATABASE_USER` / `DATABASE_PASSWORD` | `sa` / vazio | Acesso ao PostgreSQL |
| `OWNER_PASSWORD` | `acai123` | Senha do painel do dono (troque!) |
| `FRONTEND_URL` | `http://localhost:5173` | Endereço do front liberado no CORS |
| `SEED_SAMPLE_DATA` | `true` | Coloca o cardápio de exemplo se o banco estiver vazio |

## Publicação (a decidir)

O front sobe na Vercel como o LIFT (Root Directory = `frontend`). Sem `VITE_API_URL`,
ele já funciona em modo protótipo. Para pedidos reais, o backend precisa de um lugar que rode
Java (o `backend/Dockerfile` serve para Render, Railway, Fly.io etc.) e de um PostgreSQL
(Neon ou Supabase têm plano grátis).
