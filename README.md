# Habit Manager

Aplicacao web para gerenciamento e acompanhamento de habitos diarios, com visualizacao estilo heatmap inspirada no GitHub/Rocketseat Ignite.

## Demo

[habit-manager-three.vercel.app](https://habit-manager-three.vercel.app)

## Sobre o Projeto

Este projeto foi desenvolvido como exercicio pratico para aprendizado e consolidacao de conhecimentos em desenvolvimento web fullstack moderno. O objetivo foi construir uma aplicacao completa, do banco de dados ao deploy, utilizando tecnologias atuais do ecossistema React/Next.js.

### Funcionalidades

- **Autenticacao** com Google via NextAuth.js
- **CRUD de habitos** com titulo, descricao, categoria e dias da semana
- **Registro diario** de conclusao de habitos
- **Visualizacao em heatmap** estilo GitHub (grid anual de contribuicoes)
- **Calendario mensal** para historico detalhado de cada habito
- **Sistema de streaks** (sequencias de dias consecutivos)
- **Pagina de estatisticas** com:
  - Total de habitos ativos
  - Total de conclusoes
  - Maior streak
  - Taxa de conclusao (ultimos 30 dias)
  - Grafico de conclusoes por dia da semana
  - Progresso mensal
- **Protecao de rotas** com middleware de autenticacao
- **Loading skeletons** para melhor experiencia do usuario
- **Design responsivo** e tema escuro

## Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Next.js 16** | Framework React com App Router |
| **TypeScript** | Tipagem estatica |
| **Prisma** | ORM para banco de dados |
| **PostgreSQL** | Banco de dados relacional |
| **NextAuth.js** | Autenticacao |
| **Tailwind CSS** | Estilizacao |
| **Day.js** | Manipulacao de datas |
| **Lucide React** | Icones |
| **Vercel** | Deploy e hospedagem |

## Como Rodar Localmente

### Pre-requisitos

- Node.js 18+
- PostgreSQL (local ou remoto)
- Conta Google Cloud para OAuth

### Instalacao

1. Clone o repositorio:
```bash
git clone https://github.com/socorromarques-tech/habit-manager.git
cd habit-manager
```

2. Instale as dependencias:
```bash
npm install
```

3. Configure as variaveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

4. Execute as migracoes do banco:
```bash
npx prisma db push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000)

## Aprendizados

Durante o desenvolvimento deste projeto, foram praticados:

- **App Router do Next.js 16** com Server Components e Server Actions
- **Autenticacao OAuth** com NextAuth.js e Google Provider
- **Modelagem de dados** com Prisma e PostgreSQL
- **Gerenciamento de estado** em Server Components
- **Validacao de dados** com Zod
- **Estilizacao moderna** com Tailwind CSS
- **Deploy continuo** com Vercel integrado ao GitHub
- **Boas praticas** de organizacao de codigo e componentizacao

## Melhorias Futuras (Ideias)

- [ ] Notificacoes/lembretes
- [ ] Exportar dados (CSV/JSON)
- [ ] Tema claro/escuro
- [ ] Compartilhar progresso
- [ ] PWA (Progressive Web App)
- [ ] Metas personalizadas por habito

## Licenca

Este projeto foi desenvolvido para fins educacionais.

---

Desenvolvido por [Maria do Socorro Marques](https://github.com/socorromarques-tech)
