'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getMyProfile, updateCorretorProfile, checkSlugAvailability } from '@/server/actions/profile'
import { ExternalLink, Check, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    slug: '',
    bio: '',
    photo: '',
    whatsapp: '',
    cidade: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const result = await getMyProfile()
    if (result.success && result.profile) {
      setFormData({
        name: result.profile.user.name,
        email: result.profile.user.email,
        slug: result.profile.slug || '',
        bio: result.profile.bio || '',
        photo: result.profile.photo || '',
        whatsapp: result.profile.whatsapp || '',
        cidade: result.profile.cidade || ''
      })
    }
    setLoading(false)
  }

  const handleSlugChange = async (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setFormData({ ...formData, slug })
    
    if (slug.length >= 3) {
      setSlugChecking(true)
      const result = await checkSlugAvailability(slug)
      if (result.success) {
        setSlugAvailable(result.available)
      }
      setSlugChecking(false)
    } else {
      setSlugAvailable(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const result = await updateCorretorProfile({
        slug: formData.slug,
        bio: formData.bio,
        photo: formData.photo,
        whatsapp: formData.whatsapp,
        cidade: formData.cidade
      })

      if (result.success) {
        setSuccess('Perfil atualizado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Erro ao atualizar perfil')
      }
    } catch (err) {
      setError('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Configure suas informações públicas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Readonly Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={formData.name}
                  disabled
                />
                <Input
                  label="Email"
                  value={formData.email}
                  disabled
                />
              </div>

              {/* Slug */}
              <div className="relative">
                <Input
                  label="Slug Personalizado"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                  disabled={saving}
                  placeholder="meu-nome-imoveis"
                />
                <div className="mt-1 flex items-center gap-2 text-sm">
                  {slugChecking && (
                    <span className="text-gray-500">Verificando...</span>
                  )}
                  {!slugChecking && slugAvailable === true && formData.slug.length >= 3 && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Slug disponível
                    </span>
                  )}
                  {!slugChecking && slugAvailable === false && (
                    <span className="text-red-600 flex items-center gap-1">
                      <X className="w-4 h-4" /> Slug já está em uso
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sua página pública será: /corretor/{formData.slug}
                </p>
              </div>

              {/* Photo URL */}
              <div>
                <Input
                  label="URL da Foto de Perfil"
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  disabled={saving}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                />
                {formData.photo && (
                  <div className="mt-2">
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = ''
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  disabled={saving}
                  maxLength={500}
                  placeholder="Conte um pouco sobre você e sua experiência..."
                />
                <span className="text-xs text-gray-500">
                  {formData.bio.length}/500 caracteres
                </span>
              </div>

              {/* WhatsApp and Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="WhatsApp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  disabled={saving}
                  placeholder="(11) 99999-9999"
                />
                <Input
                  label="Cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  disabled={saving}
                  placeholder="São Paulo, SP"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  {success}
                </div>
              )}

              <Button type="submit" disabled={saving || slugAvailable === false} className="w-full">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Preview da Página Pública</h3>
            
            {formData.slug && slugAvailable !== false ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                  {formData.cidade && (
                    <p className="text-sm text-gray-600">{formData.cidade}</p>
                  )}
                  {formData.bio && (
                    <p className="text-sm text-gray-700 mt-2">{formData.bio}</p>
                  )}
                </div>

                <Link
                  href={`/corretor/${formData.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver Página Pública
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Configure seu slug para ver o preview
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
