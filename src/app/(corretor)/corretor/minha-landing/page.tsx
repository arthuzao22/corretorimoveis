import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getLandingByCorretor } from '@/server/actions/landing'
import { CorretorLandingView } from '@/components/landing/CorretorLandingView'
import { Card } from '@/components/ui/Card'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function CorretorMinhaLandingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Buscar o perfil do corretor
  const corretorProfile = await prisma.corretorProfile.findFirst({
    where: { userId: session.user.id }
  })

  if (!corretorProfile) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            Perfil de corretor não encontrado
          </p>
        </Card>
      </div>
    )
  }

  const result = await getLandingByCorretor(corretorProfile.id)

  if (!result.success || !result.corretor) {
    notFound()
  }

  return <CorretorLandingView corretor={result.corretor} />
}
