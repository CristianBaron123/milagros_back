const router = require('express').Router();

router.get('/insights', (req, res) => {
  res.status(503).json({ error: 'IA no disponible aún — configura ANTHROPIC_API_KEY' });
});

module.exports = router;
