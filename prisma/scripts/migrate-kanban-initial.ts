/**
 * Migration Script: Set Initial Kanban Column
 * 
 * This script:
 * 1. Marks the first column (lowest order) of each board as the initial column
 * 2. Assigns all leads without a kanbanColumnId to the initial column
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Kanban migration...\n')

  try {
    // Get all boards
    const boards = await prisma.kanbanBoard.findMany({
      include: {
        columns: {
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log(`Found ${boards.length} board(s)\n`)

    for (const board of boards) {
      if (board.columns.length === 0) {
        console.log(`⚠️  Board "${board.name}" has no columns, skipping...`)
        continue
      }

      // Get the first column (lowest order)
      const initialColumn = board.columns[0]

      console.log(`📋 Board: "${board.name}"`)
      console.log(`   Setting "${initialColumn.name}" as initial column`)

      // Mark this column as initial
      await prisma.kanbanColumn.update({
        where: { id: initialColumn.id },
        data: { isInitial: true }
      })

      // Unmark all other columns as initial (in case of duplicates)
      if (board.columns.length > 1) {
        await prisma.kanbanColumn.updateMany({
          where: {
            boardId: board.id,
            id: { not: initialColumn.id }
          },
          data: { isInitial: false }
        })
      }

      // Count leads without kanbanColumnId for this board's corretor
      const leadsWithoutColumn = await prisma.lead.count({
        where: {
          kanbanColumnId: null
        }
      })

      if (leadsWithoutColumn > 0) {
        console.log(`   Assigning ${leadsWithoutColumn} lead(s) without column to "${initialColumn.name}"`)

        // Assign all leads without a kanbanColumnId to the initial column
        const updated = await prisma.lead.updateMany({
          where: {
            kanbanColumnId: null
          },
          data: {
            kanbanColumnId: initialColumn.id
          }
        })

        console.log(`   ✅ Updated ${updated.count} lead(s)`)

        // Create timeline entries for migrated leads
        const migratedLeads = await prisma.lead.findMany({
          where: {
            kanbanColumnId: initialColumn.id,
            timeline: {
              none: {
                action: 'KANBAN_MOVED'
              }
            }
          },
          select: { id: true, name: true }
        })

        // Use createMany for better performance with bulk inserts
        if (migratedLeads.length > 0) {
          await prisma.leadTimeline.createMany({
            data: migratedLeads.map(lead => ({
              leadId: lead.id,
              action: 'KANBAN_MOVED' as const,
              description: `Lead migrado automaticamente para "${initialColumn.name}"`,
              metadata: {
                migration: true,
                toColumn: initialColumn.name,
                toColumnId: initialColumn.id
              }
            }))
          })
          
          console.log(`   📝 Created timeline entries for ${migratedLeads.length} lead(s)`)
        }
      } else {
        console.log(`   ℹ️  All leads already have a Kanban column assigned`)
      }

      console.log()
    }

    // Summary
    console.log('\n✅ Migration completed successfully!')
    
    const totalColumns = await prisma.kanbanColumn.count()
    const initialColumns = await prisma.kanbanColumn.count({
      where: { isInitial: true }
    })
    const leadsWithColumn = await prisma.lead.count({
      where: { kanbanColumnId: { not: null } }
    })
    const totalLeads = await prisma.lead.count()

    console.log('\n📊 Summary:')
    console.log(`   Total columns: ${totalColumns}`)
    console.log(`   Initial columns: ${initialColumns}`)
    console.log(`   Leads with column: ${leadsWithColumn}/${totalLeads}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
