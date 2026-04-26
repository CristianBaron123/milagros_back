require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const user = await prisma.user.upsert({
    where: { email: 'milagros@milagros.com' },
    update: {},
    create: { name: 'Milagros', email: 'milagros@milagros.com', password: await bcrypt.hash('milagros123', 10), role: 'ADMIN' },
  });
  console.log('✅ Usuario creado:', user.email);

  const cats = ['Cremas', 'Capilar', 'Maquillaje', 'Fragancias'];
  const categories = {};
  for (const name of cats) {
    const cat = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categories[name] = cat;
  }
  console.log('✅ Categorías creadas');

  const products = [
    { name: 'Crema Facial Hidratante Lait', brand: 'Yanbal', cat: 'Cremas', cost: 42000, retail: 68000, wholesale: 58000, stock: 12, min: 5 },
    { name: 'Shampoo Reparación Total 400ml', brand: 'Fuller', cat: 'Capilar', cost: 22000, retail: 38000, wholesale: 32000, stock: 3, min: 6 },
    { name: 'Labial Matte Rojo Pasión', brand: 'Avon', cat: 'Maquillaje', cost: 18000, retail: 32000, wholesale: 27000, stock: 18, min: 8 },
    { name: 'Perfume Unique Her EDP 50ml', brand: 'Yanbal', cat: 'Fragancias', cost: 95000, retail: 145000, wholesale: 125000, stock: 6, min: 3 },
    { name: 'Tratamiento Capilar Argán', brand: 'Fuller', cat: 'Capilar', cost: 30000, retail: 52000, wholesale: 44000, stock: 2, min: 5 },
    { name: 'Base Líquida Doble Cobertura', brand: 'Avon', cat: 'Maquillaje', cost: 34000, retail: 58000, wholesale: 49000, stock: 9, min: 4 },
    { name: 'Crema Antiarrugas Noche', brand: 'Yanbal', cat: 'Cremas', cost: 55000, retail: 89000, wholesale: 76000, stock: 7, min: 4 },
    { name: 'Rímel Volumen Extremo', brand: 'Avon', cat: 'Maquillaje', cost: 15000, retail: 28000, wholesale: 24000, stock: 1, min: 5 },
    { name: 'Body Splash Frutos Rojos', brand: 'Fuller', cat: 'Fragancias', cost: 24000, retail: 42000, wholesale: 36000, stock: 14, min: 6 },
    { name: 'Mascarilla Facial Carbón', brand: 'Avon', cat: 'Cremas', cost: 19000, retail: 35000, wholesale: 30000, stock: 11, min: 5 },
    { name: 'Perfume Esika Pulso EDT', brand: 'Yanbal', cat: 'Fragancias', cost: 78000, retail: 125000, wholesale: 108000, stock: 4, min: 3 },
    { name: 'Acondicionador Liso Perfecto', brand: 'Fuller', cat: 'Capilar', cost: 21000, retail: 36000, wholesale: 30000, stock: 15, min: 6 },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: { name: p.name, brand: p.brand, categoryId: categories[p.cat].id, costPrice: p.cost, retailPrice: p.retail, wholesalePrice: p.wholesale, stock: p.stock, minStock: p.min },
    });
  }
  console.log('✅ Productos creados');

  const zoneNames = ['Laureles', 'Belén', 'Envigado', 'Poblado', 'Robledo', 'Itagüí', 'Sabaneta'];
  const zones = {};
  for (const name of zoneNames) {
    const z = await prisma.zone.upsert({ where: { name }, update: {}, create: { name } });
    zones[name] = z;
  }
  console.log('✅ Zonas creadas');

  const customers = [
    { name: 'Yulieth Castaño', phone: '+573104528891', zone: 'Laureles', type: 'MAYOR', total: 1240000, visits: 14 },
    { name: 'Marcela Quintero', phone: '+573215678234', zone: 'Belén', type: 'DETAL', total: 380000, visits: 6 },
    { name: 'Diana Restrepo', phone: '+573008891234', zone: 'Envigado', type: 'MAYOR', total: 2150000, visits: 22 },
    { name: 'Sandra Patiño', phone: '+573145567823', zone: 'Robledo', type: 'DETAL', total: 290000, visits: 4 },
    { name: 'Catalina Mejía', phone: '+573123456789', zone: 'Poblado', type: 'MAYOR', total: 980000, visits: 11 },
    { name: 'Luz Marina Ríos', phone: '+573156678912', zone: 'Itagüí', type: 'DETAL', total: 420000, visits: 7 },
    { name: 'Paola Henao', phone: '+573209987654', zone: 'Sabaneta', type: 'DETAL', total: 510000, visits: 8 },
    { name: 'Liliana Gómez', phone: '+573012234567', zone: 'Laureles', type: 'MAYOR', total: 1680000, visits: 18 },
    { name: 'Andrea Ospina', phone: '+573108876543', zone: 'Belén', type: 'DETAL', total: 145000, visits: 2 },
    { name: 'Mónica Vélez', phone: '+573214567890', zone: 'Envigado', type: 'MAYOR', total: 870000, visits: 9 },
  ];

  for (const c of customers) {
    const lastDays = Math.floor(Math.random() * 20);
    const last = new Date(); last.setDate(last.getDate() - lastDays);
    await prisma.customer.create({
      data: { name: c.name, phone: c.phone, zoneId: zones[c.zone].id, type: c.type, totalLifetime: c.total, visitCount: c.visits, lastPurchaseAt: last },
    });
  }
  console.log('✅ Clientes creados');

  const templates = [
    { name: 'Saludo a clienta dormida', body: 'Hola {nombre} 💕 ¿Cómo vas? Hace ratico no nos vemos. Llegaron novedades hermosas que sé que te van a encantar. ¿Te paso el catálogo?', type: 'reactivacion' },
    { name: 'Recordatorio mayorista', body: 'Hola {nombre}, ¿cómo va el inventario por allá? Esta semana tengo precios especiales en Yanbal y Fuller para ti. ¿Hacemos pedido?', type: 'mayorista' },
    { name: 'Confirmación de pedido', body: 'Hola {nombre}! Confirmo tu pedido. Te lo llevo a {zona} hoy en la tardecita. ¡Mil gracias por la compra! 🌸', type: 'confirmacion' },
    { name: 'Feliz cumpleaños', body: '¡Feliz cumpleaños {nombre}! 🎂 Que este año esté lleno de cosas lindas. Te tengo un detallito de regalo con tu próxima compra 💕', type: 'cumpleanos' },
    { name: 'Promo del día', body: 'Hola {nombre}, hoy tengo productos con descuento especial. ¿Te interesa? Apartamos hasta las 6pm.', type: 'promo' },
  ];

  for (const t of templates) {
    await prisma.messageTemplate.create({ data: t });
  }
  console.log('✅ Plantillas de mensajes creadas');

  console.log('\n🎉 Seed completado!');
  console.log('📧 Email: milagros@milagros.com');
  console.log('🔑 Contraseña: milagros123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
