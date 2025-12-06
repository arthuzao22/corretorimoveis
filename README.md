# Portal Imobiliário para Corretores

Sistema completo de gerenciamento de imóveis para corretores, desenvolvido com Next.js 14+, TypeScript, Prisma e PostgreSQL.

## 🚀 Funcionalidades

### Para Corretores
- ✅ Cadastro e autenticação
- ✅ Dashboard com métricas (imóveis, leads)
- ✅ CRUD completo de imóveis (venda/aluguel)
- ✅ Visualização de leads recebidos
- ✅ Perfil público personalizado

### Para Administradores
- ✅ Dashboard administrativo
- ✅ Gerenciamento de corretores
- ✅ Aprovação manual de corretores
- ✅ Visualização de todos os imóveis e leads
- ✅ Bloqueio/desbloqueio de contas

### Para Visitantes (Leads)
- ✅ Navegação pública de imóveis
- ✅ Visualização de perfis de corretores
- ✅ Envio de contatos diretos nos imóveis

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Autenticação:** NextAuth.js
- **Estilização:** Tailwind CSS
- **Validação:** Zod

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (public)/           # Rotas públicas
│   │   ├── imovel/[id]
│   │   └── corretor/[slug]
│   ├── (auth)/             # Autenticação
│   │   ├── login
│   │   └── register
│   ├── (corretor)/         # Portal do corretor
│   │   └── corretor/
│   │       ├── dashboard
│   │       ├── imoveis
│   │       ├── leads
│   │       └── perfil
│   ├── (admin)/            # Portal administrativo
│   │   └── admin/
│   │       ├── dashboard
│   │       ├── corretores
│   │       ├── imoveis
│   │       └── leads
│   └── api/                # API Routes
│       ├── auth/[...nextauth]
│       └── imoveis/[id]
├── components/
│   ├── ui/                 # Componentes reutilizáveis
│   └── forms/              # Formulários
├── server/
│   ├── actions/            # Server Actions
│   ├── repositories/       # Camada de dados
│   └── services/           # Lógica de negócio
├── lib/                    # Utilitários
└── types/                  # Definições TypeScript
```

## 🚀 Como Executar

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

### 2. Clone o repositório

```bash
git clone <repository-url>
cd corretorimoveis
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/corretorimoveis?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Configure o banco de dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Criar as tabelas no banco
npm run db:push

# Popular o banco com dados de exemplo
npm run db:seed
```

### 6. Execute o projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## 👤 Credenciais de Teste

Após executar o seed, você pode usar:

**Administrador:**
- Email: admin@example.com
- Senha: 123456

**Corretor 1:**
- Email: joao@example.com
- Senha: 123456

**Corretor 2:**
- Email: maria@example.com
- Senha: 123456

## 📊 Modelos de Dados

### User
- Autenticação e informações básicas
- Tipos: ADMIN, CORRETOR

### CorretorProfile
- Informações públicas do corretor
- Slug único para URL pública
- Aprovação manual por admin

### Imovel
- Informações completas do imóvel
- Tipos: VENDA, ALUGUEL
- Status: ATIVO, INATIVO, VENDIDO, ALUGADO

### Lead
- Contatos recebidos nos imóveis
- Vinculado a um imóvel e corretor

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT via NextAuth
- ✅ Middleware para proteção de rotas
- ✅ Validação de dados com Zod
- ✅ Controle de acesso baseado em roles

## 🚧 Próximas Funcionalidades

- [ ] Planos pagos por corretor
- [ ] Destaque de imóveis
- [ ] Integração com WhatsApp
- [ ] Upload de imagens (Cloudinary)
- [ ] Busca avançada de imóveis
- [ ] Favoritos e comparação de imóveis
- [ ] Métricas e relatórios

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Compila o projeto para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
npm run db:generate  # Gera o cliente Prisma
npm run db:push      # Sincroniza o schema com o banco
npm run db:seed      # Popula o banco com dados de teste
npm run db:studio    # Abre o Prisma Studio
```

## 📄 Licença

Este projeto foi criado como exemplo de implementação de um sistema SaaS para corretores de imóveis.
