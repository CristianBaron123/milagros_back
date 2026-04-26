const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const goals = await prisma.goal.findMany({
    where: { userId: req.user.id },
    orderBy: { startDate: 'desc' },
  });

  const now = new Date();
  const goalsWithProgress = await Promise.all(goals.map(async (g) => {
    const sales = await prisma.sale.aggregate({
      _sum: { total: true },
      where: { sellerId: req.user.id, date: { gte: g.startDate, lte: g.endDate } },
    });
    const current = sales._sum.total || 0;
    const pct = Math.round((current / g.targetAmount) * 100);
    const active = now >= g.startDate && now <= g.endDate;
    return { ...g, current, pct, active };
  }));

  res.json(goalsWithProgress);
}

async function create(req, res) {
  const { type, targetAmount, startDate, endDate } = req.body;
  const goal = await prisma.goal.create({
    data: { type, targetAmount: Number(targetAmount), startDate: new Date(startDate), endDate: new Date(endDate), userId: req.user.id },
  });
  res.status(201).json(goal);
}

async function remove(req, res) {
  await prisma.goal.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
}

module.exports = { getAll, create, remove };
