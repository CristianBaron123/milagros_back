const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const where = {};
  if (req.query.userId) {
    where.userId = Number(req.query.userId);
  } else if (req.user.role !== 'ADMIN') {
    where.userId = req.user.id;
  }

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { startDate: 'desc' },
    include: { user: { select: { id: true, name: true } } },
  });

  const now = new Date();
  const goalsWithProgress = await Promise.all(goals.map(async (g) => {
    const sellerId = g.userId;
    const sales = await prisma.sale.aggregate({
      _sum: { total: true },
      where: { sellerId, date: { gte: g.startDate, lte: g.endDate } },
    });
    const current = sales._sum.total || 0;
    const pct = Math.round((current / g.targetAmount) * 100);
    const active = now >= g.startDate && now <= g.endDate;
    return { ...g, current, pct, active };
  }));

  res.json(goalsWithProgress);
}

async function create(req, res) {
  const { type, targetAmount, startDate, endDate, userId } = req.body;
  const assignTo = (req.user.role === 'ADMIN' && userId) ? Number(userId) : req.user.id;
  const goal = await prisma.goal.create({
    data: { type, targetAmount: Number(targetAmount), startDate: new Date(startDate), endDate: new Date(endDate), userId: assignTo },
    include: { user: { select: { id: true, name: true } } },
  });
  res.status(201).json(goal);
}

async function remove(req, res) {
  await prisma.goal.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
}

module.exports = { getAll, create, remove };
