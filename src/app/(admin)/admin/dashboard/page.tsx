import { getAllCorretores } from '@/server/actions/admin'
import { getAllImoveisAdmin } from '@/server/actions/admin'
import { getAllLeads } from '@/server/actions/leads'
import { Card } from '@/components/ui/Card'
import { Building2, UserCheck, Users, UserX } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const corretoresResult = await getAllCorretores()
  const imoveisResult = await getAllImoveisAdmin()
  const leadsResult = await getAllLeads()

  const corretores = corretoresResult.success ? corretoresResult.corretores : []
  const imoveis = imoveisResult.success ? imoveisResult.imoveis : []
  const leads = leadsResult.success ? leadsResult.leads : []

  const corretoresAtivos = corretores?.filter((c: any) => c.user.active).length || 0
  const corretoresPendentes = corretores?.filter((c: any) => !c.approved).length || 0

  return (
    <div className="px-4 py-6 sm:px-0 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Visão geral da operação e atividade da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <Card className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Total de Corretores</h3>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{corretores?.length || 0}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Corretores Ativos</h3>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{corretoresAtivos}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Pendentes Aprovação</h3>
              <p className="mt-2 text-3xl font-semibold text-amber-600">{corretoresPendentes}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Total de Imóveis</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">{imoveis?.length || 0}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Últimos Leads</h2>
          {leads && leads.length > 0 ? (
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="border-b border-slate-100 pb-4 last:border-b-0">
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.email}</p>
                  <p className="text-sm text-indigo-600">
                    {lead.imovel?.titulo || 'Imóvel não informado / removido'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Corretor: {lead.corretor.user.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">Nenhum lead ainda</p>
          )}
        </Card>

        <Card className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Últimos Imóveis</h2>
          {imoveis && imoveis.length > 0 ? (
            <div className="space-y-4">
              {imoveis.slice(0, 5).map((imovel: any) => (
                <div key={imovel.id} className="border-b border-slate-100 pb-4 last:border-b-0">
                  <p className="font-medium text-slate-900">{imovel.titulo}</p>
                  <p className="text-sm text-slate-500">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Corretor: {imovel.corretor.user.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">Nenhum imóvel ainda</p>
          )}
        </Card>
      </div>
    </div>
  )
}
