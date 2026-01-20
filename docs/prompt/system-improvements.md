# 🏠 Prompt: Melhorias Gerais do Sistema - Área do Corretor

## Contexto do Projeto

**CorretorImoveis** é um CRM Imobiliário completo para corretores gerenciarem seus imóveis, leads e pipeline de vendas.

### Stack Tecnológica
- **Framework**: Next.js 16+ (App Router + Turbopack)
- **Linguagem**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js
- **UI**: Tailwind CSS + Componentes customizados
- **Uploads**: ImageKit
- **Mapas**: Google Maps / Leaflet

---

## 📊 Módulos Existentes na Área do Corretor

```
/corretor/
├── dashboard/        # Métricas e visão geral
├── imoveis/          # CRUD de imóveis
├── leads/            # Lista de leads recebidos
├── kanban/           # Pipeline visual de leads
├── calendario/       # Agenda de visitas e eventos
├── minha-landing/    # CMS de landing page personalizada
└── perfil/           # Configurações do perfil
```

### Funcionalidades Atuais
- ✅ Dashboard com métricas básicas (imóveis, leads)
- ✅ CRUD completo de imóveis (venda/aluguel)
- ✅ Upload de múltiplas fotos com ImageKit
- ✅ Kanban de leads com drag-and-drop
- ✅ Calendário de visitas com agendamento
- ✅ Landing page personalizada por corretor
- ✅ Sistema de tags para leads
- ✅ Timeline de atividades por lead
- ✅ Integração com Google Maps para geolocalização

---

## 🚀 Melhorias Solicitadas

### 1. Dashboard Aprimorado

#### 1.1 Widgets de Performance
```typescript
interface DashboardWidget {
  id: string
  type: 'METRIC' | 'CHART' | 'LIST' | 'CALENDAR'
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
}
```

- **Cards de métricas** com comparativo (este mês vs anterior)
  - Leads novos / Leads convertidos
  - Imóveis ativos / Visualizações
  - Taxa de conversão / Tempo médio de venda
- **Gráfico de funil** mostrando leads por etapa
- **Lista de tarefas pendentes** (eventos próximos, leads sem contato)
- **Ranking de imóveis** mais visualizados
- **Widget de agenda** com próximos 3 eventos

#### 1.2 Personalização
- Permitir **arrastar e reordenar** widgets
- **Opção de ocultar/mostrar** widgets específicos
- **Tema claro/escuro** toggle

### 2. Gestão de Imóveis Avançada

#### 2.1 Melhorias na Listagem
- **Filtros avançados**: tipo, status, faixa de preço, bairro, quartos
- **Visualização em grade ou lista** (toggle)
- **Ordenação**: preço, data, visualizações, destaque
- **Seleção múltipla** para ações em lote
- **Preview rápido** (hover mostra informações)

#### 2.2 Melhorias no Cadastro
- **Rascunhos automáticos** (salvar a cada 30s)
- **Duplicar imóvel** existente como base
- **Importação de dados** via link (OLX, ZAP Imóveis)*
- **Validação de endereço** automática via Google Maps
- **Sugestão de preço** baseado em imóveis similares (futuro)

#### 2.3 Galeria de Fotos Premium
- **Reordenar fotos** com drag-and-drop
- **Definir foto de capa**
- **Edição básica** (crop, rotate)
- **Marca d'água automática** com logo do corretor
- **Tour virtual 360°** (integração futura)

#### 2.4 QR Code e Compartilhamento
- **Gerar QR Code** do imóvel para impressão
- **Compartilhar via WhatsApp** com mensagem formatada
- **Link curto** personalizado (ex: /i/abc123)
- **Estatísticas de compartilhamento**

### 3. CRM de Leads Aprimorado

#### 3.1 Perfil Completo do Lead
- **Score de interesse** (0-100) baseado em interações
- **Histórico de imóveis visualizados**
- **Preferências detectadas** (tipo, região, faixa de preço)
- **Integração com redes sociais** (buscar perfil LinkedIn/Instagram)
- **Múltiplos telefones/emails** por lead

#### 3.2 Comunicação Centralizada
- **Templates de mensagem** salvos
- **Envio de WhatsApp** direto do sistema
- **Registro de ligações** (duração, resultado)
- **Email tracking** (abertura, cliques)
- **Histórico unificado** de toda comunicação

#### 3.3 Automações de Follow-up
```typescript
interface FollowUpRule {
  name: string
  trigger: 'LEAD_CREATED' | 'NO_CONTACT_DAYS' | 'VISIT_COMPLETED'
  delay: { value: number; unit: 'HOURS' | 'DAYS' }
  action: 'SEND_WHATSAPP' | 'CREATE_TASK' | 'SEND_EMAIL' | 'NOTIFY'
  template?: string
}
```

- **Lembrete automático** se lead sem contato há X dias
- **Mensagem automática** de boas-vindas
- **Follow-up pós-visita** após 24h
- **Aniversário do lead** (se data cadastrada)

### 4. Calendário Inteligente

#### 4.1 Melhorias de Visualização
- **Visão semanal e diária** além de mensal
- **Cores por tipo de evento** (visita, reunião, lembrete)
- **Arrastar para remarcar** eventos
- **Visualizar conflitos** de horário
- **Tempo de deslocamento** entre visitas

#### 4.2 Integração com Imóveis
- **Ao agendar visita**, mostrar disponibilidade do imóvel
- **Histórico de visitas** no imóvel
- **Checklist de visita** configurável
- **Avaliação pós-visita** (corretor avalia interesse)

#### 4.3 Notificações
- **Push notification** 30min antes
- **Lembrete por WhatsApp** para o lead
- **Email de confirmação** com detalhes
- **Reagendar com 1 clique**

### 5. Landing Page Personalizada

#### 5.1 Novos Blocos de Conteúdo
- **Depoimentos de clientes** com foto
- **Galeria de imóveis vendidos** (cases de sucesso)
- **FAQ personalizado**
- **Vídeo de apresentação** (YouTube/Vimeo)
- **Formulário customizado** com campos extras
- **Widget de WhatsApp flutuante**

#### 5.2 SEO e Performance
- **Meta tags** editáveis por página
- **Sitemap automático**
- **Schema markup** para imóveis
- **Lazy loading** de imagens
- **Score de velocidade** no dashboard

#### 5.3 Domínio Próprio
- **Configurar domínio personalizado** (futuro)
- **SSL automático**
- **Subdomínio gratuito** padrão (joao.corretorimoveis.com)

### 6. Relatórios e Analytics

#### 6.1 Relatórios Automáticos
- **Relatório semanal** enviado por email
- **Performance mensal** comparativo
- **ROI por imóvel** (visualizações vs leads gerados)
- **Tempo médio** de venda por tipo de imóvel

#### 6.2 Exportação
- **Exportar leads** para Excel/CSV
- **Exportar imóveis** com fotos (ZIP)
- **Relatório PDF** formatado para apresentação
- **Backup completo** dos dados

### 7. Produtividade e UX

#### 7.1 Atalhos de Teclado
- `N` - Novo imóvel
- `L` - Novo lead
- `K` - Abrir Kanban
- `C` - Calendário
- `/` - Busca global

#### 7.2 Busca Global
- **Comando+K** ou **Ctrl+K** para buscar
- Buscar em **imóveis, leads, eventos**
- **Ações rápidas** (criar, ir para página)
- **Histórico de buscas** recentes

#### 7.3 Mobile First
- **PWA** instalável no celular
- **Funcionamento offline** para consulta
- **Push notifications** nativas
- **Camera integration** para upload rápido

### 8. Integrações

#### 8.1 Portais Imobiliários
- **Publicar no ZAP Imóveis** (API)
- **Publicar no Viva Real** (API)
- **Publicar no OLX** (API)
- **Sincronização automática** de status
- **Relatório de leads** por portal

#### 8.2 Financeiro (Futuro)
- **Controle de comissões** por venda
- **Metas mensais** com progresso
- **Relatório financeiro** básico
- **Integração com banco** (PIX, boleto)

---

## 📋 Priorização Sugerida

### Fase 1 - Quick Wins (2-4 semanas)
1. [ ] Dashboard com widgets de métricas comparativas
2. [ ] Filtros avançados na listagem de imóveis
3. [ ] Templates de mensagem para leads
4. [ ] QR Code e compartilhamento WhatsApp
5. [ ] Busca global (Cmd+K)

### Fase 2 - CRM Avançado (4-6 semanas)
6. [ ] Score de interesse por lead
7. [ ] Histórico de comunicação unificado
8. [ ] Automações de follow-up básicas
9. [ ] Calendário com visão diária/semanal
10. [ ] Notificações push

### Fase 3 - Produtividade (6-8 semanas)
11. [ ] Personalização do dashboard (drag widgets)
12. [ ] Galeria com reordenação e marca d'água
13. [ ] Novos blocos na landing page
14. [ ] Relatórios automáticos por email
15. [ ] PWA com offline

### Fase 4 - Integrações (Futuro)
16. [ ] API de portais imobiliários
17. [ ] Controle de comissões
18. [ ] Domínio próprio
19. [ ] Tour virtual 360°

---

## 🔧 Padrões de Implementação

### Server Actions
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { requireCorretorAuth } from '@/lib/auth-helpers'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export async function createImovel(data: FormData) {
  const auth = await requireCorretorAuth()
  if (!auth.success) return auth
  
  const schema = z.object({
    titulo: z.string().min(3),
    // ...
  })
  
  const parsed = schema.safeParse(Object.fromEntries(data))
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() }
  }
  
  const imovel = await prisma.imovel.create({
    data: { ...parsed.data, corretorId: auth.corretorId }
  })
  
  revalidatePath('/corretor/imoveis')
  return { success: true, data: imovel }
}
```

### Componentes Client
```typescript
'use client'

import { useState, useTransition } from 'react'
import { createImovel } from '@/server/actions/imoveis'

export function ImovelForm() {
  const [pending, startTransition] = useTransition()
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createImovel(formData)
      if (result.success) {
        // redirect or show toast
      }
    })
  }
  
  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

---

## ✅ Critérios de Aceitação

- [ ] Build sem erros (`npx tsc --noEmit`)
- [ ] Responsivo (mobile-first, min 375px)
- [ ] Performance (Lighthouse > 80)
- [ ] Acessibilidade básica (teclado, ARIA)
- [ ] Testes manuais em Chrome, Safari, Firefox
- [ ] Documentação atualizada

---

## 📝 Notas Importantes

1. **Priorize UX** - Cada funcionalidade deve melhorar a experiência do corretor
2. **Mantenha simplicidade** - Evite over-engineering
3. **Feedback visual** - Loading states, toasts, confirmações
4. **Offline-first** quando possível
5. **Mobile-first** - Corretores usam muito o celular

---

**Comece pela Fase 1** implementando um item por vez. Solicite review antes de prosseguir para próximos itens.
