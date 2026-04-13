const { PrismaClient } = require('@prisma/client');

// Set the correct database URL for the running docker container
process.env.DATABASE_URL = 'postgresql://serenvi_user:serenvi_password_secure@localhost:5432/serenvi';

const prisma = new PrismaClient();

async function makeAdmin() {
  // Find all users
  const users = await prisma.user.findMany({ select: { id: true, email: true, isAdmin: true } });
  console.log('Current users:', users);

  if (users.length === 0) {
    console.log('No users found');
    return;
  }

  // Make the first user admin (or specify email)
  const email = process.argv[2] || users[0].email;
  
  const updated = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`\n✅ Made ${updated.email} an admin!`);
  console.log('⚠️  You need to log out and log back in for the change to take effect.');
}

makeAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
