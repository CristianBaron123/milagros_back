const prisma = require('../lib/prisma');

async function create(req, res) {
  const { customerId, type, method, notes, items, creditRef } = req.body;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => Number(i.productId)) } },
  });

  const saleItems = items.map(i => {
    const p = products.find(p => p.id === Number(i.productId));
    const unitPrice = type === 'MAYOR' ? p.wholesalePrice : p.retailPrice;
    const qty = Number(i.quantity);
    return { productId: p.id, quantity: qty, unitPrice, costPrice: p.costPrice, subtotal: unitPrice * qty };
  });

  const total = saleItems.reduce((s, i) => s + i.subtotal, 0);
  const profit = saleItems.reduce((s, i) => s + (i.subtotal - i.costPrice * i.quantity), 0);

  const sale = await prisma.$transaction(async (tx) => {
    const s = await tx.sale.create({
      data: {
        customerId: Number(customerId),
        type: type || 'DETAL',
        method: method || 'EFECTIVO',
        total,
        profit,
        notes,
        sellerId: req.user.id,
        items: { create: saleItems },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    for (const item of saleItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryMovement.create({
        data: { productId: item.productId, type: 'SALIDA', quantity: item.quantity, reason: 'Venta', createdBy: req.user.id },
      });
    }

    await tx.customer.update({
      where: { id: Number(customerId) },
      data: {
        lastPurchaseAt: new Date(),
        visitCount: { increment: 1 },
        totalLifetime: { increment: total },
      },
    });

    if ((method === 'ADDI' || method === 'SISTECREDITO') && creditRef) {
      await tx.creditSale.create({
        data: { saleId: s.id, platform: method, reference: creditRef, amount: total },
      });
    }

    return s;
  });

  res.status(201).json(sale);
}

async function getDailySummary(req, res) {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end = new Date(date); end.setHours(23, 59, 59, 999);

  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: start, lte: end } },
      include: { items: { include: { product: true } }, customer: true },
    }),
    prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
  ]);

  const totalSales = sales.reduce((s, v) => s + v.total, 0);
  const totalProfit = sales.reduce((s, v) => s + v.profit, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const byMethod = {};
  sales.forEach(s => { byMethod[s.method] = (byMethod[s.method] || 0) + s.total; });

  const productCount = {};
  sales.forEach(s => s.items.forEach(i => {
    productCount[i.productId] = (productCount[i.productId] || 0) + i.quantity;
  }));
  const topProducts = Object.entries(productCount)
    .map(([pid, qty]) => ({ product: sales.flatMap(s => s.items).find(i => i.productId === Number(pid))?.product, qty }))
    .filter(x => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const mood = totalSales > 300000 ? 'great' : totalSales > 150000 ? 'good' : 'slow';
  const moodLabel = mood === 'great' ? '¡Buen día, Milagros! 🎉' : mood === 'good' ? 'Día aceptable 👍' : 'Hay que mover esto 😬';

  res.json({ totalSales, totalProfit, totalExpenses, netProfit: totalProfit - totalExpenses, salesCount: sales.length, byMethod, topProducts, mood, moodLabel, sales, expenses });
}

async function getAll(req, res) {
  const { type, method, from, to } = req.query;
  const where = {};
  if (type) where.type = type;
  if (method) where.method = method;
  if (from || to) where.date = {};
  if (from) where.date.gte = new Date(from);
  if (to) where.date.lte = new Date(to);

  const sales = await prisma.sale.findMany({
    where,
    include: { customer: true, items: { include: { product: { select: { name: true } } } } },
    orderBy: { date: 'desc' },
    take: 100,
  });
  res.json(sales);
}

module.exports = { create, getDailySummary, getAll };
