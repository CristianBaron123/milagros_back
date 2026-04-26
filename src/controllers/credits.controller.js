const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const { platform, status, from, to } = req.query;
  const where = {};
  if (platform) where.platform = platform;
  if (status)   where.status   = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const credits = await prisma.creditSale.findMany({
    where,
    include: {
      sale: {
        include: {
          customer: { select: { id: true, name: true, phone: true, type: true } },
          items:    { include: { product: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  res.json(credits);
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const VALID = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'PAGADO'];
  if (!VALID.includes(status)) return res.status(400).json({ error: 'Estado inválido' });

  const credit = await prisma.creditSale.update({
    where: { id: Number(id) },
    data: { status },
    include: { sale: { include: { customer: { select: { name: true } } } } },
  });
  res.json(credit);
}

async function getSummary(req, res) {
  const credits = await prisma.creditSale.findMany({
    select: { platform: true, status: true, amount: true },
  });

  const summary = { ADDI: {}, SISTECREDITO: {} };
  for (const c of credits) {
    const p = summary[c.platform] ?? {};
    p[c.status] = (p[c.status] || 0) + c.amount;
    summary[c.platform] = p;
  }

  const totals = {};
  for (const [platform, byStatus] of Object.entries(summary)) {
    totals[platform] = {
      byStatus,
      total: Object.values(byStatus).reduce((s, v) => s + v, 0),
    };
  }

  res.json(totals);
}

module.exports = { getAll, updateStatus, getSummary };
