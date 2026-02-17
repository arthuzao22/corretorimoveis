'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { registerUser } from '@/server/actions/auth'
import { Navbar } from '@/components/ui/Navbar'

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Cadastro</h1>
        
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
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Já tem uma conta? </span>
          <Link href="/login" className="text-blue-600 hover:underline">
            Faça login
          </Link>
        </div>
      </Card>
      </div>
    </div>
  )
}
