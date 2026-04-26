const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const { category, search, lowStock } = req.query;
  const where = { active: true };
  if (category) where.category = { name: category };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (lowStock === 'true') where.stock = { lte: prisma.product.fields.minStock };

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: 'asc' },
  });
  res.json(products);
}

async function getLowStock(req, res) {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
  });
  const low = products.filter(p => p.stock <= p.minStock);
  res.json(low);
}

async function getSlowMoving(req, res) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      saleItems: {
        where: { sale: { date: { gte: thirtyDaysAgo } } },
      },
    },
  });
  const slow = products.filter(p => p.saleItems.length === 0);
  res.json(slow);
}

async function getOne(req, res) {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true, inventoryMovements: { orderBy: { date: 'desc' }, take: 10 } },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
}

async function create(req, res) {
  const { name, description, brand, categoryId, costPrice, retailPrice, wholesalePrice, stock, minStock, unit } = req.body;
  const product = await prisma.product.create({
    data: { name, description, brand, categoryId: Number(categoryId), costPrice, retailPrice, wholesalePrice, stock: stock || 0, minStock: minStock || 5, unit: unit || 'unidad' },
    include: { category: true },
  });
  res.status(201).json(product);
}

async function update(req, res) {
  const { name, description, brand, categoryId, costPrice, retailPrice, wholesalePrice, minStock, unit } = req.body;
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { name, description, brand, categoryId: categoryId ? Number(categoryId) : undefined, costPrice, retailPrice, wholesalePrice, minStock, unit },
    include: { category: true },
  });
  res.json(product);
}

async function remove(req, res) {
  await prisma.product.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ ok: true });
}

module.exports = { getAll, getLowStock, getSlowMoving, getOne, create, update, remove };
