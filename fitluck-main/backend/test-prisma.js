const prisma = require('./prisma/client');

async function test() {
  try {
    console.log('Testing Prisma connection...');
    
    // Try to find a user (any user)
    const users = await prisma.user.findMany({
      take: 5
    });
    
    console.log('Success! Found users:', users.length);
    console.log('Users:', users);
    
    // Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password_hash: 'testhash',
        name: 'Test User'
      }
    });
    
    console.log('Created test user:', testUser);
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();