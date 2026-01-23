# Prompt para Implementar Responsividade e Sistema de Loading Global Unificado

## 🎯 Objetivo Principal
Refatorar o sistema para garantir responsividade total em todos os breakpoints (mobile, tablet, desktop) e implementar um sistema de loading global padronizado que funcione consistentemente em toda a aplicação.

---

## 📋 PARTE 1: PADRONIZAÇÃO DO SISTEMA DE LOADING GLOBAL

### Problemas Identificados:
1. **Loading inconsistente**: Algumas páginas usam `GlobalLoading`, outras não
2. **Estados diferentes**: Modais e drawers podem ter seus próprios loaders
3. **Falta de feedback visual**: Transições de página não são claras em todos os lugares
4. **Loading local vs global**: Não há distinção clara entre loading de página inteira vs componentes específicos

### Solução Proposta:

#### 1.1 Criar camadas de loading estruturadas

**Arquivo: `src/lib/loading-strategy.ts`** (NOVO)
```typescript
/**
 * Estratégia de loading em 3 camadas:
 * 1. GLOBAL: Cobre toda a aplicação (navegação entre páginas)
 * 2. SECTION: Cobre uma seção/componente (modal, drawer, card)
 * 3. FIELD: Cobre um campo específico (submit button, input)
 */

export enum LoadingLevel {
  GLOBAL = 'global',      // Navegação de página
  SECTION = 'section',    // Modal, Drawer, Widget
  FIELD = 'field',        // Button, Input, Single Action
}

export enum LoadingStrategy {
  OVERLAY = 'overlay',        // Sobrepõe conteúdo com blur
  SKELETON = 'skeleton',      // Mostra esqueleto placeholder
  SPINNER = 'spinner',        // Spinner em lugar específico
  INLINE = 'inline',          // Badge/texto inline
}
```

#### 1.2 Expandir Loading Context com suporte a loading em camadas

**Arquivo: `src/context/LoadingContext.tsx`** (REFATORAR)

Adicionar suporte para:
- `globalLoading`: boolean
- `sectionLoadings`: Map<sectionId, boolean>
- `fieldLoadings`: Map<fieldId, boolean>
- Funções para controlar cada nível: `startGlobalLoading()`, `startSectionLoading(id)`, `startFieldLoading(id)`

#### 1.3 Componente GlobalLoading Aprimorado

**Arquivo: `src/components/loading/GlobalLoading.tsx`** (REFATORAR)

Melhorias:
- Adicionar suporte a diferentes variantes (spinner, dots, pulse, progress)
- Implementar estratégia de stack (não permitir múltiplas sobreposições simultâneas)
- Adicionar mensagem de progresso com etapas
- Suporte a cancelamento com timeout

```typescript
interface GlobalLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress'
  color?: string
  text?: string
  showText?: boolean
  progress?: number  // 0-100
  steps?: string[]   // Etapas de carregamento
  currentStep?: number
  showBackdrop?: boolean
}
```

#### 1.4 Novo componente: SectionLoading (para modais e drawers)

**Arquivo: `src/components/loading/SectionLoading.tsx`** (NOVO)

```typescript
interface SectionLoadingProps {
  isLoading: boolean
  sectionId: string
  variant?: 'overlay' | 'skeleton' | 'spinner'
  skeletonLines?: number
  children?: React.ReactNode
}
```

Características:
- Menos intrusivo que GlobalLoading
- Mantém contexto visual do componente
- Suporta skeleton loading customizável

#### 1.5 Hook customizado: useSectionLoading

**Arquivo: `src/hooks/useSectionLoading.ts`** (NOVO)

```typescript
export function useSectionLoading(sectionId: string) {
  const { startSectionLoading, stopSectionLoading, sectionLoadings } = useLoading()
  
  return {
    isLoading: sectionLoadings.get(sectionId) ?? false,
    start: () => startSectionLoading(sectionId),
    stop: () => stopSectionLoading(sectionId),
  }
}
```

#### 1.6 Auditar e padronizar uso de loading em todas as páginas

**Páginas a atualizar:**
- `/admin/*` - Dashboard admin
- `/corretor/*` - Todos os painéis do corretor
- `/public/*` - Páginas públicas
- `/lp/*` - Landing pages

Cada página deve:
1. Ter `GlobalLoading` renderizado (já está no layout.tsx)
2. Usar `useLoading()` ao fazer requisições que mudarem de página
3. Usar `useSectionLoading()` para ações em componentes específicos
4. Nunca ter loading local redundante (substituir por `SectionLoading`)

---

## 📱 PARTE 2: IMPLEMENTAÇÃO DE RESPONSIVIDADE

### Problemas Identificados:
1. **Kanban Board**: Não se adapta a telas menores (mobile/tablet)
2. **Kanban Modal**: Usa posicionamento fixo, não responsivo
3. **Botões**: Alguns botões têm `gap` fixo que não se adapta
4. **Formulários**: ImovelForm pode não estar completamente responsivo
5. **Grid/Layout**: Alguns componentes usam widths fixas (ex: `w-80` no kanban)

### Solução Proposta:

#### 2.1 Criar sistema de breakpoints e responsividade

**Arquivo: `src/lib/responsive.ts`** (NOVO)

```typescript
// Breakpoints padronizados
export const BREAKPOINTS = {
  xs: 0,      // mobile
  sm: 640,    // tablet pequeno
  md: 768,    // tablet
  lg: 1024,   // desktop pequeno
  xl: 1280,   // desktop
  '2xl': 1536 // desktop grande
}

// Hook para detectar breakpoint atual
export function useBreakpoint() {
  const [bp, setBp] = useState<keyof typeof BREAKPOINTS>('xs')
  
  useEffect(() => {
    const handleResize = () => {
      // Detectar breakpoint baseado em window.innerWidth
    }
    // ...
  }, [])
  
  return bp
}
```

#### 2.2 Refatorar Kanban Board para responsividade

**Arquivo: `src/components/kanban/KanbanBoard.tsx`** (REFATORAR)

Mudanças:
- Remover `w-80` fixo das colunas
- Implementar scroll horizontal em mobile
- Adicionar view alternativa para mobile (lista ou abas)
- Usar grid responsivo: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

```typescript
// Responsividade por breakpoint:
// xs/sm: Stack horizontal com scroll, ou lista view
// md: 2-3 colunas
// lg+: Todas as colunas visíveis

const columnClassName = `
  flex-shrink-0 
  w-full sm:w-96 md:w-80 lg:w-72
  flex flex-col h-full max-h-full
`
```

#### 2.3 Refatorar Kanban Modal para responsividade

**Arquivo: `src/components/kanban/KanbanCardModal.tsx`** (REFATORAR)

Mudanças:
- Tornar modal responsivo: Tela cheia em mobile, centralizando em desktop
- Ajustar padding e espaçamento para mobile
- Implementar tabs em mobile vs painéis laterais em desktop
- Tornar botões responsivos com `flex-wrap` e tamanhos adaptáveis

```typescript
// Desktop: Sidebar + Content
// Tablet: Reduced sidebar
// Mobile: Full width com tabs

const modalContainerClass = `
  fixed inset-0 z-50
  xs:inset-0
  sm:inset-4
  md:inset-8
  lg:inset-12
  flex items-center justify-center
`
```

#### 2.4 Refatorar KanbanColumn para responsividade

**Arquivo: `src/components/kanban/KanbanColumn.tsx`** (REFATORAR)

Mudanças:
- Column header: Ícones menores em mobile
- Lead cards: Conteúdo se adapta a espaço
- Badges: Stack vertical em mobile
- Scrollbar: Ocultar em mobile, custom em desktop

#### 2.5 Refatorar Botões para responsividade

**Arquivo: `src/components/ui/Button.tsx`** (REFATORAR)

Mudanças:
- Suportar `responsive` prop com tamanhos por breakpoint
- Implementar `fullWidth` prop para mobile
- Adicionar variante `compact` para mobile
- Ajustar gaps e paddings dinamicamente

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // ... props existentes
  responsive?: boolean           // Ativa responsividade automática
  fullWidth?: boolean            // 100% de width em mobile
  size?: 'sm' | 'md' | 'lg' | {
    xs?: 'sm' | 'md'
    md?: 'md' | 'lg'
    lg?: 'lg'
  }
}
```

#### 2.6 Refatorar ImovelForm para responsividade

**Arquivo: `src/components/imoveis/ImovelForm.tsx`** (REFATORAR)

Mudanças:
- Grid de campos adaptável: 1 col em mobile, 2 em tablet, 3+ em desktop
- Inputs com full width em mobile
- Mapa responsivo ou oculto em mobile
- Botões de ação em row responsiva (wrap em mobile)
- Preview de imagens em carrossel em mobile

#### 2.7 Criar componente ResponsiveContainer

**Arquivo: `src/components/ui/ResponsiveContainer.tsx`** (NOVO)

```typescript
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: {
    xs?: string
    md?: string
    lg?: string
  }
}
```

#### 2.8 Criar componente ResponsiveGrid

**Arquivo: `src/components/ui/ResponsiveGrid.tsx`** (NOVO)

Para facilitar grids responsivos em formulários e listas.

#### 2.9 Implementar Mobile Navigation para Kanban

**Arquivo: `src/components/kanban/KanbanMobileNav.tsx`** (NOVO)

Em mobile, mostrar abas ou drawer para navegar entre colunas:
```typescript
// Mobile: Dropdown/Tab view para selecionar coluna
// Desktop: Scroll horizontal natural
```

#### 2.10 Atualizar CSS Global

**Arquivo: `src/app/globals.css`** (ADICIONAR)

```css
/* Mobile-first approach */
:root {
  /* Breakpoints */
  --bp-xs: 0px;
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
  
  /* Responsiveness utilities */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
}

/* Disable zoom on input focus (mobile) */
input, select, textarea {
  font-size: 16px; /* Previne zoom em iOS */
}

/* Responsive scroll behavior */
@media (max-width: 768px) {
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

---

## 🔧 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Loading Global (1-2 dias)
- [ ] Criar `src/lib/loading-strategy.ts`
- [ ] Refatorar `LoadingContext.tsx` com 3 camadas
- [ ] Criar `SectionLoading.tsx`
- [ ] Criar `useSectionLoading.ts` hook
- [ ] Refatorar `GlobalLoading.tsx` com novas opções
- [ ] Atualizar `src/app/layout.tsx` para usar novo sistema
- [ ] Remover loaders locais redundantes em modais/drawers
- [ ] Testar loading em todas as páginas

### Fase 2: Responsividade Kanban (2-3 dias)
- [ ] Criar `src/lib/responsive.ts` com breakpoints
- [ ] Criar `useBreakpoint()` hook
- [ ] Refatorar `KanbanBoard.tsx` para grid responsivo
- [ ] Refatorar `KanbanColumn.tsx` para layout adaptável
- [ ] Refatorar `KanbanCardModal.tsx` para modal responsivo
- [ ] Criar `KanbanMobileNav.tsx` para mobile
- [ ] Atualizar CSS para mobile-first

### Fase 3: Responsividade Geral (2-3 dias)
- [ ] Refatorar `Button.tsx` com responsive props
- [ ] Refatorar `ImovelForm.tsx` para layout responsivo
- [ ] Criar `ResponsiveContainer.tsx`
- [ ] Criar `ResponsiveGrid.tsx`
- [ ] Atualizar `LeadDrawer.tsx` para responsividade
- [ ] Atualizar `PropertyFiltersBar.tsx` para mobile
- [ ] Atualizar `globals.css` com utilities

### Fase 4: Testes e Refinamento (1-2 dias)
- [ ] Testar em dispositivos reais (mobile, tablet, desktop)
- [ ] Verificar performance em mobile
- [ ] Testar touchscreen interactions
- [ ] Validar loading em navegação
- [ ] Corrigir edge cases

---

## 📐 BREAKPOINTS RECOMENDADOS

```typescript
export const BREAKPOINTS = {
  xs: '0px',        // Mobile (até 640px)
  sm: '640px',      // Tablet pequeno (640px+)
  md: '768px',      // Tablet (768px+)
  lg: '1024px',     // Desktop pequeno (1024px+)
  xl: '1280px',     // Desktop (1280px+)
  '2xl': '1536px'   // Desktop grande (1536px+)
}
```

---

## 🎨 ESTRATÉGIA DE LOADING VISUAL

### Global Loading (Página inteira)
```
✓ Backdrop com blur
✓ Spinner centralizado + texto
✓ Progresso opcional
✓ Nunca permite interação
```

### Section Loading (Modal/Drawer/Card)
```
✓ Spinner pequeno ou skeleton
✓ Overlay semi-transparente
✓ Mantém contexto visual
✓ Permite visualizar fundo
```

### Field Loading (Botão/Input)
```
✓ Inline spinner
✓ Desabilita input
✓ Feedback visual rápido
✓ Sem overlay
```

---

## 🚀 EXEMPLO DE USO FINAL

### Loading Global
```tsx
// Em qualquer ação que mude de página
const { startLoading } = useLoading()
await startLoading()
router.push('/next-page')
```

### Loading de Seção
```tsx
const { isLoading, start, stop } = useSectionLoading('lead-modal')
const handleSave = async () => {
  start()
  try {
    await updateLead(data)
  } finally {
    stop()
  }
}
```

### Button Responsivo
```tsx
<Button 
  responsive 
  size={{ xs: 'sm', md: 'md', lg: 'lg' }}
  fullWidth
>
  Enviar
</Button>
```

---

## 📝 NOTAS IMPORTANTES

1. **Mobile-First**: Sempre começar com mobile (xs) e melhorar para desktop
2. **Touch-Friendly**: Manter botões >= 44px em mobile
3. **Performance**: Usar lazy loading em imagens
4. **Acessibilidade**: Testar com screen readers
5. **Testing**: Testar em múltiplos dispositivos
6. **Loading**: Sempre ter feedback visual ao fazer requisições

---

## 🔗 REFERÊNCIAS DE COMPONENTES

Componentes que precisam de atenção especial:
- `KanbanBoard.tsx` - Scroll horizontal
- `KanbanCardModal.tsx` - Fullscreen em mobile
- `ImovelForm.tsx` - Grid responsivo
- `PropertyFiltersBar.tsx` - Collapse em mobile
- `LeadDrawer.tsx` - Drawer vs modal
- Todos os Buttons - Responsivo

---

**Próxima etapa**: Implementar fase por fase, testando após cada fase.
