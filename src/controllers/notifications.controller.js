const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
}

async function markRead(req, res) {
  await prisma.notification.update({ where: { id: Number(req.params.id) }, data: { isRead: true } });
  res.json({ ok: true });
}

async function markAllRead(req, res) {
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  res.json({ ok: true });
}

async function generateAlerts(req, res) {
  const alerts = [];

  const products = await prisma.product.findMany({ where: { active: true } });
  for (const p of products) {
    if (p.stock <= p.minStock) {
      const exists = await prisma.notification.findFirst({
        where: { type: 'LOW_STOCK', message: { contains: p.name }, isRead: false },
      });
      if (!exists) {
        await prisma.notification.create({
          data: { type: 'LOW_STOCK', title: 'Stock bajo', message: `${p.name} tiene solo ${p.stock} unidades (mínimo ${p.minStock})` },
        });
        alerts.push(p.name);
      }
    }
  }

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 15);
  const sleeping = await prisma.customer.findMany({ where: { active: true, lastPurchaseAt: { lt: cutoff } } });
  for (const c of sleeping) {
    const days = Math.floor((Date.now() - c.lastPurchaseAt) / 86400000);
    const exists = await prisma.notification.findFirst({ where: { type: 'SLEEPING_CUSTOMER', message: { contains: c.name }, isRead: false } });
    if (!exists) {
      await prisma.notification.create({ data: { type: 'SLEEPING_CUSTOMER', title: 'Cliente dormida', message: `${c.name} lleva ${days} días sin comprar` } });
    }
  }

  res.json({ generated: alerts.length, message: 'Alertas actualizadas' });
}

module.exports = { getAll, markRead, markAllRead, generateAlerts };
