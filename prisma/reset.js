require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpiando base de datos...');

  // Delete in dependency order
  await prisma.scheduledMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.creditSale.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos eliminados');

  // Create real user
  const user = await prisma.user.create({
    data: {
      name: 'Milagros',
      email: 'ozoratsubasa552@gmail.com',
      password: await bcrypt.hash('Baron123', 10),
      role: 'ADMIN',
    },
  });

  console.log('\n🎉 Listo!');
  console.log('📧 Email:      ' + user.email);
  console.log('🔑 Contraseña: Baron123');
  console.log('\nAhora puedes ingresar y cargar tus datos reales.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
