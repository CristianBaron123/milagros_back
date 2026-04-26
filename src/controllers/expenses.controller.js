const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end = new Date(date); end.setHours(23, 59, 59, 999);
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
  });
  res.json(expenses);
}

async function create(req, res) {
  const { label, amount, category } = req.body;
  const expense = await prisma.expense.create({
    data: { label, amount: Number(amount), category: category || 'General', sellerId: req.user.id },
  });
  res.status(201).json(expense);
}

async function remove(req, res) {
  await prisma.expense.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
}

module.exports = { getAll, create, remove };
