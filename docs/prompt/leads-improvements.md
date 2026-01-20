# 🎯 Prompt: Melhorias na Tela de Leads - CRM Avançado

## Contexto do Projeto

**CorretorImoveis** - Sistema CRM Imobiliário com gestão visual de leads.

### Stack Tecnológica
- **Framework**: Next.js 16+ (App Router + Turbopack)
- **Linguagem**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS

---

## 📊 Estado Atual

### Arquivos Principais
```
src/app/(corretor)/corretor/leads/page.tsx      # Página principal
src/components/leads/LeadsList.tsx              # Lista com paginação
src/components/leads/LeadDrawer.tsx             # Drawer de detalhes
src/components/leads/LeadFilters.tsx            # Filtros de busca
src/components/ui/LeadTable.tsx                 # Tabela de leads
```

### Funcionalidades Atuais
- ✅ Tabela básica com leads
- ✅ Filtros por coluna Kanban, prioridade, origem e data
- ✅ Drawer lateral com detalhes do lead
- ✅ Sistema de tags
- ✅ Timeline de atividades
- ✅ Paginação com "Carregar mais"

### Limitações
- ❌ Sem busca por texto (nome, email, telefone)
- ❌ Sem indicador de temperatura/interesse
- ❌ Sem score de qualificação
- ❌ Sem seleção/ações em lote
- ❌ Sem visualização alternativa (cards)
- ❌ Ações isoladas (precisa abrir drawer para tudo)

---

## 🚀 Melhorias Solicitadas

### 1. Novos Campos no Banco de Dados

```prisma
model Lead {
  // ... campos existentes ...
  
  // NOVOS CAMPOS
  score           Int       @default(0)       // Score 0-100
  temperatura     String    @default("morno") // 'quente' | 'morno' | 'frio'
  ultimaInteracao DateTime?                   // Última interação
  proximoContato  DateTime?                   // Lembrete follow-up
  valorInteresse  Decimal?  @db.Decimal(12,2) // Budget do cliente
  cpf             String?                     // Identificação
  dataNascimento  DateTime?                   // Aniversário
  preferencias    Json?                       // { tipo, regiao, faixa }
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_lead_crm_fields
```

---

### 2. LeadTable Aprimorada

**Melhorias visuais:**
- ✅ **Avatar com iniciais** - Círculo colorido com letras do nome
- ✅ **Indicador de temperatura** - 🔥 Quente | 🟡 Morno | ❄️ Frio
- ✅ **Tags na tabela** - Badges coloridos inline
- ✅ **Próximo evento** - Mostrar evento agendado
- ✅ **Destaque aging** - Leads sem contato há 3+ dias
- ✅ **Checkbox seleção** - Para ações em lote

**Ações rápidas na tabela:**
```tsx
<div className="flex gap-2">
  <button title="WhatsApp">
    <MessageCircle className="w-4 h-4 text-green-600" />
  </button>
  <button title="Ligar">
    <Phone className="w-4 h-4 text-blue-600" />
  </button>
  <button title="Email">
    <Mail className="w-4 h-4 text-purple-600" />
  </button>
</div>
```

---

### 3. Busca e Filtros Avançados

**Novos filtros:**
- 🔍 **Busca textual** - Por nome, email ou telefone
- 🏷️ **Filtro por tags** - Multi-select
- 🌡️ **Filtro por temperatura** - Quente/Morno/Frio
- 📅 **Filtro por período** - Últimos 7/30/90 dias
- ⬇️ **Ordenação** - Recentes, antigos, score alto
- 🧹 **Limpar filtros** - Botão para resetar

**Exemplo:**
```tsx
<input
  type="text"
  placeholder="Buscar por nome, email ou telefone..."
  className="w-full pl-10 pr-4 py-2 border rounded-lg"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

---

### 4. Ações em Lote

**Componente flutuante quando há seleção:**
```
┌────────────────────────────────────────────────────────┐
│  5 selecionados  │ Mover │ Tag │ Exportar │ Excluir │ ✕ │
└────────────────────────────────────────────────────────┘
```

**Ações disponíveis:**
- **Mover** - Para outra coluna do Kanban
- **Adicionar Tag** - Em todos selecionados
- **Alterar Temperatura** - Quente/Morno/Frio
- **Exportar CSV** - Download dos selecionados
- **Excluir** - Com confirmação

---

### 5. Mini-Kanban no Drawer

Adicionar seção no LeadDrawer para movimentação rápida:

```tsx
<div className="border-t pt-4 mt-4">
  <h4 className="text-sm font-medium mb-2">Mover para:</h4>
  <div className="flex gap-2 flex-wrap">
    {columns.map(col => (
      <button
        key={col.id}
        onClick={() => handleMove(col.id)}
        disabled={lead.kanbanColumnId === col.id}
        className="px-3 py-1.5 rounded-lg text-sm border"
        style={{ borderColor: col.color }}
      >
        {col.name}
      </button>
    ))}
  </div>
</div>
```

---

### 6. Score e Temperatura Visual

**Score de Interesse (0-100):**
```tsx
<div className="flex items-center gap-2">
  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-red-500 to-green-500"
      style={{ width: `${score}%` }}
    />
  </div>
  <span className="text-sm font-medium">{score}</span>
</div>
```

**Temperatura:**
```tsx
const temperaturas = {
  quente: { emoji: '🔥', label: 'Quente', color: 'bg-red-100 text-red-700' },
  morno: { emoji: '🟡', label: 'Morno', color: 'bg-yellow-100 text-yellow-700' },
  frio: { emoji: '❄️', label: 'Frio', color: 'bg-blue-100 text-blue-700' },
}
```

---

### 7. Visualização em Cards (Alternativa)

Toggle para alternar entre tabela e cards:

```
┌─────────────────────────────────────┐
│ 🔥 Quente              Score: 85    │
├─────────────────────────────────────┤
│  [JS]  João Silva                   │
│        joao@email.com               │
│        (11) 99999-0000              │
├─────────────────────────────────────┤
│  📍 Apt 3 quartos - Jardins         │
│  💰 R$ 500k - R$ 800k               │
├─────────────────────────────────────┤
│  [VIP] [Urgente]                    │
├─────────────────────────────────────┤
│  [WhatsApp] [Ligar] [Email]         │
└─────────────────────────────────────┘
```

---

### 8. Server Actions Necessárias

```typescript
// Busca textual
export async function searchLeads(query: string, filters: LeadFilters)

// Atualização de campos
export async function updateLeadTemperatura(leadId: string, temp: string)
export async function updateLeadScore(leadId: string, score: number)

// Ações em lote
export async function bulkMoveLeads(ids: string[], columnId: string)
export async function bulkAddTag(ids: string[], tagId: string)
export async function bulkDeleteLeads(ids: string[])

// Exportação
export async function exportLeadsCSV(filters: LeadFilters): Promise<string>
```

---

## 📋 Priorização

### Fase 1 - Fundação (2-3 dias)
1. [ ] Adicionar campos ao schema Prisma
2. [ ] Criar migration
3. [ ] LeadTable com checkbox e temperatura
4. [ ] Busca textual nos filtros

### Fase 2 - Produtividade (3-4 dias)
5. [ ] Componente de ações em lote
6. [ ] Mini-kanban no drawer
7. [ ] Ações rápidas (WhatsApp/ligar)
8. [ ] Score visual

### Fase 3 - Visual (2-3 dias)
9. [ ] Visualização em cards
10. [ ] Exportação CSV
11. [ ] Polimento e testes

---

## ✅ Critérios de Aceitação

- [ ] Build sem erros (`npx tsc --noEmit`)
- [ ] Responsivo (mobile-first, min 375px)
- [ ] Loading states em todas operações
- [ ] Feedback visual (toasts) nas ações
- [ ] Atalho de teclado para busca (Ctrl+F)

---

## 🔧 Padrões de Código

### Server Actions
```typescript
'use server'

import { requireCorretorAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function updateLeadTemperatura(leadId: string, temp: string) {
  const auth = await requireCorretorAuth()
  if (!auth.success) return { success: false, error: 'Não autorizado' }
  
  const schema = z.object({
    leadId: z.string(),
    temp: z.enum(['quente', 'morno', 'frio'])
  })
  
  const result = schema.safeParse({ leadId, temp })
  if (!result.success) return { success: false, error: 'Dados inválidos' }
  
  await prisma.lead.update({
    where: { id: leadId, corretorId: auth.corretorId },
    data: { temperatura: temp }
  })
  
  return { success: true }
}
```

---

**Comece pela Fase 1** e solicite review antes de prosseguir.
