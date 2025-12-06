import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Limpar dados existentes
  await prisma.lead.deleteMany()
  await prisma.imovel.deleteMany()
  await prisma.corretorProfile.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

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
          approved: true
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
          approved: true
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
      valor: 450000,
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
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
      valor: 850000,
      endereco: 'Rua dos Lírios, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-890',
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
      valor: 1200,
      endereco: 'Avenida Paulista, 789',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01311-000',
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
      valor: 3500,
      endereco: 'Avenida Faria Lima, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01452-000',
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
      valor: 2500000,
      endereco: 'Rua Haddock Lobo, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01414-000',
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
      message: 'Tenho interesse em visitar o imóvel este fim de semana.'
    }
  })

  await prisma.lead.create({
    data: {
      imovelId: imovel2.id,
      corretorId: corretor1User.corretorProfile!.id,
      name: 'Ana Costa',
      email: 'ana@example.com',
      phone: '(11) 98888-7777',
      message: 'Gostaria de mais informações sobre financiamento.'
    }
  })

  await prisma.lead.create({
    data: {
      imovelId: imovel4.id,
      corretorId: corretor2User.corretorProfile!.id,
      name: 'Carlos Mendes',
      email: 'carlos@example.com',
      phone: '(11) 97777-6666',
      message: 'Preciso de uma sala comercial urgentemente.'
    }
  })

  console.log('✅ Created leads')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Admin: admin@example.com / 123456')
  console.log('   Corretor 1: joao@example.com / 123456')
  console.log('   Corretor 2: maria@example.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
