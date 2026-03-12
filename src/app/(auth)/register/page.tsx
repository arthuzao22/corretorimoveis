'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { registerUser } from '@/server/actions/auth'
import { Navbar } from '@/components/ui/Navbar'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
    // role removido - tratado automaticamente no backend como CORRETOR
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
        // role removido - backend força CORRETOR para segurança
      })

      if (!result.success) {
        setError(result.error || 'Erro ao registrar')
        setLoading(false)
        return
      }

      router.push('/login')
    } catch (err) {
      setError('Erro ao registrar usuário')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastro</h1>
          <p className="text-slate-500 text-sm mt-1">Crie sua conta para começar a gerenciar seus leads.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
          
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
          
          <Input
            type="password"
            label="Senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading}
          />

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl p-2.5">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-slate-600">Já tem uma conta? </span>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline">
            Faça login
          </Link>
        </div>
      </Card>
      </div>
    </div>
  )
}
