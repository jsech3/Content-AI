import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import scriptsRouter from './routes/scripts.js';
import competitorRouter from './routes/competitor.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/scripts', scriptsRouter);
app.use('/api/competitor', competitorRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Content AI backend running on port ${PORT}`);
});
