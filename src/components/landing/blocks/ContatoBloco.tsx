'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MessageCircle, Phone, Mail, User } from 'lucide-react'
import { createLeadFromLanding } from '@/server/actions/landing'

interface ContatoBlocoProps {
  bloco: any
  corretorId: string
  whatsapp?: string
}

export function ContatoBloco({ bloco, corretorId, whatsapp }: ContatoBlocoProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createLeadFromLanding({
      corretorId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message
    })

    if (result.success) {
      setSuccess(true)
      setFormData({ name: '', phone: '', email: '', message: '' })
      setTimeout(() => setSuccess(false), 5000)
    } else {
      alert('Erro ao enviar mensagem. Tente novamente.')
    }

    setLoading(false)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {bloco.titulo && (
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            {bloco.titulo}
          </h2>
        )}
        {bloco.subtitulo && (
          <p className="text-xl text-gray-600 text-center mb-12">
            {bloco.subtitulo}
          </p>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Mensagem Enviada!
              </h3>
              <p className="text-gray-600">
                Entraremos em contato em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone/WhatsApp *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-mail
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Como podemos ajudar?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          )}

          {whatsapp && !success && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">Ou entre em contato direto via WhatsApp</p>
              <a
                href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar no WhatsApp
              </a>
            </div>
          )}
        </div>

        {bloco.texto && (
          <p className="text-gray-600 text-center mt-8">
            {bloco.texto}
          </p>
        )}
      </div>
    </section>
  )
}
