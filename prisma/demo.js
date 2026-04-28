require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Cargando datos de demo...');

  // Categories
  const cats = {};
  for (const name of ['Cremas', 'Capilar', 'Maquillaje', 'Fragancias', 'Cuidado corporal']) {
    cats[name] = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Products
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Crema Facial Hidratante Lait',    brand: 'Yanbal',  categoryId: cats['Cremas'].id,           costPrice: 42000,  retailPrice: 68000,  wholesalePrice: 58000,  stock: 12, minStock: 5 } }),
    prisma.product.create({ data: { name: 'Shampoo Reparación Total 400ml',  brand: 'Fuller',  categoryId: cats['Capilar'].id,          costPrice: 22000,  retailPrice: 38000,  wholesalePrice: 32000,  stock: 3,  minStock: 6 } }),
    prisma.product.create({ data: { name: 'Labial Matte Rojo Pasión',        brand: 'Avon',    categoryId: cats['Maquillaje'].id,       costPrice: 18000,  retailPrice: 32000,  wholesalePrice: 27000,  stock: 18, minStock: 8 } }),
    prisma.product.create({ data: { name: 'Perfume Unique Her EDP 50ml',     brand: 'Yanbal',  categoryId: cats['Fragancias'].id,       costPrice: 95000,  retailPrice: 145000, wholesalePrice: 125000, stock: 6,  minStock: 3 } }),
    prisma.product.create({ data: { name: 'Tratamiento Capilar Argán',       brand: 'Fuller',  categoryId: cats['Capilar'].id,          costPrice: 30000,  retailPrice: 52000,  wholesalePrice: 44000,  stock: 2,  minStock: 5 } }),
    prisma.product.create({ data: { name: 'Base Líquida Doble Cobertura',    brand: 'Avon',    categoryId: cats['Maquillaje'].id,       costPrice: 34000,  retailPrice: 58000,  wholesalePrice: 49000,  stock: 9,  minStock: 4 } }),
    prisma.product.create({ data: { name: 'Crema Antiarrugas Noche',         brand: 'Yanbal',  categoryId: cats['Cremas'].id,           costPrice: 55000,  retailPrice: 89000,  wholesalePrice: 76000,  stock: 7,  minStock: 4 } }),
    prisma.product.create({ data: { name: 'Rímel Volumen Extremo',           brand: 'Avon',    categoryId: cats['Maquillaje'].id,       costPrice: 15000,  retailPrice: 28000,  wholesalePrice: 24000,  stock: 1,  minStock: 5 } }),
    prisma.product.create({ data: { name: 'Body Splash Frutos Rojos',        brand: 'Fuller',  categoryId: cats['Fragancias'].id,       costPrice: 24000,  retailPrice: 42000,  wholesalePrice: 36000,  stock: 14, minStock: 6 } }),
    prisma.product.create({ data: { name: 'Mascarilla Facial Carbón',        brand: 'Avon',    categoryId: cats['Cremas'].id,           costPrice: 19000,  retailPrice: 35000,  wholesalePrice: 30000,  stock: 11, minStock: 5 } }),
    prisma.product.create({ data: { name: 'Perfume Esika Pulso EDT',         brand: 'Yanbal',  categoryId: cats['Fragancias'].id,       costPrice: 78000,  retailPrice: 125000, wholesalePrice: 108000, stock: 4,  minStock: 3 } }),
    prisma.product.create({ data: { name: 'Acondicionador Liso Perfecto',    brand: 'Fuller',  categoryId: cats['Capilar'].id,          costPrice: 21000,  retailPrice: 36000,  wholesalePrice: 30000,  stock: 15, minStock: 6 } }),
    prisma.product.create({ data: { name: 'Loción Corporal Vainilla',        brand: 'Avon',    categoryId: cats['Cuidado corporal'].id, costPrice: 28000,  retailPrice: 48000,  wholesalePrice: 41000,  stock: 8,  minStock: 4 } }),
    prisma.product.create({ data: { name: 'Sérum Vitamina C 30ml',           brand: 'Yanbal',  categoryId: cats['Cremas'].id,           costPrice: 62000,  retailPrice: 98000,  wholesalePrice: 84000,  stock: 5,  minStock: 3 } }),
    prisma.product.create({ data: { name: 'Tinte Capilar Negro Azulado',     brand: 'Fuller',  categoryId: cats['Capilar'].id,          costPrice: 16000,  retailPrice: 28000,  wholesalePrice: 24000,  stock: 20, minStock: 8 } }),
  ]);

  // Zones
  const zones = {};
  for (const name of ['Laureles', 'Belén', 'Envigado', 'Poblado', 'Robledo', 'Itagüí', 'Sabaneta']) {
    zones[name] = await prisma.zone.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Customers
  const daysAgo = d => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Yulieth Castaño',   phone: '+573104528891', zoneId: zones['Laureles'].id, type: 'MAYOR', totalLifetime: 1240000, visitCount: 14, lastPurchaseAt: daysAgo(2)  } }),
    prisma.customer.create({ data: { name: 'Marcela Quintero',  phone: '+573215678234', zoneId: zones['Belén'].id,    type: 'DETAL', totalLifetime: 380000,  visitCount: 6,  lastPurchaseAt: daysAgo(12) } }),
    prisma.customer.create({ data: { name: 'Diana Restrepo',    phone: '+573008891234', zoneId: zones['Envigado'].id, type: 'MAYOR', totalLifetime: 2150000, visitCount: 22, lastPurchaseAt: daysAgo(1)  } }),
    prisma.customer.create({ data: { name: 'Sandra Patiño',     phone: '+573145567823', zoneId: zones['Robledo'].id,  type: 'DETAL', totalLifetime: 290000,  visitCount: 4,  lastPurchaseAt: daysAgo(18) } }),
    prisma.customer.create({ data: { name: 'Catalina Mejía',    phone: '+573123456789', zoneId: zones['Poblado'].id,  type: 'MAYOR', totalLifetime: 980000,  visitCount: 11, lastPurchaseAt: daysAgo(3)  } }),
    prisma.customer.create({ data: { name: 'Luz Marina Ríos',   phone: '+573156678912', zoneId: zones['Itagüí'].id,   type: 'DETAL', totalLifetime: 420000,  visitCount: 7,  lastPurchaseAt: daysAgo(9)  } }),
    prisma.customer.create({ data: { name: 'Paola Henao',       phone: '+573209987654', zoneId: zones['Sabaneta'].id, type: 'DETAL', totalLifetime: 510000,  visitCount: 8,  lastPurchaseAt: daysAgo(15) } }),
    prisma.customer.create({ data: { name: 'Liliana Gómez',     phone: '+573012234567', zoneId: zones['Laureles'].id, type: 'MAYOR', totalLifetime: 1680000, visitCount: 18, lastPurchaseAt: daysAgo(4)  } }),
    prisma.customer.create({ data: { name: 'Andrea Ospina',     phone: '+573108876543', zoneId: zones['Belén'].id,    type: 'DETAL', totalLifetime: 145000,  visitCount: 2,  lastPurchaseAt: daysAgo(22) } }),
    prisma.customer.create({ data: { name: 'Mónica Vélez',      phone: '+573214567890', zoneId: zones['Envigado'].id, type: 'MAYOR', totalLifetime: 870000,  visitCount: 9,  lastPurchaseAt: daysAgo(6)  } }),
    prisma.customer.create({ data: { name: 'Gloria Zapata',     phone: '+573177654321', zoneId: zones['Poblado'].id,  type: 'DETAL', totalLifetime: 630000,  visitCount: 9,  lastPurchaseAt: daysAgo(0),  birthday: new Date(1990, new Date().getMonth(), new Date().getDate()) } }),
    prisma.customer.create({ data: { name: 'Natalia Cárdenas',  phone: '+573164321098', zoneId: zones['Itagüí'].id,   type: 'DETAL', totalLifetime: 195000,  visitCount: 3,  lastPurchaseAt: daysAgo(30) } }),
  ]);

  // Get seller user
  const seller = await prisma.user.findFirst();

  // Sales (last 30 days)
  const salesData = [
    { daysAgo: 0,  customer: customers[0], method: 'EFECTIVO', type: 'MAYOR', items: [[products[0],2],[products[3],1]] },
    { daysAgo: 0,  customer: customers[2], method: 'EFECTIVO', type: 'MAYOR', items: [[products[6],1],[products[10],2]] },
    { daysAgo: 1,  customer: customers[4], method: 'EFECTIVO',    type: 'MAYOR', items: [[products[1],3],[products[11],2]] },
    { daysAgo: 1,  customer: customers[7], method: 'EFECTIVO', type: 'MAYOR', items: [[products[3],2],[products[13],1]] },
    { daysAgo: 2,  customer: customers[0], method: 'EFECTIVO', type: 'MAYOR', items: [[products[0],3],[products[6],2]] },
    { daysAgo: 3,  customer: customers[9], method: 'EFECTIVO', type: 'MAYOR', items: [[products[4],2],[products[10],1]] },
    { daysAgo: 3,  customer: customers[5], method: 'EFECTIVO',    type: 'DETAL', items: [[products[2],1],[products[8],1]] },
    { daysAgo: 4,  customer: customers[7], method: 'EFECTIVO', type: 'MAYOR', items: [[products[0],4],[products[5],2]] },
    { daysAgo: 5,  customer: customers[1], method: 'ADDI',     type: 'DETAL', items: [[products[3],1],[products[9],1]], creditRef: 'ADDI-2891' },
    { daysAgo: 5,  customer: customers[4], method: 'EFECTIVO', type: 'MAYOR', items: [[products[11],3],[products[14],2]] },
    { daysAgo: 6,  customer: customers[9], method: 'EFECTIVO', type: 'MAYOR', items: [[products[6],1],[products[13],2]] },
    { daysAgo: 7,  customer: customers[2], method: 'EFECTIVO', type: 'MAYOR', items: [[products[0],5],[products[1],3]] },
    { daysAgo: 8,  customer: customers[5], method: 'EFECTIVO',    type: 'DETAL', items: [[products[2],2],[products[7],1]] },
    { daysAgo: 9,  customer: customers[7], method: 'SISTECREDITO', type: 'MAYOR', items: [[products[3],1],[products[10],2]], creditRef: 'SISTE-4421' },
    { daysAgo: 10, customer: customers[0], method: 'EFECTIVO', type: 'MAYOR', items: [[products[4],3],[products[8],2]] },
    { daysAgo: 12, customer: customers[4], method: 'EFECTIVO', type: 'MAYOR', items: [[products[6],2],[products[11],4]] },
    { daysAgo: 14, customer: customers[2], method: 'EFECTIVO', type: 'MAYOR', items: [[products[0],3],[products[13],1]] },
    { daysAgo: 15, customer: customers[9], method: 'EFECTIVO',    type: 'MAYOR', items: [[products[5],2],[products[12],2]] },
    { daysAgo: 18, customer: customers[7], method: 'EFECTIVO', type: 'MAYOR', items: [[products[3],2],[products[10],3]] },
    { daysAgo: 20, customer: customers[0], method: 'EFECTIVO', type: 'MAYOR', items: [[products[1],4],[products[6],1]] },
    { daysAgo: 22, customer: customers[4], method: 'ADDI',     type: 'MAYOR', items: [[products[3],2],[products[13],2]], creditRef: 'ADDI-3312' },
    { daysAgo: 25, customer: customers[2], method: 'EFECTIVO', type: 'MAYOR', items: [[products[0],6],[products[8],3]] },
    { daysAgo: 28, customer: customers[7], method: 'EFECTIVO', type: 'MAYOR', items: [[products[6],3],[products[11],2]] },
  ];

  for (const s of salesData) {
    const saleDate = daysAgo(s.daysAgo);
    const saleItems = s.items.map(([p, qty]) => {
      const unitPrice = s.type === 'MAYOR' ? p.wholesalePrice : p.retailPrice;
      return { productId: p.id, quantity: qty, unitPrice, costPrice: p.costPrice, subtotal: unitPrice * qty };
    });
    const total  = saleItems.reduce((acc, i) => acc + i.subtotal, 0);
    const profit = saleItems.reduce((acc, i) => acc + (i.subtotal - i.costPrice * i.quantity), 0);

    const sale = await prisma.sale.create({
      data: {
        customerId: s.customer.id,
        sellerId: seller.id,
        type: s.type,
        method: s.method,
        total, profit,
        date: saleDate,
        items: { create: saleItems },
      },
    });

    if ((s.method === 'ADDI' || s.method === 'SISTECREDITO') && s.creditRef) {
      await prisma.creditSale.create({
        data: { saleId: sale.id, platform: s.method, reference: s.creditRef, amount: total, status: 'APROBADO' },
      });
    }
  }

  // Expenses
  await Promise.all([
    prisma.expense.create({ data: { label: 'Transporte zona Laureles',  amount: 15000,  category: 'Transporte',   date: daysAgo(0),  sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Bolsas y empaque',          amount: 8000,   category: 'Materiales',   date: daysAgo(1),  sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Transporte zona Envigado',  amount: 18000,  category: 'Transporte',   date: daysAgo(2),  sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Recarga celular',           amount: 20000,  category: 'Comunicacion', date: daysAgo(3),  sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Transporte zona Belén',     amount: 12000,  category: 'Transporte',   date: daysAgo(5),  sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Catálogos impresos',        amount: 35000,  category: 'Materiales',   date: daysAgo(7),  sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Transporte zona Poblado',   amount: 22000,  category: 'Transporte',   date: daysAgo(10), sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Bolsas regalo',             amount: 14000,  category: 'Materiales',   date: daysAgo(14), sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Transporte zona Itagüí',    amount: 16000,  category: 'Transporte',   date: daysAgo(18), sellerId: seller.id } }),
    prisma.expense.create({ data: { label: 'Internet y datos',          amount: 45000,  category: 'Comunicacion', date: daysAgo(20), sellerId: seller.id } }),
  ]);

  // Goals
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthEnd   = new Date(monthStart.getFullYear(), monthStart.getMonth()+1, 0);
  await Promise.all([
    prisma.goal.create({ data: { type: 'MONTHLY',    targetAmount: 3000000, startDate: monthStart, endDate: monthEnd,   userId: seller.id } }),
    prisma.goal.create({ data: { type: 'MAYORISTA',  targetAmount: 1500000, startDate: monthStart, endDate: monthEnd,   userId: seller.id } }),
    prisma.goal.create({ data: { type: 'WEEKLY',     targetAmount: 800000,  startDate: daysAgo(6), endDate: daysAgo(0), userId: seller.id } }),
  ]);

  // Message templates
  await Promise.all([
    prisma.messageTemplate.create({ data: { name: 'Saludo clienta dormida',  body: 'Hola {nombre} 💕 ¿Cómo vas? Hace ratico no nos vemos. Llegaron novedades hermosas que sé que te van a encantar. ¿Te paso el catálogo?', type: 'reactivacion' } }),
    prisma.messageTemplate.create({ data: { name: 'Recordatorio mayorista',  body: 'Hola {nombre}, ¿cómo va el inventario por allá? Esta semana tengo precios especiales en Yanbal y Fuller para ti. ¿Hacemos pedido?', type: 'mayorista' } }),
    prisma.messageTemplate.create({ data: { name: 'Confirmación de pedido',  body: 'Hola {nombre}! Confirmo tu pedido. Te lo llevo hoy en la tardecita. ¡Mil gracias por la compra! 🌸', type: 'confirmacion' } }),
    prisma.messageTemplate.create({ data: { name: 'Feliz cumpleaños',        body: '¡Feliz cumpleaños {nombre}! 🎂 Que este año esté lleno de cosas lindas. Te tengo un detallito de regalo con tu próxima compra 💕', type: 'cumpleanos' } }),
    prisma.messageTemplate.create({ data: { name: 'Promo del día',           body: 'Hola {nombre}, hoy tengo productos con descuento especial. ¿Te interesa? Apartamos hasta las 6pm.', type: 'promo' } }),
  ]);

  console.log('✅ Datos de demo cargados:');
  console.log('   - 15 productos');
  console.log('   - 12 clientas');
  console.log('   - 23 ventas (últimos 30 días)');
  console.log('   - 10 gastos');
  console.log('   - 3 metas');
  console.log('   - 5 plantillas de mensajes');
}

main().catch(console.error).finally(() => prisma.$disconnect());
