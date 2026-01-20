# 🎯 Prompt: Melhoria do Sistema Kanban - CorretorImoveis

## Contexto do Projeto

Você está trabalhando em um **CRM Imobiliário** desenvolvido com Next.js 14+ (App Router), TypeScript, Prisma e PostgreSQL. O sistema possui um Kanban para gestão visual de leads.

### Stack Tecnológica
- **Framework**: Next.js 16 (Turbopack)
- **Linguagem**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js
- **UI**: Tailwind CSS + Componentes customizados

---

## 📊 Estado Atual do Kanban

### Funcionalidades Existentes
1. **Drag & Drop** - Movimentação visual de leads entre colunas
2. **Modal de Detalhes** - Clique no card abre modal com informações completas
3. **Sistema de Permissões (RBAC)** - Admin vs Corretor
4. **Analytics Dashboard** - Métricas e gráficos em `/corretor/kanban/analytics`
5. **Integração com Calendário** - Auto-progressão ao completar visitas
6. **Timeline de Atividades** - Histórico de movimentações
7. **Tags e Prioridades** - Badges visuais nos cards
8. **Indicador de Aging** - Alerta para leads > 7 dias na mesma coluna

### Arquivos Principais
```
src/components/kanban/
├── KanbanBoard.tsx      # Componente principal do board
├── KanbanColumn.tsx     # Coluna individual
├── KanbanCardModal.tsx  # Modal de detalhes do lead
└── LeadCard.tsx         # Card do lead (não encontrado)

src/server/actions/
├── kanban.ts            # CRUD de colunas, movimentação
└── kanban-analytics.ts  # Métricas e estatísticas

src/app/(corretor)/corretor/kanban/
├── page.tsx             # Página principal do Kanban
├── analytics/page.tsx   # Dashboard de analytics
└── editor/              # Editor de colunas
```

### Limitações Conhecidas
- ❌ N+1 Query no cálculo de tempo médio por coluna
- ❌ Sem atualizações em tempo real (requer refresh manual)
- ❌ Sem SLA timers por coluna
- ❌ Sem automações (regras de progressão automática)

---

## 🚀 Melhorias Solicitadas

### 1. UX/UI Improvements

#### 1.1 Cards de Lead Mais Informativos
- Adicionar **indicador visual de temperatura** (🔥 quente, 🟡 morno, ❄️ frio)
- Mostrar **valor do imóvel de interesse** no card
- Adicionar **foto do avatar** (iniciais ou placeholder)
- Exibir **próximo evento agendado** diretamente no card
- Badge de **WhatsApp enviado recentemente** (últimas 24h)

#### 1.2 Colunas Mais Inteligentes
- **Contador de valor total** (soma dos imóveis dos leads na coluna)
- **SLA Timer visual** - Barra de progresso mostrando tempo restante
- **Alertas visuais** quando coluna ultrapassa limite de leads
- **Collapse/Expand** para colunas finais (Ganho/Perdido)

#### 1.3 Filtros e Busca
- **Filtro por corretor** (admin vê todos, corretor vê os seus)
- **Busca por nome/email/telefone** do lead
- **Filtro por prioridade** (Baixa, Média, Alta, Urgente)
- **Filtro por período** de criação
- **Filtro por tags**

### 2. Funcionalidades Avançadas

#### 2.1 Automações
```typescript
// Exemplo de regra de automação
interface AutomationRule {
  id: string
  name: string
  trigger: 'TIME_IN_COLUMN' | 'EVENT_COMPLETED' | 'TAG_ADDED'
  condition: {
    columnId?: string
    hours?: number
    eventType?: EventoTipo
    tagId?: string
  }
  action: 'MOVE_TO_COLUMN' | 'ADD_TAG' | 'SEND_NOTIFICATION' | 'CREATE_TASK'
  targetColumnId?: string
  targetTagId?: string
  notificationMessage?: string
}
```

- Se lead ficar **> X horas** na coluna → Move para "Urgente"
- Se **visita completada** → Move para "Negociação"
- Se lead receber tag **"Sem Interesse"** → Move para "Perdido"
- Notificação quando lead **entra em coluna final**

#### 2.2 Mini-Kanban no Modal
- Dentro do modal do lead, exibir um **mini-selector de coluna**
- Permitir **mover diretamente** sem fechar o modal
- Mostrar **histórico de movimentações** com datas

#### 2.3 Bulk Actions
- **Selecionar múltiplos leads** (checkbox nos cards)
- **Mover em lote** para outra coluna
- **Adicionar tag em lote**
- **Excluir em lote** (com confirmação)

#### 2.4 Colaboração em Tempo Real
- **Indicador de quem está visualizando** o lead
- **Lock do card** enquanto outro usuário edita
- **Atualizações via polling** a cada 30 segundos
- (Futuro) WebSockets para updates instantâneos

### 3. Analytics Avançados

#### 3.1 Novos Gráficos
- **Funil de conversão** (leads que passaram por cada etapa)
- **Tempo médio de permanência** por coluna
- **Leads ganhos vs perdidos** por período
- **Performance por corretor** (apenas admin)
- **Heatmap de atividade** (horários mais movimentados)

#### 3.2 Exportação
- **Exportar para CSV/Excel** os dados do Kanban
- **Relatório PDF** com métricas do período
- **API para integração** com ferramentas externas

### 4. Integrações

#### 4.1 WhatsApp
- **Botão de envio direto** para WhatsApp no card
- **Registro automático** de mensagens enviadas na timeline
- **Templates de mensagem** por coluna

#### 4.2 E-mail
- **Templates de e-mail** pré-configurados
- **Envio automático** ao mover para certas colunas
- **Tracking de abertura** (se possível)

---

## 📋 Priorização Sugerida

### Fase 1 - Quick Wins (Alta prioridade, baixo esforço)
1. [ ] Filtros básicos (corretor, prioridade, busca)
2. [ ] Valor do imóvel no card
3. [ ] Contador de valor total na coluna
4. [ ] Mini-kanban no modal para mover rápido

### Fase 2 - UX Improvements (Média prioridade)
5. [ ] Collapse/Expand de colunas
6. [ ] Indicador de temperatura do lead
7. [ ] Próximo evento no card
8. [ ] Bulk select + mover em lote

### Fase 3 - Funcionalidades Avançadas (Futuro)
9. [ ] Sistema de automações
10. [ ] Analytics avançados + exportação
11. [ ] Integração WhatsApp
12. [ ] Colaboração em tempo real

---

## 🔧 Instruções para Implementação

Ao implementar cada melhoria:

1. **Siga os padrões existentes** do projeto (Server Actions, Zod validation)
2. **Use Server Components** por padrão, Client Components apenas quando necessário
3. **Aplique optimistic updates** para melhor UX em operações de drag-drop
4. **Mantenha tipagem TypeScript** estrita
5. **Documente alterações** em `/docs`
6. **Teste em dispositivos móveis** (responsividade)

### Exemplos de Código do Projeto

```typescript
// Server Action padrão
'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { z } from 'zod'

const schema = z.object({
  leadId: z.string(),
  columnId: z.string(),
})

export async function moveLeadToColumn(data: z.infer<typeof schema>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, error: 'Não autorizado' }
  
  // ... implementação
  
  revalidatePath('/corretor/kanban')
  return { success: true }
}
```

---

## ✅ Critérios de Aceitação

- [ ] Build sem erros de TypeScript (`npx tsc --noEmit`)
- [ ] Responsivo em mobile (min 375px)
- [ ] Otimizado para performance (sem console warnings)
- [ ] Compatível com tema existente (cores e estilos)
- [ ] Acessível (teclado, screen readers básico)

---

**Comece implementando a Fase 1** e solicite review antes de prosseguir para as próximas fases.
