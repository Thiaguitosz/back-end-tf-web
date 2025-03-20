import { Router } from 'express';
import { selectCaronasAtivas } from '../lib/db.js';
import verificarAutenticacao from "../middlewares/autenticacao.js";
const router = Router();

// Rota para listar caronas
router.get('/', async (req, res) => {
  try {
    const caronas = await selectCaronasAtivas()
    res.json(caronas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar caronas');
  }
});
/*
// Rota para oferecer carona
router.post('/', verificarAutenticacao, async (req, res) => {
  const { usuario_id, local_partida, horario, destino, vagas_disponiveis } = req.body;
  console.log(horario)

  if (!usuario_id || !local_partida || !horario || !destino || !vagas_disponiveis) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO caronas (usuario_id, local_partida, horario, destino, vagas_disponiveis) VALUES ($1, $2, $3::TIMESTAMP, $4, $5) RETURNING *',
      [usuario_id, local_partida, horario, destino, vagas_disponiveis]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao oferecer carona.' });
  }
});
*/

export default router;