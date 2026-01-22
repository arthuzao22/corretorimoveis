import { NextRequest, NextResponse } from 'next/server'

interface DeepLinkConfig {
  android: {
    packageName: string
    scheme: string
    fallbackUrl: string
  }
  ios: {
    bundleId: string
    scheme: string
    appStoreUrl: string
    fallbackUrl: string
  }
}

// Configuração de deep links - ajustar conforme necessário
const DEEP_LINK_CONFIG: DeepLinkConfig = {
  android: {
    packageName: 'com.corretorimobiliario.app',
    scheme: 'corretorimobiliario',
    fallbackUrl: 'https://play.google.com/store/apps/details?id=com.corretorimobiliario.app',
  },
  ios: {
    bundleId: 'com.corretorimobiliario.app',
    scheme: 'corretorimobiliario',
    appStoreUrl: 'https://apps.apple.com/app/corretor-imobiliario/id123456789',
    fallbackUrl: 'https://apps.apple.com/app/corretor-imobiliario/id123456789',
  },
}

interface RedirectRequest {
  // Rota de destino no app
  path?: string
  // Parâmetros adicionais
  params?: Record<string, string>
  // Forçar web
  forceWeb?: boolean
}

interface RedirectResponse {
  success: boolean
  platform: 'android' | 'ios' | 'web' | 'unknown'
  isPWA: boolean
  isStandalone: boolean
  deepLink?: string
  webUrl: string
  fallbackUrl?: string
}

/**
 * Detecta a plataforma baseado no User-Agent
 */
function detectPlatform(userAgent: string): 'android' | 'ios' | 'web' | 'unknown' {
  const ua = userAgent.toLowerCase()
  
  if (/android/i.test(ua)) {
    return 'android'
  }
  
  if (/iphone|ipad|ipod/i.test(ua)) {
    return 'ios'
  }
  
  if (/windows|mac|linux/i.test(ua) && !/mobile/i.test(ua)) {
    return 'web'
  }
  
  return 'unknown'
}

/**
 * Verifica se está rodando como PWA (standalone mode)
 */
function detectPWA(request: NextRequest): boolean {
  // Verificar header customizado que pode ser enviado pelo PWA
  const isPWAHeader = request.headers.get('x-pwa-mode')
  if (isPWAHeader === 'true') return true
  
  // Verificar display-mode via cookie ou query param
  const displayMode = request.nextUrl.searchParams.get('display-mode')
  if (displayMode === 'standalone') return true
  
  // Verificar referrer para PWA
  const referer = request.headers.get('referer') || ''
  if (referer.includes('?source=pwa')) return true
  
  return false
}

/**
 * Gera deep link para a plataforma específica
 */
function generateDeepLink(
  platform: 'android' | 'ios',
  path: string,
  params?: Record<string, string>
): string {
  const config = platform === 'android' ? DEEP_LINK_CONFIG.android : DEEP_LINK_CONFIG.ios
  
  let deepLink = `${config.scheme}://${path.replace(/^\//, '')}`
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    deepLink += `?${queryString}`
  }
  
  return deepLink
}

/**
 * Gera Intent URL para Android (fallback para app não instalado)
 */
function generateAndroidIntentUrl(path: string, params?: Record<string, string>): string {
  const { scheme, packageName, fallbackUrl } = DEEP_LINK_CONFIG.android
  
  const deepLink = generateDeepLink('android', path, params)
  
  // Intent URL format: intent://path#Intent;scheme=xxx;package=xxx;S.browser_fallback_url=xxx;end
  const intentUrl = `intent://${path.replace(/^\//, '')}${
    params ? `?${new URLSearchParams(params).toString()}` : ''
  }#Intent;scheme=${scheme};package=${packageName};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
  
  return intentUrl
}

/**
 * Gera Universal Link para iOS
 */
function generateUniversalLink(baseUrl: string, path: string, params?: Record<string, string>): string {
  let url = `${baseUrl}${path}`
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }
  
  return url
}

/**
 * API Route Handler
 */
export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const platform = detectPlatform(userAgent)
  const isPWA = detectPWA(request)
  
  const path = request.nextUrl.searchParams.get('path') || '/'
  const forceWeb = request.nextUrl.searchParams.get('forceWeb') === 'true'
  
  // Extrair parâmetros adicionais (excluindo os reservados)
  const params: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!['path', 'forceWeb', 'display-mode'].includes(key)) {
      params[key] = value
    }
  })
  
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
  const webUrl = generateUniversalLink(baseUrl, path, params)
  
  const response: RedirectResponse = {
    success: true,
    platform,
    isPWA,
    isStandalone: isPWA,
    webUrl,
  }
  
  // Se forçar web ou já estiver em PWA, retornar URL web
  if (forceWeb || isPWA) {
    return NextResponse.json(response)
  }
  
  // Gerar deep links para mobile
  if (platform === 'android') {
    response.deepLink = generateDeepLink('android', path, params)
    response.fallbackUrl = DEEP_LINK_CONFIG.android.fallbackUrl
  } else if (platform === 'ios') {
    response.deepLink = generateDeepLink('ios', path, params)
    response.fallbackUrl = DEEP_LINK_CONFIG.ios.fallbackUrl
  }
  
  return NextResponse.json(response)
}

/**
 * POST handler para redirect automático
 */
export async function POST(request: NextRequest) {
  try {
    const body: RedirectRequest = await request.json()
    const userAgent = request.headers.get('user-agent') || ''
    const platform = detectPlatform(userAgent)
    const isPWA = detectPWA(request)
    
    const path = body.path || '/'
    const params = body.params
    const forceWeb = body.forceWeb || false
    
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const webUrl = generateUniversalLink(baseUrl, path, params)
    
    // Se forçar web, PWA ou desktop, redirecionar para web
    if (forceWeb || isPWA || platform === 'web') {
      return NextResponse.redirect(webUrl)
    }
    
    // Para mobile, tentar deep link primeiro
    if (platform === 'android') {
      const intentUrl = generateAndroidIntentUrl(path, params)
      
      // Retornar HTML que tenta abrir o app e faz fallback para web
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecionando...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f9fafb;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .fallback-link {
      margin-top: 1rem;
      color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Abrindo o aplicativo...</p>
    <p class="fallback-link">
      <a href="${webUrl}">Clique aqui se não for redirecionado</a>
    </p>
  </div>
  <script>
    // Tentar abrir o app via Intent
    window.location.href = "${intentUrl}";
    
    // Fallback para web após 2.5 segundos
    setTimeout(function() {
      window.location.href = "${webUrl}";
    }, 2500);
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }
    
    if (platform === 'ios') {
      const deepLink = generateDeepLink('ios', path, params)
      const appStoreUrl = DEEP_LINK_CONFIG.ios.appStoreUrl
      
      // iOS usa Universal Links preferencialmente, mas tentamos deep link como fallback
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecionando...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f9fafb;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .fallback-link {
      margin-top: 1rem;
      color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Abrindo o aplicativo...</p>
    <p class="fallback-link">
      <a href="${webUrl}">Clique aqui se não for redirecionado</a>
    </p>
  </div>
  <script>
    // Tentar Universal Link primeiro
    var startTime = Date.now();
    
    // Fallback - se não redirecionou em 2.5s, ir para web
    setTimeout(function() {
      // Se ainda estamos aqui após o timeout, o app não está instalado
      if (Date.now() - startTime >= 2400) {
        window.location.href = "${webUrl}";
      }
    }, 2500);
    
    // Tentar deep link
    window.location.href = "${deepLink}";
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }
    
    // Fallback para web
    return NextResponse.redirect(webUrl)
    
  } catch (error) {
    console.error('Redirect API error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
