import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addAdminPermissions() {
  try {
    console.log('Adding admin impersonation permissions...')

    // Find or create the admin permission
    const adminPermission = await prisma.permission.upsert({
      where: {
        module_action: {
          module: 'admin',
          action: 'impersonate'
        }
      },
      update: {},
      create: {
        module: 'admin',
        action: 'impersonate',
        description: 'Ability to impersonate other users for support and testing'
      }
    })

    console.log('Admin permission created/found:', adminPermission.id)

    // Find the SuperAdministrators group
    const superAdminGroup = await prisma.group.findFirst({
      where: {
        displayName: 'Nexus-SuperAdministrators'
      }
    })

    if (!superAdminGroup) {
      console.error('SuperAdministrators group not found!')
      return
    }

    console.log('SuperAdministrators group found:', superAdminGroup.id)

    // Add the permission to the SuperAdministrators group
    await prisma.groupPermission.upsert({
      where: {
        groupId_permissionId: {
          groupId: superAdminGroup.id,
          permissionId: adminPermission.id
        }
      },
      update: {},
      create: {
        groupId: superAdminGroup.id,
        permissionId: adminPermission.id
      }
    })

    console.log('Admin impersonation permission added to SuperAdministrators group!')

    // Also add other useful admin permissions
    const adminPermissions = [
      { module: 'admin', action: 'read', description: 'View admin functions' },
      { module: 'admin', action: 'write', description: 'Modify admin settings' },
      { module: 'admin', action: 'delete', description: 'Delete admin resources' },
    ]

    for (const permConfig of adminPermissions) {
      const permission = await prisma.permission.upsert({
        where: {
          module_action: {
            module: permConfig.module,
            action: permConfig.action
          }
        },
        update: {},
        create: permConfig
      })

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
    }

    console.log('All admin permissions added successfully!')

  } catch (error) {
    console.error('Error adding admin permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addAdminPermissions()