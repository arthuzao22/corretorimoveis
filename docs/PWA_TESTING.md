# ✅ Checklist PWA - Como Testar

## 🔍 No seu navegador (F12 Developer Tools)

### 1. Verificar Service Worker
```
Console > Procure por:
✅ "Service Worker registrado"
❌ Se vir erro, o SW não foi registrado
```

### 2. Verificar Manifest
```
Application (abra a aba "Application")
  → Manifest
    → Deve ver "Portal Corretor Imobiliário"
    → Display: "standalone"
    → Theme Color: "#6366F1"
```

### 3. Verificar Cache
```
Application
  → Cache Storage
    → Deve haver "corretor-v1"
    → Dentro deve ter "/" e "/manifest.json"
```

---

## 📱 No seu Telefone

### Android (Chrome)
1. Abra seu site via HTTPS
2. Chrome vai mostrar banner "Instalar" no topo (após 30s)
3. Clique em "Instalar"
4. O app aparece na home screen

### iOS (Safari)
1. Abra seu site
2. Clique no botão "Compartilhar" (quadrado com seta)
3. Procure por "Add to Home Screen"
4. O app aparece na home screen

---

## 🚀 Depois de Instalar

✅ Deve abrir sem a barra de endereço (standalone)  
✅ Deve funcionar offline com cache básico  
✅ Deve manter estado ao fechar e reabrir  
✅ Deve respeitar dark mode do SO  

---

## ⚠️ Possíveis Problemas

### "Service Worker não aparece no console"
- Você está em HTTPS? (PWA obrigatoriamente precisa)
- Se localhost: tá funcionando, é normal
- Se produção: certifique que HTTPS está ativo

### "Manifest aparece como erro"
- Verifique se `/manifest.json` está carregando corretamente
- Abra `https://seu-site/manifest.json` diretamente
- Se 404: arquivo não existe no servidor

### "Não aparece o botão Instalar"
- Espere 30+ segundos (navegadores precisam)
- Recarregue a página
- Abra em nova aba (às vezes ajuda)
- Em localhost, pode não aparecer (é normal)

---

## 🔧 No seu Código

### Usar PWA no componente
```tsx
import { usePWA } from '@/hooks'

export default function Header() {
  const { isInstalled, isInstallable, promptInstall } = usePWA()
  
  return (
    <>
      {isInstallable && !isInstalled && (
        <Button onClick={promptInstall}>Instalar App</Button>
      )}
    </>
  )
}
```

### Detectar atualizações
```tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Novo SW ativado, peça para recarregar
    window.location.reload()
  })
}
```

---

## 📊 Status Indicator

Aparece um card no canto inferior direito durante desenvolvimento:
- 🟢 **Verde**: App instalado
- 🔵 **Azul**: PWA pronto (Service Worker ativo)
- 🟠 **Laranja**: Problemas (HTTPS, SW não ativo, etc)

---

## 🎯 Resumo Técnico

| Feature | Status |
|---------|--------|
| Service Worker | ✅ Implementado |
| Manifest.json | ✅ Configurado |
| Cache Strategy | ✅ Network-first com fallback |
| Icons | ✅ Configurado (SVG) |
| HTTPS Required | ✅ Sim |
| Offline Support | ✅ Básico (com cache) |
| Mobile Installable | ✅ Sim |

---

**Próximos passos para produção:**
1. Gerar ícones reais (PNG 192x192, 512x512, etc)
2. Deploy com HTTPS obrigatório
3. Configurar service worker mais robusto com workbox
4. Adicionar push notifications (opcional)
