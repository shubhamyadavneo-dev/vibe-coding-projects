import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { name: 'recipe:create', resource: 'recipe', action: 'create' },
    { name: 'recipe:read', resource: 'recipe', action: 'read' },
    { name: 'recipe:update', resource: 'recipe', action: 'update' },
    { name: 'recipe:delete', resource: 'recipe', action: 'delete' },
    { name: 'cookbook:create', resource: 'cookbook', action: 'create' },
    { name: 'cookbook:share', resource: 'cookbook', action: 'share' },
    { name: 'admin:manage', resource: 'admin', action: 'manage' },
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

  // Assign basic permissions to user (no delete or admin access)
  const userPerms = allPerms.filter(p => !['recipe:delete', 'admin:manage'].includes(p.name));
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

  // ── Bootstrap first admin user ─────────────────────────────────────────────
  // Set ADMIN_EMAIL in .env to auto-assign the admin role to that account.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const targetUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (targetUser) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: { userId: targetUser.id, roleId: adminRole.id }
        },
        update: {},
        create: { userId: targetUser.id, roleId: adminRole.id }
      });
      console.log(`✅ Admin role assigned to ${adminEmail}`);
    } else {
      console.warn(`⚠️  ADMIN_EMAIL is set to "${adminEmail}" but no matching user found. Register first, then re-run the seed.`);
    }
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
