const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../lib/prisma');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getInsights(req, res) {
  try {
    // Gather business data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const sevenDaysAgo  = new Date(Date.now() - 7  * 86400000);

    const [products, recentSales, customers, goals, expenses] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        include: {
          movements: {
            where: { type: 'SALIDA', createdAt: { gte: thirtyDaysAgo } },
          },
        },
      }),
      prisma.sale.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        include: { items: { include: { product: { select: { name: true } } } }, customer: { select: { name: true, zone: true } } },
        orderBy: { date: 'desc' },
        take: 200,
      }),
      prisma.customer.findMany({
        where: { active: true },
        select: { id: true, name: true, type: true, lastPurchaseAt: true, visitCount: true, totalLifetime: true, zone: true },
      }),
      prisma.goal.findMany({ where: { active: true } }),
      prisma.expense.findMany({ where: { date: { gte: thirtyDaysAgo } } }),
    ]);

    // Build stock velocity per product (units sold in last 30 days)
    const productStats = products.map(p => {
      const unitsSold30d = p.movements.reduce((s, m) => s + m.quantity, 0);
      const dailyVelocity = unitsSold30d / 30;
      const daysUntilEmpty = dailyVelocity > 0 ? Math.round(p.stock / dailyVelocity) : null;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        stock: p.stock,
        minStock: p.minStock,
        unitsSold30d,
        dailyVelocity: Math.round(dailyVelocity * 10) / 10,
        daysUntilEmpty,
        retailPrice: p.retailPrice,
        costPrice: p.costPrice,
      };
    });

    // Sleeping customers (no purchase in 7+ days)
    const sleeping = customers.filter(c => {
      if (!c.lastPurchaseAt) return false;
      return Date.now() - new Date(c.lastPurchaseAt).getTime() > 7 * 86400000;
    });

    // Revenue and profit last 30 days
    const revenue30d = recentSales.reduce((s, v) => s + v.total, 0);
    const profit30d  = recentSales.reduce((s, v) => s + v.profit, 0);
    const expenses30d = expenses.reduce((s, e) => s + e.amount, 0);
    const net30d = profit30d - expenses30d;

    // Sales last 7 days
    const recentSales7d = recentSales.filter(s => new Date(s.date) >= sevenDaysAgo);
    const revenue7d = recentSales7d.reduce((s, v) => s + v.total, 0);

    // Top selling products last 30d
    const productSalesMap = {};
    recentSales.forEach(s => s.items.forEach(i => {
      productSalesMap[i.product.name] = (productSalesMap[i.product.name] || 0) + i.quantity;
    }));
    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    // Payment method breakdown
    const byMethod = {};
    recentSales.forEach(s => { byMethod[s.method] = (byMethod[s.method] || 0) + s.total; });

    const businessData = {
      fecha: new Date().toLocaleDateString('es-CO'),
      inventario: productStats,
      ventas: {
        ultimos30Dias: { ingresos: revenue30d, ganancia: profit30d, gastos: expenses30d, neto: net30d, cantidadVentas: recentSales.length },
        ultimos7Dias: { ingresos: revenue7d, cantidadVentas: recentSales7d.length },
        porMetodoPago: byMethod,
        productosTop: topProducts,
      },
      clientes: {
        total: customers.length,
        mayoristas: customers.filter(c => c.type === 'MAYOR').length,
        detallistas: customers.filter(c => c.type === 'DETAL').length,
        dormidas: sleeping.length,
        clientasDormidas: sleeping.slice(0, 10).map(c => ({
          nombre: c.name,
          tipo: c.type,
          diasSinComprar: Math.floor((Date.now() - new Date(c.lastPurchaseAt).getTime()) / 86400000),
          totalHistorico: c.totalLifetime,
        })),
      },
      metas: goals.map(g => ({
        nombre: g.name,
        tipo: g.type,
        objetivo: g.targetAmount,
        actual: g.currentAmount,
        porcentaje: Math.round((g.currentAmount / g.targetAmount) * 100),
      })),
    };

    const prompt = `Eres un asesor de negocios experto en ventas de productos de belleza y cosméticos en Colombia.
Analiza los siguientes datos del negocio "Milagros" y proporciona insights accionables en español.

DATOS DEL NEGOCIO:
${JSON.stringify(businessData, null, 2)}

Proporciona un análisis en formato JSON con exactamente esta estructura:
{
  "resumen": "2-3 oraciones resumiendo el estado del negocio hoy",
  "alertasStock": [
    {
      "producto": "nombre",
      "stock": número,
      "diasRestantes": número o null,
      "urgencia": "crítica|media|baja",
      "recomendacion": "acción concreta"
    }
  ],
  "prediccionesStockAgotamiento": [
    {
      "producto": "nombre",
      "fechaEstimadaAgotamiento": "fecha en formato dd/mm/yyyy o 'sin datos suficientes'",
      "diasRestantes": número,
      "velocidadDiaria": número
    }
  ],
  "insightsClientes": [
    {
      "titulo": "título corto",
      "descripcion": "descripción accionable"
    }
  ],
  "insightsVentas": [
    {
      "titulo": "título corto",
      "descripcion": "descripción con dato concreto"
    }
  ],
  "recomendaciones": [
    {
      "prioridad": "alta|media|baja",
      "categoria": "inventario|clientes|ventas|financiero",
      "accion": "acción concreta y específica para el negocio"
    }
  ],
  "prediccionSemanaProxima": {
    "ventasEstimadas": número en pesos colombianos,
    "clientesEsperados": número,
    "justificacion": "breve explicación"
  }
}

Responde SOLO con el JSON, sin texto adicional antes o después.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].text.trim();
    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const analysis = JSON.parse(jsonText);

    // Attach raw product stats so frontend can render stock cards
    analysis.productStats = productStats
      .filter(p => p.stock <= p.minStock || p.daysUntilEmpty !== null)
      .sort((a, b) => {
        if (a.daysUntilEmpty === null) return 1;
        if (b.daysUntilEmpty === null) return -1;
        return a.daysUntilEmpty - b.daysUntilEmpty;
      });

    res.json(analysis);
  } catch (err) {
    console.error('AI insights error:', err);
    res.status(500).json({ error: 'No se pudo generar el análisis de IA', detail: err.message });
  }
}

module.exports = { getInsights };
