import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Limpar dados existentes (ordem importante por causa das FKs)
  await prisma.landingBloco.deleteMany()
  await prisma.leadTimeline.deleteMany()
  await prisma.eventoCalendario.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.imovel.deleteMany()
  await prisma.corretorProfile.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.kanbanPermission.deleteMany()
  await prisma.kanbanColumn.deleteMany()
  await prisma.kanbanBoard.deleteMany()
  await prisma.user.deleteMany()
  await prisma.cidade.deleteMany()
  await prisma.imovelStatusConfig.deleteMany()
  await prisma.leadStatusConfig.deleteMany()

  console.log('✅ Cleared existing data')

  // =============================================
  // CRIAR DADOS NORMALIZADOS
  // =============================================

  // Criar Cidades (principais cidades brasileiras)
  const cidadesSeed = [
    { nome: 'São Paulo', uf: 'SP' },
    { nome: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'Belo Horizonte', uf: 'MG' },
    { nome: 'Curitiba', uf: 'PR' },
    { nome: 'Porto Alegre', uf: 'RS' },
    { nome: 'Brasília', uf: 'DF' },
    { nome: 'Salvador', uf: 'BA' },
    { nome: 'Fortaleza', uf: 'CE' },
    { nome: 'Recife', uf: 'PE' },
    { nome: 'Manaus', uf: 'AM' },
    { nome: 'Belém', uf: 'PA' },
    { nome: 'Goiânia', uf: 'GO' },
    { nome: 'Campinas', uf: 'SP' },
    { nome: 'Santos', uf: 'SP' },
    { nome: 'Guarulhos', uf: 'SP' },
    { nome: 'São Bernardo do Campo', uf: 'SP' },
    { nome: 'Santo André', uf: 'SP' },
    { nome: 'Osasco', uf: 'SP' },
    { nome: 'Ribeirão Preto', uf: 'SP' },
    { nome: 'Sorocaba', uf: 'SP' },
    { nome: 'Niterói', uf: 'RJ' },
    { nome: 'Nova Iguaçu', uf: 'RJ' },
    { nome: 'Duque de Caxias', uf: 'RJ' },
    { nome: 'São Gonçalo', uf: 'RJ' },
    { nome: 'Contagem', uf: 'MG' },
    { nome: 'Uberlândia', uf: 'MG' },
    { nome: 'Juiz de Fora', uf: 'MG' },
    { nome: 'Londrina', uf: 'PR' },
    { nome: 'Maringá', uf: 'PR' },
    { nome: 'Canoas', uf: 'RS' },
    { nome: 'Caxias do Sul', uf: 'RS' },
    { nome: 'Pelotas', uf: 'RS' },
    { nome: 'Feira de Santana', uf: 'BA' },
    { nome: 'Vitória da Conquista', uf: 'BA' },
    { nome: 'Aracaju', uf: 'SE' },
    { nome: 'Maceió', uf: 'AL' },
    { nome: 'João Pessoa', uf: 'PB' },
    { nome: 'Natal', uf: 'RN' },
    { nome: 'Teresina', uf: 'PI' },
    { nome: 'São Luís', uf: 'MA' },
    { nome: 'Palmas', uf: 'TO' },
    { nome: 'Campo Grande', uf: 'MS' },
    { nome: 'Cuiabá', uf: 'MT' },
    { nome: 'Florianópolis', uf: 'SC' },
    { nome: 'Joinville', uf: 'SC' },
    { nome: 'Blumenau', uf: 'SC' },
    { nome: 'Vitória', uf: 'ES' },
    { nome: 'Vila Velha', uf: 'ES' },
    { nome: 'Cariacica', uf: 'ES' },
    { nome: 'Macapá', uf: 'AP' },
    { nome: 'Boa Vista', uf: 'RR' },
    { nome: 'Rio Branco', uf: 'AC' },
    { nome: 'Porto Velho', uf: 'RO' }
  ]

  const cidadesCriadas = await Promise.all(
    cidadesSeed.map(({ nome, uf }) =>
      prisma.cidade.create({
        data: {
          nome,
          uf,
          slug: `${nome.toLowerCase().replace(/\s+/g, '-').replace(/[çã]/g, 'c').replace(/[ñ]/g, 'n')}-${uf.toLowerCase()}`,
        }
      })
    )
  )

  // Referências para as principais cidades (compatibilidade com código existente)
  const cidadeSP = cidadesCriadas.find(c => c.nome === 'São Paulo' && c.uf === 'SP')!
  const cidadeRJ = cidadesCriadas.find(c => c.nome === 'Rio de Janeiro' && c.uf === 'RJ')!
  const cidadeBH = cidadesCriadas.find(c => c.nome === 'Belo Horizonte' && c.uf === 'MG')!
  const cidadeCuritiba = cidadesCriadas.find(c => c.nome === 'Curitiba' && c.uf === 'PR')!
  const cidadePOA = cidadesCriadas.find(c => c.nome === 'Porto Alegre' && c.uf === 'RS')!

  console.log('✅ Created cidades')

  // Criar Status de Imóvel Configuráveis
  const statusDisponivel = await prisma.imovelStatusConfig.create({
    data: {
      nome: 'Disponível',
      slug: 'disponivel',
      cor: '#10B981', // green
      ordem: 1,
    }
  })

  const statusReservado = await prisma.imovelStatusConfig.create({
    data: {
      nome: 'Reservado',
      slug: 'reservado',
      cor: '#F59E0B', // amber
      ordem: 2,
    }
  })

  const statusEmNegociacao = await prisma.imovelStatusConfig.create({
    data: {
      nome: 'Em Negociação',
      slug: 'em-negociacao',
      cor: '#3B82F6', // blue
      ordem: 3,
    }
  })

  const statusVendido = await prisma.imovelStatusConfig.create({
    data: {
      nome: 'Vendido',
      slug: 'vendido',
      cor: '#8B5CF6', // purple
      ordem: 4,
    }
  })

  const statusAlugado = await prisma.imovelStatusConfig.create({
    data: {
      nome: 'Alugado',
      slug: 'alugado',
      cor: '#6366F1', // indigo
      ordem: 5,
    }
  })

  const statusIndisponivel = await prisma.imovelStatusConfig.create({
    data: {
      nome: 'Indisponível',
      slug: 'indisponivel',
      cor: '#EF4444', // red
      ordem: 6,
    }
  })

  console.log('✅ Created imovel status configs')

  // Criar Status de Lead Configuráveis
  const leadNovo = await prisma.leadStatusConfig.create({
    data: {
      nome: 'Novo',
      slug: 'novo',
      cor: '#3B82F6', // blue
      ordem: 1,
    }
  })

  const leadEmContato = await prisma.leadStatusConfig.create({
    data: {
      nome: 'Em Contato',
      slug: 'em-contato',
      cor: '#F59E0B', // amber
      ordem: 2,
    }
  })

  const leadAgendado = await prisma.leadStatusConfig.create({
    data: {
      nome: 'Visita Agendada',
      slug: 'visita-agendada',
      cor: '#8B5CF6', // purple
      ordem: 3,
    }
  })

  const leadProposta = await prisma.leadStatusConfig.create({
    data: {
      nome: 'Proposta Enviada',
      slug: 'proposta-enviada',
      cor: '#6366F1', // indigo
      ordem: 4,
    }
  })

  const leadFechado = await prisma.leadStatusConfig.create({
    data: {
      nome: 'Fechado',
      slug: 'fechado',
      cor: '#10B981', // green
      ordem: 5,
    }
  })

  const leadPerdido = await prisma.leadStatusConfig.create({
    data: {
      nome: 'Perdido',
      slug: 'perdido',
      cor: '#EF4444', // red
      ordem: 6,
    }
  })

  console.log('✅ Created lead status configs')

  // =============================================
  // CRIAR KANBAN BOARD E COLUNAS
  // =============================================

  const globalBoard = await prisma.kanbanBoard.create({
    data: {
      name: 'Pipeline de Vendas',
      isGlobal: true,
    }
  })

  const colNovo = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Novo',
      order: 0,
      color: '#3B82F6', // blue
      isFinal: false,
    }
  })

  const colContatado = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Contatado',
      order: 1,
      color: '#8B5CF6', // purple
      isFinal: false,
    }
  })

  const colAcompanhamento = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Acompanhamento',
      order: 2,
      color: '#F59E0B', // yellow/amber
      isFinal: false,
    }
  })

  const colVisitaAgendada = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Visita Agendada',
      order: 3,
      color: '#6366F1', // indigo
      isFinal: false,
    }
  })

  const colNegociacao = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Negociação',
      order: 4,
      color: '#F97316', // orange
      isFinal: false,
    }
  })

  const colFechado = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Fechado',
      order: 5,
      color: '#10B981', // green
      isFinal: true,
    }
  })

  const colPerdido = await prisma.kanbanColumn.create({
    data: {
      boardId: globalBoard.id,
      name: 'Perdido',
      order: 6,
      color: '#EF4444', // red
      isFinal: true,
    }
  })

  console.log('✅ Created Kanban board and columns')

  // =============================================
  // CRIAR USUÁRIOS E DADOS PRINCIPAIS
  // =============================================

  // Hash da senha padrão
  const hashedPassword = await bcrypt.hash('123456', 12)

  // Criar Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      admin: {
        create: {}
      }
    }
  })
  console.log('✅ Created admin user')

  // Criar Corretores
  const corretor1User = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com',
      password: hashedPassword,
      role: 'CORRETOR',
      corretorProfile: {
        create: {
          slug: 'joao-silva',
          bio: 'Corretor especializado em imóveis residenciais com 10 anos de experiência no mercado.',
          phone: '(11) 98765-4321',
          whatsapp: '11987654321',
          cidade: 'São Paulo',
          cidadeId: cidadeSP.id,
          approved: true,
          landingAtiva: true
        }
      }
    },
    include: {
      corretorProfile: true
    }
  })

  const corretor2User = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: hashedPassword,
      role: 'CORRETOR',
      corretorProfile: {
        create: {
          slug: 'maria-santos',
          bio: 'Especialista em imóveis comerciais e de alto padrão.',
          phone: '(11) 98765-1234',
          whatsapp: '11987651234',
          cidade: 'São Paulo',
          cidadeId: cidadeSP.id,
          approved: true,
          landingAtiva: true
        }
      }
    },
    include: {
      corretorProfile: true
    }
  })

  console.log('✅ Created corretor users')

  // Criar Imóveis para o Corretor 1
  const imovel1 = await prisma.imovel.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      titulo: 'Apartamento 3 Quartos no Centro',
      descricao: 'Excelente apartamento com 3 quartos, 2 banheiros, sala ampla e cozinha completa. Localizado no coração da cidade.',
      tipo: 'VENDA',
      status: 'ATIVO',
      statusConfigId: statusDisponivel.id,
      valor: 450000,
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      cidadeId: cidadeSP.id,
      estado: 'SP',
      cep: '01234-567',
      quartos: 3,
      banheiros: 2,
      suites: 1,
      area: 85,
      garagem: 1,
      condominio: 650,
      iptu: 280,
      views: 15
    }
  })

  const imovel2 = await prisma.imovel.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      titulo: 'Casa com Piscina em Condomínio Fechado',
      descricao: 'Linda casa de 4 quartos com piscina, churrasqueira e área de lazer completa em condomínio de alto padrão.',
      tipo: 'VENDA',
      status: 'ATIVO',
      statusConfigId: statusDisponivel.id,
      valor: 850000,
      endereco: 'Rua dos Lírios, 456',
      cidade: 'São Paulo',
      cidadeId: cidadeSP.id,
      estado: 'SP',
      cep: '01234-890',
      quartos: 4,
      banheiros: 4,
      suites: 2,
      area: 280,
      areaTerreno: 450,
      garagem: 3,
      condominio: 1200,
      views: 32
    }
  })

  const imovel3 = await prisma.imovel.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      titulo: 'Kitnet Mobiliada para Aluguel',
      descricao: 'Kitnet completamente mobiliada, ideal para estudantes ou profissionais. Próximo ao metrô.',
      tipo: 'ALUGUEL',
      status: 'ATIVO',
      statusConfigId: statusDisponivel.id,
      valor: 1200,
      endereco: 'Avenida Paulista, 789',
      cidade: 'São Paulo',
      cidadeId: cidadeSP.id,
      estado: 'SP',
      cep: '01311-000',
      quartos: 1,
      banheiros: 1,
      area: 32,
      condominio: 350,
      views: 48
    }
  })

  // Criar Imóveis para o Corretor 2
  const imovel4 = await prisma.imovel.create({
    data: {
      corretorId: corretor2User.corretorProfile!.id,
      titulo: 'Sala Comercial em Prédio Empresarial',
      descricao: 'Sala comercial de 80m² em prédio empresarial moderno. 2 vagas de garagem incluídas.',
      tipo: 'ALUGUEL',
      status: 'ATIVO',
      statusConfigId: statusDisponivel.id,
      valor: 3500,
      endereco: 'Avenida Faria Lima, 1000',
      cidade: 'São Paulo',
      cidadeId: cidadeSP.id,
      estado: 'SP',
      cep: '01452-000',
      area: 80,
      garagem: 2,
      condominio: 800,
      views: 22
    }
  })

  const imovel5 = await prisma.imovel.create({
    data: {
      corretorId: corretor2User.corretorProfile!.id,
      titulo: 'Cobertura Duplex com Vista Panorâmica',
      descricao: 'Luxuosa cobertura duplex com 5 suítes, terraço gourmet e vista panorâmica da cidade.',
      tipo: 'VENDA',
      status: 'ATIVO',
      statusConfigId: statusEmNegociacao.id,
      valor: 2500000,
      endereco: 'Rua Haddock Lobo, 500',
      cidade: 'São Paulo',
      cidadeId: cidadeSP.id,
      estado: 'SP',
      cep: '01414-000',
      quartos: 5,
      banheiros: 6,
      suites: 5,
      area: 450,
      garagem: 4,
      condominio: 2500,
      views: 67
    }
  })

  console.log('✅ Created imoveis')

  // Criar alguns Leads
  await prisma.lead.create({
    data: {
      imovelId: imovel1.id,
      corretorId: corretor1User.corretorProfile!.id,
      name: 'Pedro Oliveira',
      email: 'pedro@example.com',
      phone: '(11) 99999-8888',
      message: 'Tenho interesse em visitar o imóvel este fim de semana.',
      origem: 'imovel',
      statusConfigId: leadNovo.id,
      kanbanColumnId: colNovo.id,
    }
  })

  await prisma.lead.create({
    data: {
      imovelId: imovel2.id,
      corretorId: corretor1User.corretorProfile!.id,
      name: 'Ana Costa',
      email: 'ana@example.com',
      phone: '(11) 98888-7777',
      message: 'Gostaria de mais informações sobre financiamento.',
      origem: 'landing',
      statusConfigId: leadEmContato.id,
      kanbanColumnId: colContatado.id,
    }
  })

  await prisma.lead.create({
    data: {
      imovelId: imovel4.id,
      corretorId: corretor2User.corretorProfile!.id,
      name: 'Carlos Mendes',
      email: 'carlos@example.com',
      phone: '(11) 97777-6666',
      message: 'Preciso de uma sala comercial urgentemente.',
      origem: 'perfil',
      statusConfigId: leadAgendado.id,
      dataAgendamento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
      kanbanColumnId: colVisitaAgendada.id,
    }
  })

  console.log('✅ Created leads')

  // Criar Landing Blocos para o Corretor 1
  await prisma.landingBloco.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      tipo: 'hero',
      titulo: 'Encontre o Imóvel dos Seus Sonhos',
      subtitulo: 'Com mais de 10 anos de experiência no mercado imobiliário',
      texto: 'Especializado em imóveis residenciais em São Paulo. Atendimento personalizado e completo.',
      imagens: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200'],
      ordem: 0,
      ativo: true
    }
  })

  await prisma.landingBloco.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      tipo: 'historia',
      titulo: 'Nossa História',
      subtitulo: 'Conectando pessoas aos seus lares ideais',
      texto: 'Há mais de uma década, venho ajudando famílias a encontrar o lar perfeito. Com dedicação, transparência e compromisso, transformo sonhos em realidade.',
      imagens: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800'
      ],
      ordem: 1,
      ativo: true
    }
  })

  await prisma.landingBloco.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      tipo: 'imoveis',
      titulo: 'Imóveis em Destaque',
      subtitulo: 'Confira nossas melhores oportunidades',
      ordem: 2,
      ativo: true
    }
  })

  await prisma.landingBloco.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      tipo: 'cta',
      titulo: 'Pronto para Encontrar Seu Imóvel?',
      subtitulo: 'Entre em contato agora e agende uma visita',
      texto: 'Estou pronto para ajudá-lo a encontrar o imóvel perfeito para você e sua família.',
      ordem: 3,
      ativo: true
    }
  })

  await prisma.landingBloco.create({
    data: {
      corretorId: corretor1User.corretorProfile!.id,
      tipo: 'contato',
      titulo: 'Fale Comigo',
      subtitulo: 'Tire suas dúvidas e agende uma visita',
      texto: 'Preencha o formulário abaixo ou entre em contato direto via WhatsApp.',
      ordem: 4,
      ativo: true
    }
  })

  console.log('✅ Created landing blocos')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Admin: admin@example.com / 123456')
  console.log('   Corretor 1: joao@example.com / 123456')
  console.log('   Corretor 2: maria@example.com / 123456')
  console.log('\n🔗 Landing Pages:')
  console.log('   João Silva: /lp/joao-silva')
  console.log('   Maria Santos: /lp/maria-santos')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
