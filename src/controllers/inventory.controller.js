const prisma = require('../lib/prisma');

async function addEntry(req, res) {
  const { productId, quantity, reason, notes } = req.body;
  const pid = Number(productId);

  const [movement] = await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: { productId: pid, type: 'ENTRADA', quantity: Number(quantity), reason, notes, createdBy: req.user.id },
    }),
    prisma.product.update({
      where: { id: pid },
      data: { stock: { increment: Number(quantity) } },
    }),
  ]);
  res.status(201).json(movement);
}

async function addExit(req, res) {
  const { productId, quantity, reason, notes } = req.body;
  const pid = Number(productId);

  const product = await prisma.product.findUnique({ where: { id: pid } });
  if (!product || product.stock < Number(quantity))
    return res.status(400).json({ error: 'Stock insuficiente' });

  const [movement] = await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: { productId: pid, type: 'SALIDA', quantity: Number(quantity), reason, notes, createdBy: req.user.id },
    }),
    prisma.product.update({
      where: { id: pid },
      data: { stock: { decrement: Number(quantity) } },
    }),
  ]);
  res.status(201).json(movement);
}

async function getHistory(req, res) {
  const where = {};
  if (req.params.productId) where.productId = Number(req.params.productId);
  const movements = await prisma.inventoryMovement.findMany({
    where,
    include: { product: { select: { name: true, brand: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  });
  res.json(movements);
}

module.exports = { addEntry, addExit, getHistory };
