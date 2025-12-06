# Sistema de Portal Imobiliário - Documentação Completa

## 🎯 Visão Geral

Sistema completo de gerenciamento de imóveis para corretores, desenvolvido com Next.js 14+, TypeScript, Prisma ORM e PostgreSQL. O sistema permite que corretores cadastrem e gerenciem seus imóveis, recebam leads diretamente dos anúncios, e tenham suas próprias páginas públicas.

## 📋 Funcionalidades Implementadas

### ✅ Autenticação e Autorização
- Sistema de registro com validação completa
- Login com NextAuth e JWT
- Dois tipos de usuário: ADMIN e CORRETOR
- Proteção de rotas com middleware
- Controle de acesso baseado em roles

### ✅ Portal do Corretor (`/corretor`)
**Dashboard:**
- Total de imóveis cadastrados
- Imóveis ativos vs inativos
- Total de leads recebidos
- Últimos leads com detalhes

**Gestão de Imóveis:**
- Criar novos imóveis (venda/aluguel)
- Editar imóveis existentes
- Deletar imóveis
- Campos: título, descrição, tipo, valor, endereço, cidade, estado, CEP

**Gestão de Leads:**
- Visualizar todos os leads recebidos
- Informações: nome, email, telefone, imóvel de interesse, mensagem
- Ordenação por data de recebimento

**Perfil:**
- Visualização de dados do corretor

### ✅ Portal Administrativo (`/admin`)
**Dashboard:**
- Total de corretores cadastrados
- Corretores ativos
- Corretores pendentes de aprovação
- Total de imóveis no sistema

**Gestão de Corretores:**
- Listar todos os corretores
- Aprovar/desaprovar corretores
- Ativar/desativar contas
- Ver estatísticas individuais (total de imóveis e leads)

**Gestão de Imóveis:**
- Visualizar todos os imóveis do sistema
- Filtrar por corretor
- Ver status de cada imóvel

**Gestão de Leads:**
- Visualizar todos os leads do sistema
- Ver a qual corretor e imóvel cada lead pertence

### ✅ Páginas Públicas

**Home Page (`/`):**
- Lista de imóveis em destaque
- Design responsivo
- Links para páginas de imóveis e corretores

**Página do Imóvel (`/imovel/[id]`):**
- Detalhes completos do imóvel
- Galeria de imagens (estrutura preparada)
- Formulário "Tenho Interesse" para gerar leads
- Link para perfil do corretor
- Contador de visualizações

**Página do Corretor (`/corretor/[slug]`):**
- Perfil público do corretor
- Lista de todos os imóveis ativos do corretor
- Informações de contato
- Bio e foto (estrutura preparada)

## 🗂️ Estrutura de Arquivos

```
src/
├── app/
│   ├── (public)/              # Rotas públicas (não protegidas)
│   │   ├── imovel/[id]/       # Página individual do imóvel
│   │   └── corretor/[slug]/   # Página pública do corretor
│   │
│   ├── (auth)/                # Autenticação
│   │   ├── login/             # Página de login
│   │   └── register/          # Página de cadastro
│   │
│   ├── (corretor)/            # Portal do corretor (protegido)
│   │   ├── layout.tsx         # Layout com navegação
│   │   └── corretor/
│   │       ├── dashboard/     # Dashboard do corretor
│   │       ├── imoveis/       # Gestão de imóveis
│   │       │   └── novo/      # Criar novo imóvel
│   │       ├── leads/         # Leads recebidos
│   │       └── perfil/        # Perfil do corretor
│   │
│   ├── (admin)/               # Portal admin (protegido)
│   │   ├── layout.tsx         # Layout com navegação
│   │   └── admin/
│   │       ├── dashboard/     # Dashboard admin
│   │       ├── corretores/    # Gestão de corretores
│   │       ├── imoveis/       # Ver todos os imóveis
│   │       └── leads/         # Ver todos os leads
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth API route
│   │   └── imoveis/[id]/      # API para buscar imóvel
│   │
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Home page
│
├── components/
│   └── ui/                    # Componentes reutilizáveis
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
│
├── server/
│   └── actions/               # Server Actions do Next.js
│       ├── admin.ts           # Ações administrativas
│       ├── auth.ts            # Registro de usuários
│       ├── imoveis.ts         # CRUD de imóveis
│       └── leads.ts           # Gestão de leads
│
├── lib/
│   ├── auth-options.ts        # Configuração NextAuth
│   ├── auth.ts                # Utilitários de autenticação
│   └── prisma.ts              # Cliente Prisma
│
├── types/
│   └── next-auth.d.ts         # Types do NextAuth
│
└── middleware.ts              # Proteção de rotas

prisma/
├── schema.prisma              # Schema do banco de dados
└── seed.ts                    # Script de população
```

## 🗄️ Schema do Banco de Dados

### Models

**User**
- id (String, CUID)
- email (String, único)
- password (String, hash bcrypt)
- name (String)
- role (UserRole: ADMIN | CORRETOR)
- active (Boolean, default: true)
- timestamps (createdAt, updatedAt)

**CorretorProfile**
- id (String, CUID)
- userId (String, FK → User, único)
- slug (String, único) - usado na URL pública
- bio (Text, opcional)
- phone (String, opcional)
- photo (String, opcional)
- approved (Boolean, default: false)
- timestamps (createdAt, updatedAt)

**Admin**
- id (String, CUID)
- userId (String, FK → User, único)
- timestamps (createdAt, updatedAt)

**Imovel**
- id (String, CUID)
- corretorId (String, FK → CorretorProfile)
- titulo (String)
- descricao (Text)
- tipo (ImovelTipo: VENDA | ALUGUEL)
- status (ImovelStatus: ATIVO | INATIVO | VENDIDO | ALUGADO)
- valor (Decimal)
- endereco (String)
- cidade (String)
- estado (String)
- cep (String, opcional)
- fotos (String[], array)
- views (Int, default: 0)
- timestamps (createdAt, updatedAt)

**Lead**
- id (String, CUID)
- imovelId (String, FK → Imovel)
- corretorId (String, FK → CorretorProfile)
- name (String)
- email (String)
- phone (String)
- message (Text, opcional)
- createdAt (DateTime)

### Relacionamentos
- Um User pode ter um CorretorProfile ou um Admin
- Um CorretorProfile tem vários Imoveis
- Um CorretorProfile recebe vários Leads
- Um Imovel pertence a um CorretorProfile
- Um Imovel pode gerar vários Leads
- Um Lead pertence a um Imovel e um CorretorProfile

## 🔐 Segurança

### Implementado:
1. **Senhas:** Hash bcrypt com salt rounds = 12
2. **Autenticação:** JWT via NextAuth
3. **Sessões:** Strategy JWT (sem DB de sessões)
4. **Rotas Protegidas:** Middleware do NextAuth
5. **Validação:** Zod schemas em todas as actions
6. **Autorização:** Verificação de role e ownership

### Regras de Acesso:
- Visitantes: acesso apenas a páginas públicas
- Corretores: acesso ao próprio portal e dados
- Admins: acesso total ao sistema
- Leads aparecem apenas para o corretor dono do imóvel

## 🚀 Como Executar

### 1. Pré-requisitos
```bash
Node.js 18+
PostgreSQL
npm ou yarn
```

### 2. Instalação
```bash
git clone <repository>
cd corretorimoveis
npm install
```

### 3. Configuração
Crie um arquivo `.env` baseado no `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/corretorimoveis"
NEXTAUTH_SECRET="seu-secret-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database
```bash
# Gerar o Prisma Client
npm run db:generate

# Criar tabelas no banco
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

### 5. Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### 6. Acessar
```
http://localhost:3000
```

## 👥 Credenciais de Teste

Após executar o seed:

**Admin:**
- Email: admin@example.com
- Senha: 123456

**Corretor 1:**
- Email: joao@example.com
- Senha: 123456
- Slug: joao-silva

**Corretor 2:**
- Email: maria@example.com
- Senha: 123456
- Slug: maria-santos

## 📝 Scripts NPM

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run start         # Servidor de produção
npm run lint          # Linter
npm run db:generate   # Gerar Prisma Client
npm run db:push       # Sincronizar schema com DB
npm run db:seed       # Popular banco com dados
npm run db:studio     # Abrir Prisma Studio (GUI)
```

## 🎨 Design

### Componentes UI
- Button: 3 variantes (primary, secondary, danger)
- Input: com label e erro
- Card: container padrão

### Cores
- Primary: Blue (blue-600)
- Secondary: Gray (gray-200)
- Danger: Red (red-600)
- Success: Green (green-600)

### Layout
- Responsivo (mobile-first)
- Grid system do Tailwind
- Navegação com header sticky

## 🔄 Fluxos Principais

### Fluxo de Cadastro
1. Visitante acessa `/register`
2. Preenche formulário
3. Seleciona tipo (Corretor/Admin)
4. Sistema cria User + Profile correspondente
5. Redirecionamento para login

### Fluxo de Lead
1. Visitante acessa imóvel (`/imovel/[id]`)
2. Clica em "Tenho Interesse"
3. Preenche formulário de contato
4. Lead é criado e associado ao corretor
5. Corretor vê lead no seu portal

### Fluxo de Imóvel
1. Corretor acessa `/corretor/imoveis/novo`
2. Preenche dados do imóvel
3. Imóvel é criado com status ATIVO
4. Aparece na listagem pública
5. Slug do corretor vincula ao imóvel

## 🚧 Próximas Implementações Sugeridas

### Prioridade Alta:
1. Upload de imagens (Cloudinary)
2. Edição de imóveis
3. Filtros e busca de imóveis
4. Dashboard com gráficos (Chart.js)

### Prioridade Média:
5. Notificações por email (Resend)
6. WhatsApp integration
7. Planos e assinaturas (Stripe)
8. Destaques de imóveis

### Prioridade Baixa:
9. Favoritos de imóveis
10. Comparar imóveis
11. Tours virtuais
12. Calculadora de financiamento

## 🐛 Troubleshooting

### Erro: Database not found
```bash
# Criar o banco manualmente no PostgreSQL
createdb corretorimoveis
npm run db:push
```

### Erro: Prisma Client not generated
```bash
npm run db:generate
```

### Erro: NextAuth callback URL
- Verificar NEXTAUTH_URL no .env
- Deve corresponder ao domínio usado

### Build Error: Can't reach database
- Durante o build, as páginas dinâmicas não precisam de DB
- Todas as páginas que usam DB estão marcadas com `export const dynamic = 'force-dynamic'`

## 📖 Referências

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 Licença

Este projeto é um exemplo educacional de sistema SaaS para corretores.
