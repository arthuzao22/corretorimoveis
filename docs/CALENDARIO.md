# Sistema de Calendário

Este documento descreve o sistema de calendário completo implementado no projeto Next.js.

## Visão Geral

O sistema de calendário permite que corretores gerenciem eventos associados a leads e imóveis, com visualização em diferentes formatos (mês, semana, dia).

## Estrutura do Banco de Dados

### Modelo EventoCalendario

```prisma
model EventoCalendario {
  id         String   @id @default(cuid())
  leadId     String
  imovelId   String
  dataHora   DateTime
  observacao String?  @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  lead   Lead   @relation(fields: [leadId], references: [id], onDelete: Cascade)
  imovel Imovel @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  @@index([dataHora])
  @@index([leadId])
  @@index([imovelId])
  @@index([createdAt])
  @@map("eventos_calendario")
}
```

### Relacionamentos

- **Lead**: Cada evento está associado a um lead (obrigatório)
- **Imovel**: Cada evento está associado a um imóvel (obrigatório)

## API Routes

### POST /api/eventos

Cria um novo evento.

**Body:**
```json
{
  "leadId": "string",
  "imovelId": "string",
  "dataHora": "ISO 8601 datetime string",
  "observacao": "string (opcional)"
}
```

**Response:**
```json
{
  "success": true,
  "evento": { ... }
}
```

### GET /api/eventos

Lista eventos com filtros opcionais.

**Query Parameters:**
- `leadId` (opcional): Filtrar por ID do lead
- `imovelId` (opcional): Filtrar por ID do imóvel
- `dataInicio` (opcional): Data inicial (ISO 8601)
- `dataFim` (opcional): Data final (ISO 8601)
- `limit` (opcional): Número de resultados (padrão: 50, máx: 100)
- `cursor` (opcional): Cursor para paginação

**Response:**
```json
{
  "success": true,
  "eventos": [...],
  "pagination": {
    "nextCursor": "string | null",
    "hasNextPage": boolean,
    "limit": number
  }
}
```

### GET /api/eventos/[id]

Obtém detalhes de um evento específico.

### PUT /api/eventos/[id]

Atualiza um evento existente.

**Body:**
```json
{
  "leadId": "string (opcional)",
  "imovelId": "string (opcional)",
  "dataHora": "ISO 8601 datetime string (opcional)",
  "observacao": "string (opcional)"
}
```

### DELETE /api/eventos/[id]

Remove um evento.

## Componentes Frontend

### Página Principal: `/corretor/calendario`

Componente principal que integra o calendário e o modal de eventos.

### Componente Calendario

Renderiza o calendário com três visualizações:
- **Mês**: Grade mensal com eventos por dia
- **Semana**: Visualização semanal
- **Dia**: Lista detalhada de eventos do dia

**Props:**
```typescript
interface CalendarioProps {
  eventos: Evento[]
  onDateClick: (date: Date) => void
  onEventClick: (evento: Evento) => void
  loading?: boolean
}
```

### Componente EventoModal

Modal reutilizável para criar e editar eventos.

**Props:**
```typescript
interface EventoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {...}) => void
  evento?: Evento | null
  leads: Lead[]
  imoveis: Imovel[]
  loading?: boolean
}
```

## Hooks

### useEventos

Hook para gerenciar operações de eventos via API.

**Métodos:**
- `fetchEventos(params?)`: Busca eventos com filtros
- `createEvento(data)`: Cria novo evento
- `updateEvento(id, data)`: Atualiza evento
- `deleteEvento(id)`: Remove evento

**Estados:**
- `loading`: boolean
- `error`: string | null

### useCalendario

Hook para gerenciar estado do calendário.

**Métodos:**
- `goToToday()`: Vai para hoje
- `goToNext()`: Avança para próximo período
- `goToPrevious()`: Volta para período anterior
- `changeView(view)`: Muda visualização (month/week/day)
- `goToDate(date)`: Vai para data específica

**Estados:**
- `currentDate`: Date
- `view`: CalendarView
- `viewRange`: { start, end, startISO, endISO }
- `displayText`: string

## Segurança

### Autenticação

Todas as rotas de API são protegidas pelo middleware de autenticação Next-Auth.

### Autorização

- **Corretores**: Podem ver e gerenciar apenas seus próprios eventos (eventos associados aos seus leads)
- **Administradores**: Podem ver todos os eventos

### Validação

- Todas as entradas são validadas usando Zod
- Verificação de propriedade de leads e imóveis antes de criar/editar eventos
- Validação de formato de data/hora

## UX Features

1. **Loading States**: Indicadores visuais durante carregamento
2. **Empty States**: Mensagens quando não há eventos
3. **Feedback Messages**: Notificações de sucesso/erro
4. **Responsive Design**: Funciona em desktop e mobile
5. **Modal de Confirmação**: Antes de excluir eventos
6. **Navegação Intuitiva**: Controles fáceis para navegar no calendário

## Paginação

O sistema usa paginação baseada em cursor para eficiência:
- Permite carregar eventos incrementalmente
- Suporta grandes volumes de dados
- Mantém performance consistente

## Como Usar

1. **Acessar o Calendário**: Clique em "Calendário" na barra lateral
2. **Criar Evento**: Clique no botão "Novo Evento" ou clique em um dia
3. **Visualizar Evento**: Clique em um evento no calendário
4. **Editar Evento**: Clique no botão "Editar" no modal de detalhes
5. **Excluir Evento**: Clique no botão "Excluir" e confirme
6. **Navegar**: Use os botões de navegação e seletor de visualização

## Melhorias Futuras

- [ ] Notificações automáticas antes dos eventos
- [ ] Integração com Google Calendar
- [ ] Recorrência de eventos
- [ ] Anexos em eventos
- [ ] Export para iCal
- [ ] Visualização de timeline
