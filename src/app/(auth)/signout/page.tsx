'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignOutPage() {
    const [loading, setLoading] = useState(false)

    const handleSignOut = async () => {
        setLoading(true)
        await signOut({ callbackUrl: '/' })
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
                            <LogOut className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sair do Sistema</h1>
                        <p className="text-slate-500 mb-8 text-sm sm:text-base">
                            Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={handleSignOut}
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl"
                            >
                                {loading ? 'Saindo...' : 'Sim, quero sair'}
                            </Button>

                            <Link href="/corretor/dashboard" className="block">
                                <Button
                                    variant="ghost"
                                    className="w-full text-slate-600 hover:text-slate-800 rounded-xl"
                                    disabled={loading}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Cancelar e voltar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
