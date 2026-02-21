# 🗓️ PROMPT: Refatoração Completa do Sistema de Calendário e Criação de Eventos

## 📋 Contexto do Projeto

Este é um sistema de gestão imobiliária (CRM) para corretores, construído com:
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript (strict mode)
- **Database**: PostgreSQL com Prisma ORM
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + Componentes customizados
- **Estrutura**: `src/app/(corretor)/corretor/calendario/`

---

## 🔍 DIAGNÓSTICO DOS PROBLEMAS ATUAIS

### Problema 1: Criação de eventos pelo calendário está quebrada
A página do calendário (`page.tsx`) tem a função `handleDateClick` que cria um objeto `selectedEvento` falso com `as any` para abrir o modal de criação. Isso causa vários problemas:

```typescript
// PROBLEMA ATUAL (page.tsx, linhas 91-104):
const handleDateClick = (date: Date) => {
  setSelectedEvento({
    id: '', // Empty id indicates new event
    tipo: 'GERAL', // ❌ 'GERAL' NÃO EXISTE no enum EventoTipo (só tem VISITA, ACOMPANHAMENTO, REUNIAO, URGENTE)
    dataHora: date, // ❌ Passa Date mas o tipo espera string
    observacao: null,
    completed: false,
    leadId: null, // ❌ Esses campos não existem na interface Evento
    imovelId: null,
    lead: null, // ❌ Lead é obrigatório na interface mas está null
    imovel: null // ❌ Imovel é obrigatório na interface mas está null
  } as any) // ❌ Forçando com 'as any' para esconder os erros
  setIsModalOpen(true)
}
```

**Consequência**: Quando o usuário clica em uma data do calendário para criar um evento, o modal abre com dados inválidos que podem causar erros ao salvar.

### Problema 2: Lógica de criação vs edição confusa no `handleSaveEvento`
```typescript
// PROBLEMA (page.tsx, linhas 157-196):
const handleSaveEvento = async (data) => {
  if (selectedEvento) { // ❌ Sempre true porque handleDateClick seta selectedEvento
    // Tenta ATUALIZAR um evento que não existe (id vazio)
    const updated = await updateEvento(selectedEvento.id, data) // ❌ selectedEvento.id é ''
    // ...
  } else {
    // Nunca chega aqui na criação via calendário
    const created = await createEvento(data)
  }
}
```

**Consequência**: Ao criar evento pelo calendário, o sistema tenta fazer UPDATE de um evento inexistente ao invés de CREATE.

### Problema 3: Inconsistência na passagem da dataHora
- `handleDateClick` passa `Date` object como `dataHora`
- O `EventoModalEnhanced` tenta `new Date(evento.dataHora).toISOString().slice(0, 16)` que pode funcionar mas é frágil
- A data clicada não pré-preenche corretamente o campo `datetime-local` no modal

### Problema 4: Mensagem confusa na UI
```typescript
// page.tsx, linha 231:
<p className="text-sm text-indigo-600 mt-1 bg-indigo-50 inline-block px-3 py-1 rounded-full">
  ℹ️ Para criar eventos, abra um card do Kanban
</p>
```
**Problema**: A mensagem diz que só pode criar eventos pelo Kanban, mas o calendário TEM botão e funcionalidade de criação (que está bugada). Deve-se remover esta mensagem e permitir criação direta pelo calendário.

### Problema 5: Modal NÃO tem botão "Novo Evento" visível
Não existe um botão `+ Novo Evento` na página do calendário. A criação depende exclusivamente de clicar em uma data, que é pouco intuitivo.

### Problema 6: O `EventoModal.tsx` não é usado
Existe o `EventoModal.tsx` (versão antiga) e o `EventoModalEnhanced.tsx` (versão nova). A página usa apenas o Enhanced, mas o arquivo antigo continua no projeto sem uso, causando confusão.

### Problema 7: Estilização inconsistente do modal de detalhes
O modal de visualização de detalhes do evento (linhas 287-407 do `page.tsx`) está inline na página ao invés de ser um componente separado. Além disso, apresenta problemas de estilização:
- Usa `animate-in` que pode não estar disponível no projeto
- Usa `Plus` icon rotacionado 45° como botão de fechar ao invés de `X`
- Botão "Editar" está sem ícone

### Problema 8: Schema Prisma permite `leadId` e `imovelId` como nullable
```prisma
model EventoCalendario {
  leadId     String?   // ← Nullable
  imovelId   String?   // ← Nullable
}
```
Mas a API valida que são obrigatórios na criação. Isso é inconsistente. O formulário deve permitir criar eventos sem lead/imóvel associado (eventos gerais) OU manter ambos obrigatórios. **Recomendação**: Permitir eventos sem lead/imóvel para dar flexibilidade ao corretor.

### Problema 9: Enum `EventoTipo` limitado
O enum só tem 4 tipos: `VISITA`, `ACOMPANHAMENTO`, `REUNIAO`, `URGENTE`. Falta um tipo `GERAL` para eventos genéricos do corretor. O widget `UpcomingEventsWidget` já referencia `GERAL` mas ele não existe no enum.

---

## 🎯 REQUISITOS DA REFATORAÇÃO

### TAREFA 1: Adicionar tipo `GERAL` ao enum EventoTipo

**Arquivo**: `prisma/schema.prisma`

```prisma
enum EventoTipo {
  VISITA
  ACOMPANHAMENTO
  REUNIAO
  URGENTE
  GERAL          // ← ADICIONAR
}
```

**Após alterar**: Executar `npx prisma migrate dev --name add_geral_event_type`

**Atualizar TODOS os locais** que referenciam o enum para incluir GERAL:
- `src/app/api/eventos/route.ts` (createEventoSchema, linha 43)
- `src/app/(corretor)/corretor/calendario/components/EventoModalEnhanced.tsx` (EVENT_TYPES)
- `src/app/(corretor)/corretor/calendario/components/Calendario.tsx` (EVENT_COLORS)
- `src/app/(corretor)/corretor/calendario/page.tsx` (getEventTypeLabel)
- `src/components/eventos/QuickEventForm.tsx` (EVENT_TYPES)
- `src/components/ui/EventCard.tsx` (getTypeConfig)
- `src/components/dashboard/UpcomingEventsWidget.tsx` (eventTypeColors, eventTypeLabels)

---

### TAREFA 2: Corrigir a criação de eventos pelo calendário

**Arquivo**: `src/app/(corretor)/corretor/calendario/page.tsx`

#### 2.1 Adicionar estado para data selecionada
```typescript
const [selectedDate, setSelectedDate] = useState<Date | null>(null)
```

#### 2.2 Corrigir `handleDateClick`
```typescript
const handleDateClick = (date: Date) => {
  setSelectedDate(date)
  setSelectedEvento(null) // null = modo criação
  setIsModalOpen(true)
}
```

#### 2.3 Corrigir `handleSaveEvento` para diferenciar Create vs Update
```typescript
const handleSaveEvento = async (data: {
  leadId?: string
  imovelId?: string
  tipo: EventoTipo
  dataHora: string
  observacao?: string
}) => {
  if (selectedEvento && selectedEvento.id) {
    // EDIÇÃO - evento existente com ID válido
    const updated = await updateEvento(selectedEvento.id, data)
    if (updated) {
      setEventos((prev) => prev.map((e) => (e.id === selectedEvento.id ? updated : e)))
      setIsModalOpen(false)
      setSelectedEvento(null)
      setSelectedDate(null)
      showFeedback('success', 'Evento atualizado com sucesso')
    } else {
      showFeedback('error', 'Erro ao atualizar evento')
    }
  } else {
    // CRIAÇÃO - novo evento
    const created = await createEvento(data as CreateEventoData)
    if (created) {
      setEventos((prev) => [...prev, created])
      setIsModalOpen(false)
      setSelectedDate(null)

      if (data.leadId) {
        await addTimelineEntry(
          data.leadId,
          'EVENT_SCHEDULED',
          `Evento agendado: ${data.tipo} para ${new Date(data.dataHora).toLocaleDateString('pt-BR')}`
        )
      }

      showFeedback('success', 'Evento criado com sucesso')
    } else {
      showFeedback('error', 'Erro ao criar evento')
    }
  }
}
```

#### 2.4 Adicionar botão "Novo Evento" no header
```typescript
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
      <CalendarIcon size={32} className="text-purple-600" />
      Calendário de Eventos
    </h1>
    <p className="text-gray-600 mt-2">
      Gerencie seus agendamentos com leads e imóveis
    </p>
    {/* ❌ REMOVER a mensagem "Para criar eventos, abra um card do Kanban" */}
  </div>
  <Button
    onClick={() => {
      setSelectedDate(new Date())
      setSelectedEvento(null)
      setIsModalOpen(true)
    }}
    className="flex items-center gap-2"
  >
    <Plus size={18} />
    Novo Evento
  </Button>
</div>
```

#### 2.5 Passar `selectedDate` para o modal
```typescript
<EventoModalEnhanced
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSave={handleSaveEvento}
  evento={selectedEvento}
  leads={leads}
  imoveis={imoveis}
  loading={loading}
  initialDate={selectedDate}  // ← NOVA PROP
/>
```

---

### TAREFA 3: Refatorar `EventoModalEnhanced`

**Arquivo**: `src/app/(corretor)/corretor/calendario/components/EventoModalEnhanced.tsx`

#### 3.1 Adicionar prop `initialDate` e tipo `GERAL`
```typescript
interface EventoModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    leadId?: string      // ← Tornar opcional
    imovelId?: string    // ← Tornar opcional
    tipo: EventoTipo
    dataHora: string
    observacao?: string
  }) => void
  evento?: any | null
  leads: Array<{ id: string; name: string }>
  imoveis: Array<{ id: string; titulo: string }>
  loading?: boolean
  initialDate?: Date | null  // ← NOVA PROP
}
```

#### 3.2 Incluir tipo GERAL no EVENT_TYPES
```typescript
const EVENT_TYPES = [
  // ... tipos existentes ...
  {
    value: 'GERAL' as EventoTipo,
    label: 'Geral',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50 border-slate-200',
    description: 'Evento geral ou lembrete pessoal',
  },
]
```

#### 3.3 Pré-preencher data quando vier de `initialDate`
```typescript
useEffect(() => {
  if (evento) {
    // Modo edição
    setFormData({
      leadId: evento.lead?.id || evento.leadId || '',
      imovelId: evento.imovel?.id || evento.imovelId || '',
      tipo: evento.tipo || 'VISITA',
      dataHora: evento.dataHora
        ? new Date(evento.dataHora).toISOString().slice(0, 16)
        : '',
      observacao: evento.observacao || '',
    })
  } else {
    // Modo criação
    const defaultDate = initialDate
      ? new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : ''

    setFormData({
      leadId: '',
      imovelId: '',
      tipo: 'GERAL',
      dataHora: defaultDate,
      observacao: '',
    })
  }
  setValidationError(null)
}, [evento, isOpen, initialDate])
```

#### 3.4 Tornar Lead e Imóvel opcionais no formulário
- Remover `required` dos selects de Lead e Imóvel
- Atualizar validação para não exigir `leadId` e `imovelId` quando tipo = GERAL
- Manter obrigatórios para VISITA, REUNIAO, ACOMPANHAMENTO, URGENTE

#### 3.5 Melhorias de estilização do modal:
- Adicionar animação suave de entrada (`transition-all duration-300 ease-out`)
- Usar `backdrop-blur-sm` no overlay
- Melhorar o espaçamento dos botões de tipo de evento
- Adicionar ícones nos botões de tipo de evento (📋 Visita, 🔄 Follow-up, 🤝 Reunião, 🚨 Urgente, 📌 Geral)
- Adicionar search/filtro nos selects de Lead e Imóvel quando houver muitas opções
- Melhorar o card de resumo do evento com mais informações visuais

---

### TAREFA 4: Tornar Lead e Imóvel opcionais na API

**Arquivo**: `src/app/api/eventos/route.ts`

#### 4.1 Atualizar schema de validação
```typescript
const createEventoSchema = z.object({
  leadId: z.string().min(1).optional().or(z.literal('')), // Tornar opcional
  imovelId: z.string().min(1).optional().or(z.literal('')), // Tornar opcional
  tipo: z.enum(['VISITA', 'ACOMPANHAMENTO', 'REUNIAO', 'URGENTE', 'GERAL']).default('VISITA'),
  dataHora: z.string().min(1, 'Data e hora é obrigatória').transform((val) => {
    const date = new Date(val)
    if (isNaN(date.getTime())) throw new Error('Data e hora inválida')
    return date.toISOString()
  }),
  observacao: z.string().optional(),
})
```

#### 4.2 Ajustar a lógica do POST
- Se `leadId` for vazio ou undefined, não conectar lead
- Se `imovelId` for vazio ou undefined, não conectar imóvel
- Ajustar verificação de autorização: se não tem lead, usar o `corretorId` da sessão
- Ajustar o `include` para usar `lead: true` ao invés de `{ select: {...} }` quando lead é nullable

#### 4.3 Ajustar o GET para tratar leads/imóveis null
- Serializar corretamente quando `evento.lead` ou `evento.imovel` é null

---

### TAREFA 5: Extrair modal de detalhes como componente separado

**Arquivo novo**: `src/app/(corretor)/corretor/calendario/components/EventoDetalhesModal.tsx`

Extrair as linhas 287-407 do `page.tsx` para um componente `EventoDetalhesModal` com:

```typescript
interface EventoDetalhesModalProps {
  evento: Evento
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  loading?: boolean
}
```

**Estilização do modal de detalhes**:
- Usar `X` icon no botão de fechar (não `Plus` rotacionado)
- Adicionar ícone no botão "Editar" (`Pencil` icon)
- Melhorar transições com `transition-all duration-200`
- Usar `backdrop-blur-sm` no overlay
- Exibir badge "Concluído" com melhor contrast
- Tratar caso onde `lead` ou `imovel` é null (mostrar "Evento Geral")
- Adicionar botão "WhatsApp" se o lead tiver telefone
- Exibir data de criação e última atualização do evento

---

### TAREFA 6: Remover o componente `EventoModal.tsx` (versão antiga)

**Arquivo a remover**: `src/app/(corretor)/corretor/calendario/components/EventoModal.tsx`

Este componente não é mais utilizado. Removê-lo para evitar confusão.

---

### TAREFA 7: Melhorias de estilização no componente `Calendario.tsx`

**Arquivo**: `src/app/(corretor)/corretor/calendario/components/Calendario.tsx`

#### 7.1 Adicionar cor para tipo GERAL
```typescript
const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VISITA: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ACOMPANHAMENTO: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  REUNIAO: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  URGENTE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  GERAL: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }, // ← ADICIONAR
}
```

#### 7.2 Melhorias visuais:
- Adicionar hover sutil com `ring` nas células do calendário ao passar o mouse
- Mostrar indicador sutil de "+" ao passar o mouse numa data vazia (para indicar que pode criar evento)
- Melhorar badge de contador de eventos por dia
- Na view de Dia, mostrar os horários em formato timeline (similar ao Google Calendar)
- Eventos concluídos devem aparecer com opacidade reduzida e riscados
- Adicionar tooltip ao hover sobre um evento no calendário

#### 7.3 Corrigir tratamento de eventos sem lead
- Atualmente o calendário acessa `evento.lead.name` diretamente, que vai dar erro se lead for null
- Trocar por: `evento.lead?.name || 'Evento Geral'`
- Similar para `evento.imovel?.titulo`

---

### TAREFA 8: Atualizar `useEventos.ts`

**Arquivo**: `src/hooks/useEventos.ts`

#### 8.1 Atualizar interface `Evento` para suportar lead/imovel nullable
```typescript
export interface Evento {
  id: string
  tipo: EventoTipo
  dataHora: string
  observacao?: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
  lead: {            // ← Tornar nullable
    id: string
    name: string
    phone: string
    email?: string | null
    corretor?: {
      id: string
      user: { name: string }
    }
  } | null
  imovel: {          // ← Tornar nullable
    id: string
    titulo: string
    endereco?: string
    cidade?: string
    estado?: string
    valor?: number
  } | null
}
```

#### 8.2 Atualizar `CreateEventoData`
```typescript
interface CreateEventoData {
  leadId?: string    // ← Opcional
  imovelId?: string  // ← Opcional
  tipo: EventoTipo
  dataHora: string
  observacao?: string
}
```

---

### TAREFA 9: Atualizar `QuickEventForm.tsx`

**Arquivo**: `src/components/eventos/QuickEventForm.tsx`

- Adicionar tipo GERAL ao EVENT_TYPES
- Manter o comportamento atual (criação rápida a partir do Kanban)

---

### TAREFA 10: Atualizar `EventCard.tsx`

**Arquivo**: `src/components/ui/EventCard.tsx`

- Adicionar case `GERAL` no `getTypeConfig`:
```typescript
case 'GERAL':
  return {
    label: 'Geral',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50 border-slate-200 text-slate-700',
  }
```

---

### TAREFA 11: Atualizar `UpcomingEventsWidget.tsx`

**Arquivo**: `src/components/dashboard/UpcomingEventsWidget.tsx`

Já referencia GERAL mas as cores podem ser inconsistentes. Verificar e padronizar:
```typescript
const eventTypeColors = {
  VISITA: 'bg-blue-100 text-blue-700',
  ACOMPANHAMENTO: 'bg-amber-100 text-amber-700', // ← padronizar com amber
  REUNIAO: 'bg-emerald-100 text-emerald-700',     // ← padronizar com emerald
  URGENTE: 'bg-red-100 text-red-700',
  GERAL: 'bg-slate-100 text-slate-700'
}
```

---

## 📁 MAPA COMPLETO DE ARQUIVOS AFETADOS

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `prisma/schema.prisma` | Adicionar `GERAL` ao enum |
| 2 | `src/app/(corretor)/corretor/calendario/page.tsx` | Corrigir criação, adicionar botão, extrair modal detalhes |
| 3 | `src/app/(corretor)/corretor/calendario/components/EventoModalEnhanced.tsx` | Adicionar `initialDate`, GERAL, tornar lead/imovel opcionais |
| 4 | `src/app/(corretor)/corretor/calendario/components/EventoModal.tsx` | **REMOVER** (não usado) |
| 5 | `src/app/(corretor)/corretor/calendario/components/Calendario.tsx` | Adicionar GERAL, tratar nulls, melhorias visuais |
| 6 | `src/app/(corretor)/corretor/calendario/components/EventoDetalhesModal.tsx` | **CRIAR** (extrair da page) |
| 7 | `src/hooks/useEventos.ts` | Tornar lead/imovel nullable, leadId/imovelId opcionais |
| 8 | `src/hooks/useCalendario.ts` | Sem alteração (apenas referência) |
| 9 | `src/app/api/eventos/route.ts` | Aceitar GERAL, tornar lead/imovel opcionais |
| 10 | `src/app/api/eventos/[id]/route.ts` | Tratar lead/imovel null na serialização |
| 11 | `src/components/eventos/QuickEventForm.tsx` | Adicionar tipo GERAL |
| 12 | `src/components/ui/EventCard.tsx` | Adicionar case GERAL |
| 13 | `src/components/dashboard/UpcomingEventsWidget.tsx` | Padronizar cores |

---

## 🎨 ESPECIFICAÇÃO DE ESTILIZAÇÃO

### Paleta de cores por tipo de evento (PADRONIZAR em TODOS os componentes):

| Tipo | Background Light | Text | Border | Badge Solid |
|------|-----------------|------|--------|-------------|
| VISITA | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `bg-blue-500` |
| ACOMPANHAMENTO | `bg-amber-50` | `text-amber-700` | `border-amber-200` | `bg-amber-500` |
| REUNIAO | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | `bg-emerald-500` |
| URGENTE | `bg-red-50` | `text-red-700` | `border-red-200` | `bg-red-500` |
| GERAL | `bg-slate-50` | `text-slate-700` | `border-slate-200` | `bg-slate-500` |

### Gradientes do header do modal de detalhes:

| Tipo | Gradiente |
|------|-----------|
| VISITA | `from-blue-500 to-indigo-500` |
| ACOMPANHAMENTO | `from-amber-500 to-orange-500` |
| REUNIAO | `from-emerald-500 to-teal-500` |
| URGENTE | `from-red-500 to-rose-500` |
| GERAL | `from-slate-500 to-gray-500` |

### Labels em PT-BR (PADRONIZAR):

| Tipo | Label |
|------|-------|
| VISITA | `Visita` |
| ACOMPANHAMENTO | `Follow-up` |
| REUNIAO | `Reunião` |
| URGENTE | `Urgente` |
| GERAL | `Geral` |

---

## ⚡ ORDEM DE EXECUÇÃO

1. **Prisma Schema** → adicionar GERAL + migration
2. **API Routes** → ajustar validação e lógica para nullable
3. **Hooks** → atualizar tipos e interfaces
4. **EventoModalEnhanced** → refatorar com initialDate e GERAL
5. **Calendario.tsx** → adicionar GERAL e corrigir nulls
6. **page.tsx** → corrigir criação, botão, extrair modal detalhes
7. **EventoDetalhesModal** → criar componente extraído
8. **Componentes auxiliares** → QuickEventForm, EventCard, UpcomingEventsWidget
9. **Remover** EventoModal.tsx antigo
10. **Testar** → build + verificação visual

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] Clicar numa data do calendário abre o modal de criação com a data pré-preenchida
- [ ] O botão "Novo Evento" na page cria evento com data padrão = hoje
- [ ] Eventos GERAL podem ser criados sem lead e sem imóvel associados
- [ ] Eventos VISITA, ACOMPANHAMENTO, REUNIAO, URGENTE mantêm lead/imóvel como obrigatórios
- [ ] A edição de eventos funciona corretamente (não confunde com criação)
- [ ] O modal de detalhes é um componente separado e estilizado
- [ ] Cores dos tipos de evento são consistentes em TODOS os componentes
- [ ] Eventos sem lead mostram "Evento Geral" ao invés de quebrar
- [ ] Eventos concluídos aparecem com estilo diferenciado (opacidade, riscar)
- [ ] `npm run build` passa sem erros TypeScript
- [ ] Sem `as any` nos handlers de evento
- [ ] API aceita e persiste corretamente eventos do tipo GERAL

---

## 🚫 REGRAS OBRIGATÓRIAS

1. **NÃO usar `as any`** para resolver incompatibilidades de tipo
2. **NÃO criar componentes sem TypeScript strict**
3. **Manter padrão `'use client'`** apenas em componentes que usam hooks/interatividade
4. **Usar Server Actions** quando aplicável ao invés de API routes novos
5. **Manter o padrão de feedback** com `showFeedback('success' | 'error', message)`
6. **Usar o componente `Button`** do design system (`@/components/ui/Button`) em vez de `<button>` raw nos footers/ações
7. **Validar com Zod** no backend
8. **Revalidar cache** com `revalidatePath` após mutações servidor
9. **Manter nomenclatura em pt-BR** para labels e mensagens
10. **Respeitar a paleta de cores** especificada acima para cada tipo de evento

---

## 📝 NOTAS ADICIONAIS

- O componente `Button` aceita variantes: `primary`, `secondary`, `danger`, `outline`, `ghost`, `success`
- O componente `Button` aceita tamanhos: `sm`, `md`, `lg`
- O hook `useEventos` já tem CRUD completo, só precisa ajustar tipos
- O hook `useCalendario` não precisa de alteração
- A timeline (`addTimelineEntry`) só deve ser chamada quando houver `leadId`
- O widget `UpcomingEventsWidget` no dashboard deve refletir eventos GERAL
- Lembrar de tratar o caso do PUT na API `[id]/route.ts` onde `lead` e `imovel` podem estar null na resposta
