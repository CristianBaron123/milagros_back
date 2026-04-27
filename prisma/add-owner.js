require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Milagros',
      email: 'milagros@negocio.com',
      password: await bcrypt.hash('Milagros123', 10),
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuario creado');
  console.log('📧 Email:      ' + user.email);
  console.log('🔑 Contraseña: Milagros123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
