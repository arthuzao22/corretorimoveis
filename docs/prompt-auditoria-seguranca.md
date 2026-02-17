# 🔒 PROMPT: Auditoria Completa de Segurança, Endpoints, Melhorias e Novas Funcionalidades

## 📋 CONTEXTO DO PROJETO

Você é um **Senior Security Engineer e Full-Stack Architect** auditando uma aplicação **Next.js 16 (App Router)** de gestão imobiliária chamada **CorretorImoveis**. O sistema é um CRM para corretores de imóveis com as seguintes características:

### Stack Tecnológica
- **Framework**: Next.js 16 com App Router
- **Linguagem**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM 5.22
- **Auth**: NextAuth.js 4 (Credentials Provider, JWT Strategy)
- **Storage**: Vercel Blob
- **UI**: Tailwind CSS 4 + Lucide React + Framer Motion
- **Validação**: Zod 4
- **Drag & Drop**: @hello-pangea/dnd
- **Charts**: Recharts
- **Maps**: Google Maps JS API Loader

### Roles do Sistema
1. **ADMIN** - Gerencia todo o sistema (corretores, imóveis, leads, landing pages)
2. **CORRETOR** - Gerencia seus próprios imóveis, leads, kanban, landing page

---

## 📂 ESTRUTURA ATUAL DO PROJETO

```
src/
├── app/
│   ├── (admin)/admin/
│   │   ├── corretores/page.tsx       # Lista de corretores
│   │   ├── dashboard/page.tsx        # Dashboard admin
│   │   ├── imoveis/page.tsx          # Todos os imóveis
│   │   ├── landings/page.tsx         # Lista landing pages
│   │   ├── landings/[corretorId]/page.tsx  # Editar landing
│   │   ├── leads/page.tsx            # Todos os leads
│   │   ├── usuarios/page.tsx         # Gestão de usuários
│   │   └── layout.tsx                # Layout admin
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login
│   │   ├── register/page.tsx         # Registro
│   │   └── signout/page.tsx          # Logout
│   │
│   ├── (corretor)/corretor/
│   │   ├── calendario/page.tsx       # Calendário
│   │   ├── dashboard/page.tsx        # Dashboard corretor
│   │   ├── imoveis/page.tsx          # Meus imóveis
│   │   ├── imoveis/novo/page.tsx     # Cadastrar imóvel
│   │   ├── imoveis/venda/page.tsx    # Imóveis venda
│   │   ├── imoveis/aluguel/page.tsx  # Imóveis aluguel
│   │   ├── imoveis/[id]/editar/page.tsx  # Editar imóvel
│   │   ├── kanban/page.tsx           # Kanban principal
│   │   ├── kanban/analytics/page.tsx # Analytics kanban
│   │   ├── kanban/editor/page.tsx    # Editor do board
│   │   ├── leads/page.tsx            # Meus leads
│   │   ├── minha-landing/page.tsx    # Minha landing page
│   │   ├── perfil/page.tsx           # Meu perfil
│   │   └── layout.tsx                # Layout corretor
│   │
│   ├── (public)/
│   │   ├── corretor/[slug]/page.tsx  # Perfil público do corretor
│   │   ├── imoveis/page.tsx          # Listagem pública de imóveis
│   │   └── imovel/[id]/page.tsx      # Detalhe público do imóvel
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   ├── cidades/route.ts             # GET cidades (SEM AUTH!)
│   │   ├── eventos/route.ts             # GET + POST eventos
│   │   ├── eventos/[id]/route.ts        # GET + PUT + DELETE evento
│   │   ├── imoveis/route.ts             # GET imóveis (COM AUTH)
│   │   ├── imoveis/[id]/route.ts        # GET imóvel por ID (SEM AUTH!)
│   │   ├── imovel-status/route.ts       # GET status config (SEM AUTH!)
│   │   ├── leads/route.ts               # GET leads (COM AUTH)
│   │   └── upload/route.ts              # POST upload (COM AUTH)
│   │
│   ├── lp/[slug]/page.tsx              # Landing page por slug
│   └── page.tsx                         # Homepage
│
├── server/
│   ├── actions/
│   │   ├── admin.ts            # getAllCorretores, approveCorretor, toggleUserActive, getAllImoveisAdmin, promoteUserToAdmin, demoteAdminToCorretor
│   │   ├── auth.ts             # registerUser
│   │   ├── comments.ts         # createComment, getLeadComments, deleteComment
│   │   ├── dashboard.ts        # getDashboardMetrics
│   │   ├── imoveis.ts          # createImovel, updateImovel, deleteImovel, getMyImoveis, getImovelById
│   │   ├── kanban.ts           # getKanbanBoard, getKanbanColumns, moveLeadToColumn, bulkMoveLeads, createColumn, updateColumn, deleteColumn, reorderColumns, getKanbanPermissions, updateKanbanPermissions
│   │   ├── kanban-analytics.ts # getKanbanMetrics
│   │   ├── landing.ts          # getAllLandings, getLandingByCorretor, createLandingBloco, updateLandingBloco, deleteLandingBloco, reorderLandingBlocos, toggleLandingAtiva, getPublicLanding, createLeadFromLanding
│   │   ├── leads.ts            # createLead, createLeadFromKanban, getMyLeads, getAllLeads, updateLeadStatus, updateLeadTemperatura, updateLeadScore, bulkUpdateTemperatura, bulkDeleteLeads
│   │   ├── message-templates.ts # createMessageTemplate, getMyMessageTemplates, updateMessageTemplate, deleteMessageTemplate
│   │   ├── profile.ts          # updateCorretorProfile, getMyProfile, checkSlugAvailability
│   │   ├── tags.ts             # createTag, updateTag, deleteTag, getTags, addTagToLead, removeTagFromLead
│   │   └── timeline.ts         # addTimelineEntry, getLeadTimeline
│   │
│   └── repositories/
│       ├── imovel.repository.ts
│       └── lead.repository.ts
│
├── lib/
│   ├── auth.ts              # hashPassword, verifyPassword (bcryptjs)
│   ├── auth-helpers.ts      # requireAuth, requireCorretorAuth, requireAdminAuth, validateResourceOwnership
│   ├── auth-options.ts      # NextAuth config (JWT, 30 dias)
│   ├── corretor.ts          # Helper para buscar corretor por slug
│   ├── design-system.ts     # Sistema de design
│   ├── loading-strategy.ts  # Estratégia de loading
│   ├── prisma.ts            # Prisma client instance
│   ├── responsive.ts        # Helpers responsivos
│   ├── storage.ts           # Vercel Blob upload/delete/validate
│   ├── utils/               # Utilitários (serializers, etc)
│   └── validators/          # Validações
│
├── middleware.ts             # Middleware de auth + role-based routing
├── components/              # 78 componentes React
├── hooks/                   # 9 custom hooks
├── context/                 # 1 context
└── types/                   # 3 type files
```

---

## 🎯 INSTRUÇÕES DE EXECUÇÃO

Você DEVE executar as seguintes ações sequencialmente e de forma exaustiva:

---

## FASE 1: AUDITORIA DE SEGURANÇA 🔴

### 1.1 Vulnerabilidades Críticas nos Endpoints API

Analise CADA endpoint e identifique:

#### a) Endpoints SEM autenticação (PÚBLICO) — Verifique se DEVEM ser públicos:
- `GET /api/cidades/route.ts` — Retorna lista de cidades. **SEM AUTH.**
- `GET /api/imovel-status/route.ts` — Retorna lista de status. **SEM AUTH.**
- `GET /api/imoveis/[id]/route.ts` — Retorna detalhes do imóvel + incrementa views. **SEM AUTH.**

**AÇÃO**: Para cada um, determine:
1. Esse endpoint DEVERIA ter autenticação? (Se sim, implementar)
2. Há risco de DoS/abuso sem rate limiting?
3. Há vazamento de dados sensíveis na resposta?

#### b) Vulnerabilidades específicas a verificar em TODOS os endpoints e server actions:

| Vulnerabilidade | O que verificar |
|---|---|
| **IDOR (Insecure Direct Object Reference)** | Um corretor A pode acessar/modificar dados do corretor B manipulando IDs? |
| **Privilege Escalation** | Um CORRETOR pode executar ações de ADMIN? |
| **Mass Assignment** | O spread operator `...data` permite campos não autorizados? |
| **Input Validation** | Todos os inputs são validados com Zod ANTES de uso? |
| **SQL Injection** | Prisma previne, mas verificar `where: any` e queries dinâmicas |
| **Rate Limiting** | Endpoints públicos têm proteção contra abuso? |
| **CSRF** | Server Actions usam tokens CSRF nativos do Next.js? |
| **XSS** | Dados do usuário são sanitizados antes de render? Especialmente `description`, `message`, `texto`, `observacao` |
| **Information Disclosure** | Mensagens de erro vazam stack traces ou dados internos? |
| **Broken Authentication** | Token JWT de 30 dias sem refresh — risco se token for comprometido? |
| **File Upload** | Validação de MIME type é suficiente? Magic bytes são verificados? |

#### c) Problemas específicos já identificados para você validar/corrigir:

1. **`GET /api/imoveis/[id]/route.ts`** — Endpoint público que INCREMENTA VIEWS sem proteção.
   - Um bot pode inflar artificialmente as visualizações
   - **Solução proposta**: IP-based rate limiting ou cookie-based dedup
   
2. **`createLeadFromLanding` em `landing.ts`** — É um server action PÚBLICO que cria leads.
   - Não tem CAPTCHA, rate limiting, honeypot, ou qualquer proteção contra spam
   - **Solução proposta**: Implementar reCAPTCHA v3, honeypot field, rate limit por IP

3. **`createLead` em `leads.ts`** — Verifica se imovelId pertence ao corretor, mas NÃO verifica se o lead está sendo atribuído ao corretor correto via `corretorSlug`
   
4. **Middleware (`middleware.ts`)** — O `/corretor/kanban` e `/corretor/perfil` NÃO estão no matcher!
   - VERIFICAR: Essas rotas estão desprotegidas?

5. **`updateImovel` em `imoveis.ts`** — Usa `...data` spread. Pode receber campos inesperados como `corretorId` no payload e transferir o imóvel.
   - **Solução proposta**: Whitelist explícita de campos permitidos

6. **`approveCorretor` em `admin.ts`** — NÃO usa `revalidatePath`. Dados ficam stale após aprovação.

7. **JWT Session de 30 dias SEM mecanismo de invalidação** — Se um usuário é desativado (`active: false`), o JWT continua válido por até 30 dias.
   - **Solução proposta**: Checar `user.active` no callback JWT ou usar session com database

### 1.2 Checklist de Segurança por Server Action

Para CADA server action em `src/server/actions/`, verifique e reporte:

```
[ ] Verifica autenticação (session check)
[ ] Verifica role correto (ADMIN vs CORRETOR)
[ ] Verifica ownership do recurso (corretorId)
[ ] Valida TODOS os inputs com Zod
[ ] Não permite mass assignment
[ ] Não vaza dados sensíveis na resposta
[ ] Usa revalidatePath quando necessário
[ ] Trata erros sem expor informação interna
```

---

## FASE 2: ENDPOINTS NÃO UTILIZADOS / REDUNDANTES 🟡

### 2.1 Análise de Uso dos Endpoints API

Para CADA endpoint em `/api/`, determine:

| Endpoint | Método | Chamado por qual componente/página? | Pode ser substituído por Server Action? | Recomendação |
|---|---|---|---|---|
| `/api/cidades` | GET | Filtros de imóveis | Sim, pode ser Server Action | AVALIAR migração |
| `/api/imovel-status` | GET | Filtros de imóveis | Sim, pode ser Server Action | AVALIAR migração |
| `/api/imoveis` | GET | Listagem de imóveis | Já tem `getMyImoveis` server action | POSSÍVEL DUPLICATA |
| `/api/imoveis/[id]` | GET | Detalhe público do imóvel | Necessário para público | MANTER |
| `/api/leads` | GET | Listagem de leads | Já tem `getMyLeads` server action | POSSÍVEL DUPLICATA |
| `/api/eventos` | GET/POST | Calendário | **Não tem** server action equivalente | AVALIAR migração |
| `/api/eventos/[id]` | GET/PUT/DELETE | CRUD eventos | **Não tem** server action equivalente | AVALIAR migração |
| `/api/upload` | POST | Upload de imagens | Storage lib existe, mas API é usada no client | MANTER |

**AÇÃO**:
1. Identifique quais componentes/páginas chamam cada endpoint (grep por `fetch`, `axios`, `useSWR`, etc)
2. Para endpoints que têm Server Action equivalente, verifique se AMBOS são usados ou se um é dead code
3. Recomende consolidação (preferir Server Actions sobre API Routes quando possível)

### 2.2 Server Actions Potencialmente Não Utilizadas

Verifique se todas as server actions têm chamadores:

```
# Busque referências de import/uso para cada action:
- getAllLeads()              # Admin usa? Ou apenas API route?
- bulkUpdateTemperatura()    # Implementado no frontend?
- bulkDeleteLeads()          # Implementado no frontend?
- updateLeadScore()          # Implementado no frontend?
- createMessageTemplate()    # Feature de templates funcional?
- getMyMessageTemplates()    # Feature de templates funcional?
- updateMessageTemplate()    # Feature de templates funcional?
- deleteMessageTemplate()    # Feature de templates funcional?
- checkSlugAvailability()    # Chamado em tempo real no form?
- addTimelineEntry()         # Chamado manualmente ou automático?
- toggleLandingAtiva()       # Implementado na UI?
```

---

## FASE 3: MELHORIAS PROPOSTAS 🟢

### 3.1 Melhorias de Segurança (OBRIGATÓRIAS)

1. **Rate Limiting Global**
   - Implementar rate limiting em TODOS os endpoints públicos
   - Usar `next-rate-limit` ou implementação custom com Upstash Redis
   - Limites sugeridos:
     - `/api/cidades`: 100 req/min
     - `/api/imoveis/[id]`: 30 req/min (por IP)
     - `createLeadFromLanding`: 5 req/min (por IP)
     - `registerUser`: 3 req/min (por IP)
     - `/api/upload`: 10 req/min (por user)

2. **Proteção Anti-Spam nos Formulários Públicos**
   - Honeypot fields
   - reCAPTCHA v3 ou Turnstile (Cloudflare)
   - Validação de tempo mínimo de preenchimento
   
3. **Session Validation Aprimorada**
   - Adicionar verificação de `user.active` no callback `jwt` do NextAuth
   - Implementar mecanismo de invalidação de sessão
   - Reduzir `maxAge` do JWT para 7 dias com refresh token

4. **Sanitização de Input**
   - Implementar sanitização de HTML em todos os campos `@db.Text`
   - Usar DOMPurify ou similar para `description`, `message`, `texto`, `observacao`
   - Prevenir XSS stored

5. **Content Security Policy (CSP)**
   - Adicionar headers CSP no `next.config.js`
   - Configurar `X-Content-Type-Options: nosniff`
   - Configurar `X-Frame-Options: DENY`
   - Configurar `Strict-Transport-Security`

6. **Validação de Upload Aprimorada**
   - Verificar magic bytes além do MIME type
   - Implementar antivirus scanning (ClamAV ou similar)
   - Limite máximo de uploads por dia por usuário

### 3.2 Melhorias de Código e Arquitetura

1. **Consolidar API Routes → Server Actions**
   - Migrar `/api/eventos` para server actions (padrão do resto do app)
   - Criar `src/server/actions/eventos.ts` com:
     - `createEvento()`
     - `updateEvento()`
     - `deleteEvento()`
     - `getEventos()`
     - `getEventoById()`

2. **Implementar Repository Pattern Consistente**
   - Apenas 2 repositories existem (`imovel.repository.ts`, `lead.repository.ts`)
   - Criar repositories para: `evento`, `kanban`, `landing`, `tag`, `comment`
   - Mover lógica de query dos server actions para repositories

3. **Implementar Middleware de Logging/Audit**
   - Atualmente os logs são `console.log` — não persistidos
   - Implementar sistema de audit log no banco de dados
   - Registrar: quem fez o quê, quando, com quais dados
   - Criar tabela `AuditLog` no Prisma schema

4. **Error Handling Centralizado**
   - Criar classe `AppError` com códigos de erro padronizados
   - Implementar error boundary global
   - Retornar erros no formato padrão: `{ success, error, code, details }`

5. **Tipagem Forte**
   - Remover todos os `any` types (há vários em `where: any`, `data: any`)
   - Usar `Prisma.InputJsonValue` ao invés de `Json?` genérico
   - Implementar tipos discriminados para as respostas das actions

6. **Caching Strategy**
   - Implementar `unstable_cache` do Next.js para dados pouco mutáveis
   - Cache para: cidades, status configs, kanban columns
   - Stratégia sugerida: `revalidate: 3600` para dados de referência

7. **Otimização de Performance no Kanban Analytics**
   - `getKanbanMetrics` faz N+1 queries por coluna + N+1 para cada move
   - Usar `groupBy` do Prisma ao invés de múltiplos `count`
   - Implementar aggregation queries

### 3.3 Melhorias de UX/Frontend

1. **Tratamento de Erros no Frontend**
   - Implementar toast notifications globais
   - Loading states consistentes em todos os formulários
   - Retry automático em caso de falha de rede

2. **Otimistic Updates no Kanban**
   - Mover leads no Kanban sem esperar resposta do servidor
   - Rollback em caso de erro

3. **Busca Global Aprimorada**
   - Implementar debounced search
   - Buscar em imóveis + leads + eventos simultaneamente
   - Implementar `/api/search` unificado

---

## FASE 4: NOVAS FUNCIONALIDADES 🔵

### 4.1 Funcionalidades Prioritárias (P1 — Alto Impacto)

#### 4.1.1 Sistema de Notificações
```
Criar sistema de notificações em tempo real:

Tabela: Notification
- id, userId, type, title, message, read, metadata, createdAt

Tipos de notificação:
- Novo lead recebido
- Lead agendou visita
- Evento próximo (reminder)
- Imóvel com muitas views
- Corretor aprovado (admin)
- Lembrete de follow-up

Implementação:
- Server Action: createNotification, markAsRead, getUnreadCount, getNotifications
- Componente: NotificationBell (header) com dropdown
- Polling: verificar a cada 30s por novas notificações
- Futuro: migrar para WebSocket/SSE
```

#### 4.1.2 Sistema de Relatórios e Exportação
```
Criar módulo de relatórios para admin e corretor:

Relatórios:
- Performance de corretor (leads x conversão x tempo médio)
- Ranking de corretores
- Imóveis mais visualizados
- Leads por origem
- Funil de vendas detalhado
- Análise de sazonalidade

Exportação:
- PDF (usando @react-pdf/renderer)
- Excel/CSV (usando xlsx/papaparse)
- Filtros por período, corretor, tipo

Server Actions:
- generatePerformanceReport()
- generateLeadFunnelReport()
- exportReportToPDF()
- exportReportToCSV()

Rota: /admin/relatorios e /corretor/relatorios
```

#### 4.1.3 Integração WhatsApp
```
Implementar integração com WhatsApp Business API:

Funcionalidades:
- Envio de mensagens automáticas no cadastro de lead
- Templates de mensagem pré-definidos (já existe no banco!)
- Botão "Enviar via WhatsApp" no detalhe do lead
- Log de mensagens enviadas na timeline
- Link wa.me/ com mensagem pré-preenchida

Implementação inicial (sem API oficial):
- Gerar link wa.me/ com texto do template selecionado
- Registrar na timeline que mensagem foi enviada
- Contador de WhatsApp enviados por lead

Implementação avançada (com API):
- Configuração de WhatsApp Business API por corretor
- Webhooks para receber respostas
- Chatbot básico de triagem
```

#### 4.1.4 Sistema de Documentos
```
Criar gerenciamento de documentos por lead:

Tabela: LeadDocument
- id, leadId, corretorId, nome, tipo, url, tamanho, createdAt

Tipos de documento:
- Proposta, Contrato, Comprovante, RG/CPF, Outros

Funcionalidades:
- Upload de documentos por lead
- Organização por tipo
- Preview inline para PDFs e imagens
- Download individual e em lote
- Versionamento básico

Server Actions:
- uploadDocument()
- deleteDocument()
- getLeadDocuments()
```

### 4.2 Funcionalidades Extras (P2 — Médio Impacto)

#### 4.2.1 Sistema de Avaliação de Imóveis
```
- Calculadora de preço baseada em dados da região
- Comparativo com imóveis similares
- Histórico de preços
- Sugestão de precificação
```

#### 4.2.2 Portal do Cliente
```
- Área logada para o cliente final
- Visualizar imóveis favoritos
- Status da negociação
- Agendamento de visitas online
- Histórico de interações
```

#### 4.2.3 Dashboard Avançado com BI
```
- Gráficos de conversão de funil
- Heat maps de horários de captação
- Previsão de vendas (trend analysis)
- Métricas de NPS (satisfação do cliente)
```

#### 4.2.4 Automações do Kanban
```
- Mover lead automaticamente ao completar evento
- Enviar notificação ao entrar em coluna
- Escalar prioridade após X dias sem interação
- Auto-scoring baseado em ações do lead
```

#### 4.2.5 Multi-Imobiliária (Multi-Tenancy)
```
- Suporte a múltiplas imobiliárias
- Isolamento de dados por tenant
- Admin global vs Admin da imobiliária
- Dashboard consolidado
```

---

## FASE 5: PLANO DE EXECUÇÃO 📋

### Priorização (MoSCoW)

#### Must Have (Sprint 1-2)
- [ ] Corrigir TODAS as vulnerabilidades de segurança da Fase 1
- [ ] Implementar rate limiting nos endpoints públicos
- [ ] Adicionar autenticação no middleware para `/corretor/kanban` e `/corretor/perfil`
- [ ] Corrigir mass assignment no `updateImovel`
- [ ] Implementar validação de `user.active` no JWT callback
- [ ] Sanitizar inputs de texto rico
- [ ] Adicionar CSP headers

#### Should Have (Sprint 3-4)
- [ ] Consolidar API Routes → Server Actions (eventos)
- [ ] Sistema de notificações
- [ ] Relatórios e exportação básica
- [ ] Integração WhatsApp (links wa.me/)
- [ ] Caching de dados de referência

#### Could Have (Sprint 5-6)
- [ ] Sistema de documentos
- [ ] Automações do Kanban
- [ ] Dashboard avançado com BI
- [ ] Repository pattern completo

#### Won't Have (Backlog)
- [ ] Portal do cliente
- [ ] Multi-tenancy
- [ ] Chatbot WhatsApp
- [ ] Avaliação automatizada de imóveis

---

## 📌 REGRAS DE IMPLEMENTAÇÃO

1. **NUNCA quebre funcionalidade existente** — Todas as mudanças devem ser retrocompatíveis
2. **Siga os padrões existentes** — Use Server Actions, Zod, types, mesma estrutura de pastas
3. **Mantenha TypeScript strict** — Zero `any` types em código novo
4. **Teste manualmente** — Verifique que build compila sem erros após cada mudança
5. **Documente mudanças** — Atualize este documento conforme itens são concluídos
6. **Uma mudança por commit** — Commits atômicos e bem descritos
7. **Priorize segurança** — Correções de segurança antes de features novas
8. **Use `revalidatePath`** — Sempre que mutar dados em server actions
9. **Valide com Zod** — Todo input do usuário DEVE passar por schema Zod
10. **Sem console.log em produção** — Use sistema de logging adequado

---

## 📊 OUTPUT ESPERADO

Ao final da execução deste prompt, você deve entregar:

1. **Relatório de Vulnerabilidades** — Lista completa com severidade (CRITICAL, HIGH, MEDIUM, LOW)
2. **Mapa de Endpoints** — Tabela completa de uso/não-uso
3. **Código Corrigido** — Todas as correções de segurança implementadas
4. **Novas Features** — Implementadas conforme priorização
5. **Changelog** — Lista de todas as alterações feitas

---

*Prompt criado em: 2026-02-17*
*Versão: 1.0*
*Projeto: CorretorImoveis*
