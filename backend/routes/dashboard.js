import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', (req, res) => {
  res.json(db.getStats());
});

export default router;
