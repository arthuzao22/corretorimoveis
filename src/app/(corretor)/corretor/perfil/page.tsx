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
      if (result.success && result.available !== undefined) {
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure suas informacoes publicas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {slugChecking && (
                    <span className="text-slate-500">Verificando...</span>
                  )}
                  {!slugChecking && slugAvailable === true && formData.slug.length >= 3 && (
                    <span className="text-emerald-600 flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4" /> Slug disponivel
                    </span>
                  )}
                  {!slugChecking && slugAvailable === false && (
                    <span className="text-red-600 flex items-center gap-1.5 font-medium">
                      <X className="w-4 h-4" /> Slug ja esta em uso
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Sua pagina publica sera: /corretor/{formData.slug}
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
                  <div className="mt-3">
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = ''
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-colors text-slate-800 placeholder:text-slate-400"
                  rows={4}
                  disabled={saving}
                  maxLength={500}
                  placeholder="Conte um pouco sobre voce e sua experiencia..."
                />
                <span className="text-xs text-slate-400">
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
                  placeholder="Sao Paulo, SP"
                />
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-50 p-3.5 rounded-xl border border-red-200 font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-emerald-700 text-sm bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 font-medium">
                  {success}
                </div>
              )}

              <button 
                type="submit" 
                disabled={saving || slugAvailable === false} 
                className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-800 mb-4">Preview da Pagina Publica</h3>
            
            {formData.slug && slugAvailable !== false ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h4 className="font-bold text-slate-800">{formData.name}</h4>
                  {formData.cidade && (
                    <p className="text-sm text-slate-500">{formData.cidade}</p>
                  )}
                  {formData.bio && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{formData.bio}</p>
                  )}
                </div>

                <Link
                  href={`/corretor/${formData.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium p-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Ver Pagina Publica
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">
                Configure seu slug para ver o preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
