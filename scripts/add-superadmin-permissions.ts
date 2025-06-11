import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSuperAdminPermissions() {
  try {
    console.log('Adding permissions to Nexus-SuperAdministrators group...')

    // First, let's see what groups exist
    const existingGroups = await prisma.group.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })
    
    console.log('Existing groups:', existingGroups.map(g => ({ 
      id: g.id, 
      displayName: g.displayName, 
      azureId: g.azureId 
    })))

    // Find all roles
    const allRoles = await prisma.role.findMany()
    console.log('Available roles:', allRoles.map(r => r.name))

    // You'll need to replace this with your actual Azure AD group ID for "Nexus-SuperAdministrators"
    // You can find this in the Azure AD portal or by calling the Graph API
    const SUPERADMIN_GROUP_AZURE_ID = 'YOUR_AZURE_GROUP_ID_HERE'

    // Create or update the group
    const group = await prisma.group.upsert({
      where: { azureId: SUPERADMIN_GROUP_AZURE_ID },
      update: {
        displayName: 'Nexus-SuperAdministrators'
      },
      create: {
        azureId: SUPERADMIN_GROUP_AZURE_ID,
        displayName: 'Nexus-SuperAdministrators',
        description: 'Super administrators group with access to all modules'
      }
    })

    console.log('Created/updated group:', group)

    // Add all roles to the super admin group
    for (const role of allRoles) {
      await prisma.groupRole.upsert({
        where: {
          groupId_roleId: {
            groupId: group.id,
            roleId: role.id
          }
        },
        update: {},
        create: {
          groupId: group.id,
          roleId: role.id
        }
      })
      console.log(`✅ Added ${role.name} role to Nexus-SuperAdministrators`)
    }

    console.log('✅ All permissions added to Nexus-SuperAdministrators group successfully!')
    console.log('Users in the "Nexus-SuperAdministrators" Azure AD group now have access to all modules including shipments.')

  } catch (error) {
    console.error('Error adding super admin permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSuperAdminPermissions()