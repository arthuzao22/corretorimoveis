'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  LandingTheme, 
  landingThemePresets, 
  availableFonts,
  LandingThemeColors,
  LandingThemeTypography,
  LandingThemeSpacing,
  LandingThemeStyle,
} from '@/types/landing'
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles,
  Check,
  RotateCcw,
  Eye,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/design-system'

interface ThemeEditorProps {
  currentTheme?: Partial<LandingTheme> | null
  onSave: (theme: LandingTheme) => Promise<void>
  onPreview?: (theme: LandingTheme) => void
  isSaving?: boolean
}

type EditorTab = 'presets' | 'colors' | 'typography' | 'spacing' | 'style'

export function LandingThemeEditor({ 
  currentTheme, 
  onSave, 
  onPreview,
  isSaving = false 
}: ThemeEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('presets')
  const [theme, setTheme] = useState<LandingTheme>(() => {
    const defaultTheme = landingThemePresets['modern-blue']
    if (!currentTheme) return defaultTheme
    
    const baseTheme = currentTheme.id && landingThemePresets[currentTheme.id]
      ? landingThemePresets[currentTheme.id]
      : defaultTheme

    return {
      ...baseTheme,
      ...currentTheme,
      colors: { ...baseTheme.colors, ...currentTheme.colors },
      typography: { ...baseTheme.typography, ...currentTheme.typography },
      spacing: { ...baseTheme.spacing, ...currentTheme.spacing },
      style: { ...baseTheme.style, ...currentTheme.style },
    } as LandingTheme
  })

  const tabs = [
    { id: 'presets' as const, label: 'Temas', icon: Sparkles },
    { id: 'colors' as const, label: 'Cores', icon: Palette },
    { id: 'typography' as const, label: 'Tipografia', icon: Type },
    { id: 'spacing' as const, label: 'Layout', icon: Layout },
  ]

  const updateColors = (colors: Partial<LandingThemeColors>) => {
    setTheme(prev => ({ ...prev, colors: { ...prev.colors, ...colors } }))
  }

  const updateTypography = (typography: Partial<LandingThemeTypography>) => {
    setTheme(prev => ({ ...prev, typography: { ...prev.typography, ...typography } }))
  }

  const updateSpacing = (spacing: Partial<LandingThemeSpacing>) => {
    setTheme(prev => ({ ...prev, spacing: { ...prev.spacing, ...spacing } }))
  }

  const updateStyle = (style: Partial<LandingThemeStyle>) => {
    setTheme(prev => ({ ...prev, style: { ...prev.style, ...style } }))
  }

  const selectPreset = (presetId: string) => {
    const preset = landingThemePresets[presetId]
    if (preset) {
      setTheme(preset)
    }
  }

  const resetToDefault = () => {
    setTheme(landingThemePresets['modern-blue'])
  }

  const handleSave = async () => {
    await onSave(theme)
  }

  const handlePreview = () => {
    onPreview?.(theme)
  }

  return (
    <Card className="w-full" padding="none">
      <CardHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <CardTitle>Personalizar Tema da Landing</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetToDefault}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Resetar
            </Button>
            {onPreview && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreview}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Preview
              </Button>
            )}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Salvar Tema
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <CardContent className="p-6">
        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Escolha um tema pré-definido como ponto de partida</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(landingThemePresets).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset.id)}
                  className={cn(
                    'relative p-4 rounded-xl border-2 transition-all text-left',
                    theme.id === preset.id
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {theme.id === preset.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  {/* Color Preview */}
                  <div className="flex gap-1 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                  
                  <h4 className="font-medium text-gray-900 text-sm">{preset.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{preset.typography.headingFont}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Personalize as cores da sua landing page</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorPicker
                label="Cor Principal"
                value={theme.colors.primary}
                onChange={(value) => updateColors({ primary: value })}
              />
              <ColorPicker
                label="Cor Secundária"
                value={theme.colors.secondary}
                onChange={(value) => updateColors({ secondary: value })}
              />
              <ColorPicker
                label="Cor de Destaque"
                value={theme.colors.accent}
                onChange={(value) => updateColors({ accent: value })}
              />
              <ColorPicker
                label="Fundo"
                value={theme.colors.background}
                onChange={(value) => updateColors({ background: value })}
              />
              <ColorPicker
                label="Superfície"
                value={theme.colors.surface}
                onChange={(value) => updateColors({ surface: value })}
              />
              <ColorPicker
                label="Texto"
                value={theme.colors.text}
                onChange={(value) => updateColors({ text: value })}
              />
              <ColorPicker
                label="Títulos"
                value={theme.colors.heading}
                onChange={(value) => updateColors({ heading: value })}
              />
              <ColorPicker
                label="Texto Secundário"
                value={theme.colors.muted}
                onChange={(value) => updateColors({ muted: value })}
              />
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Configure as fontes e pesos</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte dos Títulos
                </label>
                <select
                  value={theme.typography.headingFont}
                  onChange={(e) => updateTypography({ headingFont: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableFonts.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte do Corpo
                </label>
                <select
                  value={theme.typography.bodyFont}
                  onChange={(e) => updateTypography({ bodyFont: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableFonts.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso dos Títulos
                </label>
                <div className="flex gap-2">
                  {(['500', '600', '700', '800'] as const).map(weight => (
                    <button
                      key={weight}
                      onClick={() => updateTypography({ headingWeight: weight })}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg border text-sm transition-colors',
                        theme.typography.headingWeight === weight
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div 
              className="mt-6 p-6 rounded-xl border border-gray-200"
              style={{ backgroundColor: theme.colors.background }}
            >
              <h3 
                className="text-2xl mb-2"
                style={{ 
                  fontFamily: theme.typography.headingFont,
                  fontWeight: theme.typography.headingWeight,
                  color: theme.colors.heading,
                }}
              >
                Prévia do Título
              </h3>
              <p
                style={{ 
                  fontFamily: theme.typography.bodyFont,
                  fontWeight: theme.typography.bodyWeight,
                  color: theme.colors.text,
                }}
              >
                Este é um exemplo de como o texto do corpo ficará com as configurações atuais.
              </p>
            </div>
          </div>
        )}

        {/* Spacing/Layout Tab */}
        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Configure o espaçamento e layout</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Espaçamento das Seções
                </label>
                <div className="flex gap-3">
                  {([
                    { value: 'compact', label: 'Compacto' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'spacious', label: 'Espaçoso' },
                  ] as const).map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateSpacing({ sectionPadding: option.value })}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-lg border text-sm transition-colors',
                        theme.spacing.sectionPadding === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Largura do Conteúdo
                </label>
                <div className="flex gap-3">
                  {([
                    { value: 'narrow', label: 'Estreito' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'wide', label: 'Largo' },
                    { value: 'full', label: 'Tela Cheia' },
                  ] as const).map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateSpacing({ contentWidth: option.value })}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-lg border text-sm transition-colors',
                        theme.spacing.contentWidth === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Arredondamento das Bordas
                </label>
                <div className="flex gap-3 flex-wrap">
                  {([
                    { value: 'none', label: 'Nenhum' },
                    { value: 'sm', label: 'Pequeno' },
                    { value: 'md', label: 'Médio' },
                    { value: 'lg', label: 'Grande' },
                    { value: 'xl', label: 'Extra' },
                  ] as const).map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateStyle({ borderRadius: option.value })}
                      className={cn(
                        'px-4 py-3 rounded-lg border text-sm transition-colors',
                        theme.style.borderRadius === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sombras
                </label>
                <div className="flex gap-3">
                  {([
                    { value: 'none', label: 'Nenhuma' },
                    { value: 'sm', label: 'Sutil' },
                    { value: 'md', label: 'Média' },
                    { value: 'lg', label: 'Forte' },
                  ] as const).map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateStyle({ shadow: option.value })}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-lg border text-sm transition-colors',
                        theme.style.shadow === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Color Picker Component
interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            style={{ padding: 0 }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={7}
        />
      </div>
    </div>
  )
}
