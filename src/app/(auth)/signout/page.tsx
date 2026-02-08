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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                            <LogOut className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sair do Sistema</h1>
                        <p className="text-gray-600 mb-8">
                            Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={handleSignOut}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                            >
                                {loading ? 'Saindo...' : 'Sim, quero sair'}
                            </Button>

                            <Link href="/corretor/dashboard" className="block">
                                <Button
                                    variant="ghost"
                                    className="w-full text-gray-600 hover:text-gray-800"
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
