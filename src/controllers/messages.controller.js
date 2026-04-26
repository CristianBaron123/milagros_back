const prisma = require('../lib/prisma');

async function getTemplates(req, res) {
  const templates = await prisma.messageTemplate.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  res.json(templates);
}

async function createTemplate(req, res) {
  const { name, body, type } = req.body;
  const template = await prisma.messageTemplate.create({ data: { name, body, type: type || 'general' } });
  res.status(201).json(template);
}

async function generateMessage(req, res) {
  const { templateId, customerId } = req.body;
  const [template, customer] = await Promise.all([
    prisma.messageTemplate.findUnique({ where: { id: Number(templateId) } }),
    prisma.customer.findUnique({ where: { id: Number(customerId) }, include: { zone: true } }),
  ]);
  if (!template || !customer) return res.status(404).json({ error: 'Plantilla o cliente no encontrado' });

  const firstName = customer.name.split(' ')[0];
  const body = template.body
    .replace(/{nombre}/g, firstName)
    .replace(/{zona}/g, customer.zone?.name || 'tu zona')
    .replace(/{total}/g, '$0');

  res.json({ body, customer, template });
}

async function getScheduled(req, res) {
  const messages = await prisma.scheduledMessage.findMany({
    where: { sent: false, sendAt: { gte: new Date() } },
    include: { customer: true, template: true },
    orderBy: { sendAt: 'asc' },
  });
  res.json(messages);
}

async function scheduleMessage(req, res) {
  const { customerId, templateId, body, sendAt } = req.body;
  const msg = await prisma.scheduledMessage.create({
    data: { customerId: Number(customerId), templateId: Number(templateId), body, sendAt: new Date(sendAt) },
    include: { customer: true, template: true },
  });
  res.status(201).json(msg);
}

module.exports = { getTemplates, createTemplate, generateMessage, getScheduled, scheduleMessage };
