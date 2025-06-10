import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create roles
  const roles = [
    {
      name: 'dashboard',
      displayName: 'Dashboard',
      description: 'Access to main dashboard'
    },
    {
      name: 'inspections',
      displayName: 'Inspections',
      description: 'Access to inspection forms'
    },
    {
      name: 'lifecycle',
      displayName: 'Lifecycle',
      description: 'Access to lifecycle management'
    },
    {
      name: 'team',
      displayName: 'Team',
      description: 'Access to team management'
    },
    {
      name: 'vault',
      displayName: 'Vault',
      description: 'Access to password vault'
    },
    {
      name: 'settings',
      displayName: 'Settings',
      description: 'Access to application settings'
    }
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description
      },
      create: role
    })
  }

  console.log('✅ Roles seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })