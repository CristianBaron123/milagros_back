require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/products',      require('./routes/products.routes'));
app.use('/api/inventory',     require('./routes/inventory.routes'));
app.use('/api/customers',     require('./routes/customers.routes'));
app.use('/api/sales',         require('./routes/sales.routes'));
app.use('/api/expenses',      require('./routes/expenses.routes'));
app.use('/api/zones',         require('./routes/zones.routes'));
app.use('/api/goals',         require('./routes/goals.routes'));
app.use('/api/messages',      require('./routes/messages.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/ai',            require('./routes/ai.routes'));
app.use('/api/credits',       require('./routes/credits.routes'));

app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Milagros API corriendo en http://localhost:${PORT}`));
