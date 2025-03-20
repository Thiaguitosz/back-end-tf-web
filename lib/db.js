import pkg from 'pg';
const { Pool } = pkg;  
import dotenv from 'dotenv'; 
dotenv.config(); 


async function connect() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  return pool.connect();
}

async function selectCaronasAtivas() {
  try {
    const client = await connect();
    const res = await client.query('SELECT * FROM caronas WHERE status = $1', ['Ativa']);
    client.release();
    return res.rows;
  } catch (err) {
    console.error('Erro ao buscar caronas ativas:', err);
    throw err;
  }
}

export { selectCaronasAtivas };