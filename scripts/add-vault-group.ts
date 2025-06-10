import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addVaultGroup() {
  try {
    console.log('Adding vault group permissions...')

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

    // Find the vault role
    const vaultRole = await prisma.role.findUnique({
      where: { name: 'vault' }
    })

    if (!vaultRole) {
      console.error('Vault role not found! Make sure you run the seed script first.')
      return
    }

    console.log('Found vault role:', vaultRole)

    // You'll need to replace this with your actual Azure AD group ID for "vault"
    // You can find this in the Azure AD portal or by calling the Graph API
    const VAULT_GROUP_AZURE_ID = 'YOUR_AZURE_GROUP_ID_HERE'

    // Create or update the group
    const group = await prisma.group.upsert({
      where: { azureId: VAULT_GROUP_AZURE_ID },
      update: {
        displayName: 'vault'
      },
      create: {
        azureId: VAULT_GROUP_AZURE_ID,
        displayName: 'vault',
        description: 'Vault access group'
      }
    })

    console.log('Created/updated group:', group)

    // Add vault role to the group
    await prisma.groupRole.upsert({
      where: {
        groupId_roleId: {
          groupId: group.id,
          roleId: vaultRole.id
        }
      },
      update: {},
      create: {
        groupId: group.id,
        roleId: vaultRole.id
      }
    })

    console.log('✅ Vault group permissions added successfully!')
    console.log('Users in the "vault" Azure AD group should now have vault access.')

  } catch (error) {
    console.error('Error adding vault group:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addVaultGroup()