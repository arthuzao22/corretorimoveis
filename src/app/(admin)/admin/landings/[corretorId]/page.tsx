import { getLandingByCorretor } from '@/server/actions/landing'
import { LandingEditor } from '@/components/landing/LandingEditor'
import { Card } from '@/components/ui/Card'
import { notFound } from 'next/navigation'

export default async function AdminLandingEditorPage({ 
  params 
}: { 
  params: Promise<{ corretorId: string }> 
}) {
  const { corretorId } = await params
  const result = await getLandingByCorretor(corretorId)

  if (!result.success || !result.corretor) {
    notFound()
  }

  return <LandingEditor corretor={result.corretor} />
}
