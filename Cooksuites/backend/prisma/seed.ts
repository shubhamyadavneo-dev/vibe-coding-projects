import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { name: 'recipe:create', resource: 'recipe', action: 'create' },
    { name: 'recipe:read', resource: 'recipe', action: 'read' },
    { name: 'recipe:update', resource: 'recipe', action: 'update' },
    { name: 'recipe:delete', resource: 'recipe', action: 'delete' },
    { name: 'cookbook:create', resource: 'cookbook', action: 'create' },
    { name: 'cookbook:share', resource: 'cookbook', action: 'share' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Regular User' },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: { name: 'viewer', description: 'Read Only Viewer' },
  });

  // Assign all permissions to admin
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id
      }
    });
  }

  // Assign basic permissions to user
  const userPerms = allPerms.filter(p => !['recipe:delete'].includes(p.name));
  for (const perm of userPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: perm.id
      }
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
