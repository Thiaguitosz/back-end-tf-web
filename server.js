import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//import authRoutes from './routes/auth.js'; 
import caronasRoutes from './routes/caronas.js';

dotenv.config();  // Carrega as variáveis de ambiente

const app = express();
app.use(cors());
app.use(express.json());

//app.use('/api/auth', authRoutes);
app.use('/api/caronas', caronasRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
