'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Email ou senha inválidos')
        setLoading(false)
        return
      }

      if (result?.ok) {
        await new Promise(resolve => setTimeout(resolve, 100))

        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user?.role === 'ADMIN') {
          window.location.href = '/admin/dashboard'
        } else if (session?.user?.role === 'CORRETOR') {
          window.location.href = '/corretor/dashboard'
        } else {
          setError('Erro ao identificar tipo de usuário')
          setLoading(false)
        }
      } else {
        setError('Erro ao fazer login')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Erro ao fazer login')
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
              <LogIn className="w-5 h-5 text-indigo-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Login</h1>
            <p className="text-slate-500 text-sm mt-1">
              Acesse seu painel para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              type="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-slate-600">Não tem uma conta? </span>
            <Link
              href="/register"
              className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
            >
              Cadastre-se
            </Link>
          </div>

        </Card>
      </div>
    </div>
  )
}