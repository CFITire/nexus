import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCrmPermissions() {
  try {
    console.log('Adding CRM module permissions...')

    // Create the CRM role if it doesn't exist
    const crmRole = await prisma.role.upsert({
      where: { name: 'crm' },
      update: {
        displayName: 'CRM',
        description: 'Customer Relationship Management module access'
      },
      create: {
        name: 'crm',
        displayName: 'CRM', 
        description: 'Customer Relationship Management module access'
      }
    })

    console.log('✅ Created/updated CRM role:', crmRole)

    // Find the Nexus-SuperAdministrators group
    const superAdminGroup = await prisma.group.findFirst({
      where: {
        displayName: 'Nexus-SuperAdministrators'
      }
    })

    if (superAdminGroup) {
      // Add CRM role to SuperAdministrators group
      await prisma.groupRole.upsert({
        where: {
          groupId_roleId: {
            groupId: superAdminGroup.id,
            roleId: crmRole.id
          }
        },
        update: {},
        create: {
          groupId: superAdminGroup.id,
          roleId: crmRole.id
        }
      })

      console.log('✅ Added CRM role to Nexus-SuperAdministrators group')
    } else {
      console.log('⚠️ Nexus-SuperAdministrators group not found. Please create it first.')
    }

    // Show all current roles
    const allRoles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    })
    
    console.log('\n📋 All available roles:')
    allRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.displayName})`)
    })

    console.log('\n✅ CRM permissions setup complete!')
    console.log('Users in the "Nexus-SuperAdministrators" Azure AD group now have access to the CRM module.')

  } catch (error) {
    console.error('Error adding CRM permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCrmPermissions()