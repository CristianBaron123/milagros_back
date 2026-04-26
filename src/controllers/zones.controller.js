const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const zones = await prisma.zone.findMany({
    include: { _count: { select: { customers: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(zones);
}

async function create(req, res) {
  const zone = await prisma.zone.create({ data: { name: req.body.name } });
  res.status(201).json(zone);
}

async function getZoneAnalytics(req, res) {
  const zones = await prisma.zone.findMany({ include: { customers: { include: { sales: true } } } });
  const analytics = zones.map(z => {
    const totalSales = z.customers.reduce((s, c) => s + c.sales.reduce((ss, sale) => ss + sale.total, 0), 0);
    const orderCount = z.customers.reduce((s, c) => s + c.sales.length, 0);
    return { id: z.id, name: z.name, customerCount: z.customers.length, totalSales, orderCount, hot: orderCount > 3 };
  });
  analytics.sort((a, b) => b.orderCount - a.orderCount);
  res.json(analytics);
}

module.exports = { getAll, create, getZoneAnalytics };
