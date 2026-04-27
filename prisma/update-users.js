require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Baron123', 10);

  await prisma.user.create({ data: { name: 'Milagros', email: 'ozoratsubasa552@gmail.com', password: hash, role: 'ADMIN' } });
  await prisma.user.create({ data: { name: 'Milagros', email: 'milagros@negocio.com', password: hash, role: 'ADMIN' } });

  console.log('✅ Usuarios actualizados');
  console.log('Usuario 1: ozoratsubasa552@gmail.com / Baron123');
  console.log('Usuario 2: milagros@negocio.com / Baron123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
