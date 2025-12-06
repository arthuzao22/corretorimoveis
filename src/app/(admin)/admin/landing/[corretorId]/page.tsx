'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getLandingPageByCorretorId, updateLandingPage } from '@/server/actions/landing'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

interface CorretorData {
  id: string
  slug: string
  temaCor: string | null
  fundoCor: string | null
  bannerUrl: string | null
  logoUrl: string | null
  tituloLP: string | null
  subtituloLP: string | null
  textoCTA: string | null
  landingAtiva: boolean
  user: {
    name: string
    email: string
  }
}

export default function EditLandingPage() {
  const params = useParams()
  const router = useRouter()
  const corretorId = params.corretorId as string

  const [corretor, setCorretor] = useState<CorretorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    temaCor: '#3B82F6',
    fundoCor: '#F9FAFB',
    bannerUrl: '',
    logoUrl: '',
    tituloLP: 'Encontre o Imóvel dos Seus Sonhos',
    subtituloLP: 'Imóveis de qualidade com atendimento personalizado',
    textoCTA: 'Ver Imóveis Disponíveis'
  })

  const loadData = async () => {
    setLoading(true)
    const result = await getLandingPageByCorretorId(corretorId)
    
    if (result.success && result.corretor) {
      setCorretor(result.corretor)
      setFormData({
        temaCor: result.corretor.temaCor || '#3B82F6',
        fundoCor: result.corretor.fundoCor || '#F9FAFB',
        bannerUrl: result.corretor.bannerUrl || '',
        logoUrl: result.corretor.logoUrl || '',
        tituloLP: result.corretor.tituloLP || 'Encontre o Imóvel dos Seus Sonhos',
        subtituloLP: result.corretor.subtituloLP || 'Imóveis de qualidade com atendimento personalizado',
        textoCTA: result.corretor.textoCTA || 'Ver Imóveis Disponíveis'
      })
    } else {
      alert(result.error || 'Erro ao carregar dados')
      router.push('/admin/landing')
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corretorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const result = await updateLandingPage(corretorId, formData)

    if (result.success) {
      alert('Landing page atualizada com sucesso!')
      router.push('/admin/landing')
    } else {
      alert(result.error || 'Erro ao salvar')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!corretor) {
    return null
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/landing">
          <Button variant="secondary" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Editar Landing Page
        </h1>
        <p className="text-gray-600">
          {corretor.user.name} - {corretor.user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Branding
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Principal
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.temaCor}
                        onChange={(e) =>
                          setFormData({ ...formData, temaCor: e.target.value })
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.temaCor}
                        onChange={(e) =>
                          setFormData({ ...formData, temaCor: e.target.value })
                        }
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor de Fundo
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.fundoCor}
                        onChange={(e) =>
                          setFormData({ ...formData, fundoCor: e.target.value })
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.fundoCor}
                        onChange={(e) =>
                          setFormData({ ...formData, fundoCor: e.target.value })
                        }
                        placeholder="#F9FAFB"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner URL (opcional)
                    </label>
                    <Input
                      type="url"
                      value={formData.bannerUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, bannerUrl: e.target.value })
                      }
                      placeholder="https://exemplo.com/banner.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL (opcional)
                    </label>
                    <Input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, logoUrl: e.target.value })
                      }
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Conteúdo
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título Principal
                    </label>
                    <Input
                      type="text"
                      value={formData.tituloLP}
                      onChange={(e) =>
                        setFormData({ ...formData, tituloLP: e.target.value })
                      }
                      placeholder="Encontre o Imóvel dos Seus Sonhos"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtítulo
                    </label>
                    <Input
                      type="text"
                      value={formData.subtituloLP}
                      onChange={(e) =>
                        setFormData({ ...formData, subtituloLP: e.target.value })
                      }
                      placeholder="Imóveis de qualidade com atendimento personalizado"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto do Botão CTA
                    </label>
                    <Input
                      type="text"
                      value={formData.textoCTA}
                      onChange={(e) =>
                        setFormData({ ...formData, textoCTA: e.target.value })
                      }
                      placeholder="Ver Imóveis Disponíveis"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>

                <Link href={`/lp/${corretor.slug}`} target="_blank">
                  <Button type="button" variant="secondary">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Preview ao Vivo
            </h3>
            
            <div
              className="rounded-lg overflow-hidden border-2"
              style={{ backgroundColor: formData.fundoCor }}
            >
              {/* Header */}
              <div
                className="p-6 text-white"
                style={{ backgroundColor: formData.temaCor }}
              >
                {formData.logoUrl && (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-12 mb-4 object-contain"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">{formData.tituloLP}</h2>
                <p className="opacity-90">{formData.subtituloLP}</p>
              </div>

              {/* Banner */}
              {formData.bannerUrl && (
                <div className="w-full h-48 bg-gray-200">
                  <img
                    src={formData.bannerUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* CTA */}
              <div className="p-6 text-center">
                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg"
                  style={{ backgroundColor: formData.temaCor }}
                >
                  {formData.textoCTA}
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>Link público:</strong>{' '}
              <code className="bg-white px-2 py-1 rounded">
                /lp/{corretor.slug}
              </code>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
