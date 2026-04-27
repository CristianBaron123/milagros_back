require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Baron123', 10);

  await prisma.user.create({ data: { name: 'Cristian', email: 'ozoratsubasa552@gmail.com', password: await bcrypt.hash('Baron123', 10), role: 'ADMIN' } });
  await prisma.user.create({ data: { name: 'Milagros', email: 'milagros@negocio.com', password: await bcrypt.hash('Milagros123', 10), role: 'ADMIN' } });

  console.log('✅ Usuarios actualizados');
  console.log('Usuario 1: ozoratsubasa552@gmail.com / Baron123');
  console.log('Usuario 2: milagros@negocio.com / Milagros123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
