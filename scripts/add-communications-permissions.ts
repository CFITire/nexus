import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCommunicationsPermissions() {
  try {
    console.log('Adding communications module permissions...')

    // Define communications module permissions
    const communicationsPermissions = [
      {
        module: 'communications',
        action: 'read',
        description: 'View communications dashboard and call history'
      },
      {
        module: 'communications',
        action: 'create',
        description: 'Make outbound calls and create call records'
      },
      {
        module: 'communications',
        action: 'update',
        description: 'Update call records and communication settings'
      },
      {
        module: 'communications',
        action: 'delete',
        description: 'Delete call records and communication data'
      },
      {
        module: 'communications',
        action: 'manage',
        description: 'Manage communication settings and configure phone system'
      }
    ]

    // Create permissions
    for (const permission of communicationsPermissions) {
      const result = await prisma.permission.upsert({
        where: {
          module_action: {
            module: permission.module,
            action: permission.action
          }
        },
        update: {
          description: permission.description
        },
        create: permission
      })
      console.log(`✅ Created/updated permission: ${permission.module}:${permission.action}`)
    }

    // Find the Nexus-SuperAdministrators group
    const superAdminGroup = await prisma.group.findFirst({
      where: {
        displayName: 'Nexus-SuperAdministrators'
      }
    })

    if (superAdminGroup) {
      // Add all communications permissions to super admin group
      const allCommunicationsPermissions = await prisma.permission.findMany({
        where: {
          module: 'communications'
        }
      })

      for (const permission of allCommunicationsPermissions) {
        await prisma.groupPermission.upsert({
          where: {
            groupId_permissionId: {
              groupId: superAdminGroup.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            groupId: superAdminGroup.id,
            permissionId: permission.id
          }
        })
        console.log(`✅ Added ${permission.module}:${permission.action} to Nexus-SuperAdministrators`)
      }
    } else {
      console.log('⚠️ Nexus-SuperAdministrators group not found. Run add-superadmin-permissions.ts first.')
    }

    console.log('✅ Communications module permissions added successfully!')

  } catch (error) {
    console.error('Error adding communications permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCommunicationsPermissions()