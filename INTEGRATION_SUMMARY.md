# Integração Landing Page ↔ Perfil do Corretor

## 📋 Resumo da Implementação

Este documento descreve a integração completa entre as páginas de landing (`/lp/[slug]`) e perfil do corretor (`/corretor/[slug]`), permitindo navegação perfeita entre ambas usando o mesmo `slug` como identificador único.

## ✅ Funcionalidades Implementadas

### 1. Navegação Cruzada Entre Páginas

#### Na Landing Page (`/lp/[slug]`)
- ✅ Botão "VER TODOS OS IMÓVEIS" que redireciona para `/corretor/[slug]`
- ✅ Posicionado estrategicamente antes do footer
- ✅ Design chamativo com gradiente azul-índigo

#### No Perfil do Corretor (`/corretor/[slug]`)
- ✅ Botão "CONHEÇA NOSSA EMPRESA" que redireciona para `/lp/[slug]`
- ✅ Exibido condicionalmente apenas quando:
  - Landing está ativa (`landingAtiva = true`)
  - Existem blocos ativos na landing
- ✅ Design diferenciado com gradiente roxo-rosa

### 2. Redirecionamento Inteligente (Fallback)

A landing page agora possui lógica de fallback que redireciona automaticamente para o perfil quando:
- A landing não está ativa
- A landing não possui blocos configurados
- Ocorre erro ao carregar a landing

**Comportamento:**
```
/lp/esterconsultoria (sem landing) → /corretor/esterconsultoria
```

### 3. Rastreamento de Origem dos Leads

Sistema de origem já estava implementado corretamente:

| Origem | Descrição | Campo `origem` |
|--------|-----------|----------------|
| Landing Page | Formulário de contato na landing | `"landing"` |
| Página do Imóvel | Interesse em imóvel específico | `"site"` |
| Perfil | (Não possui formulário) | N/A |

### 4. SEO Otimizado para Cada Página

#### Landing Page - Foco em Marketing
```typescript
{
  title: "Nome do Corretor - Corretor de Imóveis | Marketing Imobiliário"
  description: "Conheça [Nome] - Sua melhor escolha no mercado imobiliário"
  keywords: "corretor de imóveis, imóveis, [cidade], comprar imóvel, alugar imóvel"
  openGraph: { type: "website", locale: "pt_BR" }
  twitter: { card: "summary_large_image" }
}
```

#### Perfil do Corretor - Foco em Imóveis
```typescript
{
  title: "Nome do Corretor - Imóveis para Venda e Aluguel em [Cidade]"
  description: "[Nome] - Corretor de Imóveis em [Cidade]. X imóveis disponíveis"
  keywords: "imóveis, venda, aluguel, corretor, [cidade], comprar casa, alugar apartamento"
  openGraph: { type: "profile", locale: "pt_BR" }
  twitter: { card: "summary" }
}
```

## 🔑 Regras de Vinculação

### Campo Único: `CorretorProfile.slug`

O campo `slug` é a chave única que conecta:

```
CorretorProfile.slug = "esterconsultoria"
├── Perfil: /corretor/esterconsultoria
├── Landing: /lp/esterconsultoria
├── Imóveis: ligados ao corretorId
└── Leads: ligados ao corretorId com origem correta
```

### Compartilhamento de Dados

Ambas as páginas utilizam os mesmos dados de:
- ✅ `CorretorProfile` (nome, foto, bio, WhatsApp, cidade)
- ✅ `Imovel` (imóveis do corretor)
- ✅ `Lead` (leads vinculados ao corretor)
- ✅ `LandingBloco` (blocos configuráveis da landing)

**Nenhuma duplicação de dados no banco!**

## 📁 Arquivos Modificados

### 1. `/src/app/lp/[slug]/page.tsx`
**Mudanças:**
- Importação do componente `Building2` e `Link`
- Adicionada seção de navegação com botão "VER TODOS OS IMÓVEIS"
- Implementado redirecionamento automático para perfil quando landing inativa
- Melhorada função `generateMetadata` com SEO completo
- Tipagem corrigida com `LandingBloco`

### 2. `/src/app/(public)/corretor/[slug]/page.tsx`
**Mudanças:**
- Importação de `Building2` e `Metadata`
- Query estendida para incluir `landingBlocos`
- Card condicional "CONHEÇA NOSSA EMPRESA" antes da lista de imóveis
- Adicionada função `generateMetadata` completa
- Tipagem melhorada para o map de imóveis

## 🧪 Testes Realizados

### Build e Compilação
```bash
✅ npm run build - Sucesso
✅ TypeScript compilation - Sucesso
✅ Todas as rotas configuradas corretamente
```

### Linting
```bash
✅ ESLint - src/app/lp - Sem erros
✅ ESLint - src/app/(public)/corretor - Sem erros críticos
```

### Cenários Testados

| Cenário | Resultado Esperado | Status |
|---------|-------------------|--------|
| Corretor com landing ativa | Botão visível no perfil | ✅ |
| Corretor sem landing | Botão oculto no perfil | ✅ |
| Acesso a landing inativa | Redirect para perfil | ✅ |
| Acesso a landing sem blocos | Redirect para perfil | ✅ |
| Lead criado na landing | origem="landing" | ✅ |
| Lead criado no imóvel | origem="site" | ✅ |

## 🚀 Implementação em Produção

### Pré-requisitos
1. Banco de dados com schema atualizado
2. Variável de ambiente `DATABASE_URL` configurada
3. Node.js 18+ e npm instalados

### Deploy
```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npm run db:generate

# 3. Build da aplicação
npm run build

# 4. Iniciar servidor
npm start
```

## 🔒 Permissões

### ADMIN
- ✅ Edita landing pages
- ✅ Edita blocos
- ✅ Edita layout
- ✅ Ativa/desativa landings

### CORRETOR
- ✅ Visualiza sua landing
- ✅ Compartilha links
- ✅ Gerencia imóveis
- 🚫 Não edita landing (apenas admin)

## 📊 Fluxo de Usuário

```
Visitante acessa /lp/slug
    │
    ├─ Landing Ativa com Blocos?
    │   ├─ SIM → Exibe Landing
    │   │         └─ Botão "VER TODOS OS IMÓVEIS" → /corretor/slug
    │   │
    │   └─ NÃO → Redirect automático → /corretor/slug
    │
Visitante acessa /corretor/slug
    │
    └─ Landing Disponível?
        ├─ SIM → Exibe botão "CONHEÇA NOSSA EMPRESA" → /lp/slug
        └─ NÃO → Sem botão (apenas imóveis)
```

## 🎯 Benefícios da Integração

1. **Experiência Unificada**: Navegação suave entre marketing e catálogo
2. **SEO Duplo**: Duas páginas otimizadas para buscadores
3. **Flexibilidade**: Landing opcional, perfil sempre disponível
4. **Sem Duplicação**: Dados compartilhados, banco otimizado
5. **Rastreamento**: Origem dos leads sempre identificada
6. **Manutenção**: Admin controla landing, corretor divulga ambas

## 📝 Notas Técnicas

### TypeScript
- Utilizado `LandingBloco` como tipo base
- Type assertions (`as any`) para compatibilidade com componentes
- Tipos específicos para props dos componentes de blocos

### Performance
- Queries otimizadas com `select` e `include`
- Imagens lazy-loaded automaticamente
- Static generation quando possível

### Acessibilidade
- Links semânticos com `<Link>` do Next.js
- Botões com ícones descritivos
- Cores com contraste adequado

## 🆘 Troubleshooting

### Landing não redireciona
**Causa:** Campo `landingAtiva` como `false`
**Solução:** Admin deve ativar no painel `/admin/landings`

### Botão não aparece no perfil
**Causa:** Corretor não tem blocos ativos
**Solução:** Admin deve criar blocos em `/admin/landings/[corretorId]`

### Imóveis não aparecem na landing
**Causa:** Imóveis com status `INATIVO`
**Solução:** Corretor deve ativar imóveis no painel

## 📚 Próximos Passos (Futuro)

- [ ] Analytics de navegação entre páginas
- [ ] A/B testing de conversão
- [ ] Personalização de cores por corretor
- [ ] Preview de landing antes de ativar
- [ ] Histórico de alterações na landing

---

**Desenvolvido em:** 2024-12-08  
**Versão do Next.js:** 16.0.7  
**Status:** ✅ Produção Ready
