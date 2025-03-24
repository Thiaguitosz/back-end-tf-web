import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js'; 
import caronasRoutes from './routes/caronas.js';
import adminRoutes from './routes/admin.js';

dotenv.config();  // Carrega as variáveis de ambiente

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/caronas', caronasRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running`);
});