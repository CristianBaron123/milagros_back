const prisma = require('../lib/prisma');

async function getAll(req, res) {
  const { type, search, readyToBuy, zone } = req.query;
  const where = { active: true };
  if (type) where.type = type;
  if (zone) where.zone = { name: zone };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  let customers = await prisma.customer.findMany({
    where,
    include: { zone: true, _count: { select: { sales: true } } },
    orderBy: { name: 'asc' },
  });

  if (readyToBuy === 'true') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    customers = customers.filter(c => c.lastPurchaseAt && c.lastPurchaseAt < cutoff);
  }

  res.json(customers);
}

async function getOne(req, res) {
  const customer = await prisma.customer.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      zone: true,
      sales: {
        include: { items: { include: { product: { select: { name: true } } } } },
        orderBy: { date: 'desc' },
        take: 20,
      },
    },
  });
  if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(customer);
}

async function create(req, res) {
  const { name, phone, address, zoneId, type, birthday } = req.body;
  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      address,
      zoneId: zoneId ? Number(zoneId) : null,
      type: type || 'DETAL',
      birthday: birthday ? new Date(birthday) : null,
    },
    include: { zone: true },
  });
  res.status(201).json(customer);
}

async function update(req, res) {
  const { name, phone, address, zoneId, type, birthday } = req.body;
  const customer = await prisma.customer.update({
    where: { id: Number(req.params.id) },
    data: {
      name,
      phone,
      address,
      zoneId: zoneId ? Number(zoneId) : undefined,
      type,
      birthday: birthday ? new Date(birthday) : undefined,
    },
    include: { zone: true },
  });
  res.json(customer);
}

async function remove(req, res) {
  await prisma.customer.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ ok: true });
}

async function getBirthdays(req, res) {
  const today = new Date();
  const customers = await prisma.customer.findMany({ where: { active: true, birthday: { not: null } } });
  const upcoming = customers.filter(c => {
    const bd = new Date(c.birthday);
    const diff = (bd.getMonth() * 30 + bd.getDate()) - (today.getMonth() * 30 + today.getDate());
    return diff >= 0 && diff <= 7;
  });
  res.json(upcoming);
}

async function getLost(req, res) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 21);
  const customers = await prisma.customer.findMany({
    where: { active: true, lastPurchaseAt: { lt: cutoff } },
    include: { zone: true },
    orderBy: { lastPurchaseAt: 'asc' },
  });
  res.json(customers);
}

module.exports = { getAll, getOne, create, update, remove, getBirthdays, getLost };
