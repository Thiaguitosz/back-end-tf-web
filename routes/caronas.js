import { Router } from 'express';
import pool from '../lib/db.js';
import verificarAutenticacao from "../middlewares/autenticacao.js";

const router = Router();

// Rota para listar caronas
router.get('/', async (req, res) => {
  try {
    // JOIN correto com a tabela de usuários usando usuario_id
    const caronas = await pool.query(
      `SELECT c.*, u.nome as nome_motorista 
       FROM caronas c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       WHERE LOWER(c.status) = LOWER($1)`,
      ['Ativa']
    );
    res.json(caronas.rows);
  } catch (err) {
    console.error('Erro ao buscar caronas:', err);
    res.status(500).send(`Erro ao buscar caronas: ${err}`);
  }
});

// Nova rota para verificar as caronas do usuário autenticado
router.get('/minhas', verificarAutenticacao, async (req, res) => {
  try {
    console.log("o minhas foi ativado")
    const caronas = await pool.query(
      `SELECT * FROM caronas 
       WHERE usuario_id = $1 
       AND LOWER(status) = LOWER($2)`,
      [req.userId, 'Ativa']
    );
    res.json(caronas.rows);
  } catch (err) {
    console.error('Erro ao buscar caronas do usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar caronas do usuário' });
  }
});

// Rota para oferecer carona
router.post('/', verificarAutenticacao, async (req, res) => {
  const { local_partida, horario, destino, vagas_disponiveis } = req.body;

  // Validação dos campos obrigatórios
  if (!local_partida || !horario || !destino || !vagas_disponiveis) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Validação de número de vagas
  if (isNaN(vagas_disponiveis) || vagas_disponiveis <= 0) {
    return res.status(400).json({ error: 'Número de vagas deve ser um valor positivo.' });
  }

  try {
    // Verificar se o usuário já tem carona ativa
    const caronasAtivas = await pool.query(
      `SELECT COUNT(*) FROM caronas 
       WHERE usuario_id = $1 
       AND LOWER(status) = LOWER($2)`,
      [req.userId, 'Ativa']
    );
    
    if (parseInt(caronasAtivas.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Você já possui uma carona ativa. Encerre-a antes de criar uma nova.' 
      });
    }

    // Certifique-se de que a data está no formato correto, sem fuso horário, se necessário
    const horarioFormatado = new Date(horario);
    
    // Se você precisar garantir que o horário esteja no formato de string sem fuso horário, use:
    const horarioSemFuso = horarioFormatado.toISOString().split('T')[0] + ' ' + horarioFormatado.toISOString().split('T')[1].split('.')[0];

    const { rows } = await pool.query(
      'INSERT INTO caronas (usuario_id, local_partida, horario, destino, vagas_disponiveis) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, local_partida, horarioSemFuso, destino, vagas_disponiveis] // Usando a data formatada
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao oferecer carona:', error);
    res.status(500).json({ error: 'Erro ao oferecer carona.' });
  }
});

router.put('/:id', verificarAutenticacao, async (req, res) => {
  const { id } = req.params;
  const { local_partida, horario, destino, vagas_disponiveis } = req.body;

  // Validação dos campos obrigatórios
  if (!local_partida || !horario || !destino || !vagas_disponiveis) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Validação de número de vagas
  if (isNaN(vagas_disponiveis) || vagas_disponiveis <= 0) {
    return res.status(400).json({ error: 'Número de vagas deve ser um valor positivo.' });
  }

  try {
    // Primeiro, verificar se a carona pertence ao usuário
    const verificaPropriedade = await pool.query(
      'SELECT * FROM caronas WHERE id = $1 AND usuario_id = $2 AND LOWER(status) = LOWER($3)',
      [id, req.userId, 'Ativa']
    );

    if (verificaPropriedade.rows.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta carona.' });
    }

    // Formatar horário
    const horarioFormatado = new Date(horario);
    const horarioSemFuso = horarioFormatado.toISOString().split('T')[0] + ' ' + horarioFormatado.toISOString().split('T')[1].split('.')[0];

    // Atualizar a carona
    const { rows } = await pool.query(
      `UPDATE caronas 
       SET local_partida = $1, 
           horario = $2, 
           destino = $3, 
           vagas_disponiveis = $4 
       WHERE id = $5 
       RETURNING *`,
      [local_partida, horarioSemFuso, destino, vagas_disponiveis, id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao editar carona:', error);
    res.status(500).json({ error: 'Erro ao editar carona.' });
  }
});

// Nova rota para excluir carona
router.delete('/:id', verificarAutenticacao, async (req, res) => {
  const { id } = req.params;

  try {
    // Primeiro, verificar se a carona pertence ao usuário e está ativa
    const verificaPropriedade = await pool.query(
      'SELECT * FROM caronas WHERE id = $1 AND usuario_id = $2 AND LOWER(status) = LOWER($3)',
      [id, req.userId, 'Ativa']
    );

    if (verificaPropriedade.rows.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta carona.' });
    }

    // Atualizar status da carona para "Cancelada" em vez de excluir completamente
    const { rows } = await pool.query(
      `UPDATE caronas 
       SET status = 'Cancelada' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao excluir carona:', error);
    res.status(500).json({ error: 'Erro ao excluir carona.' });
  }
});

router.put('/:id', verificarAutenticacao, async (req, res) => {
  const { id } = req.params;
  const { local_partida, horario, destino, vagas_disponiveis } = req.body;

  // Validação dos campos obrigatórios
  if (!local_partida || !horario || !destino || !vagas_disponiveis) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Validação de número de vagas
  if (isNaN(vagas_disponiveis) || vagas_disponiveis <= 0) {
    return res.status(400).json({ error: 'Número de vagas deve ser um valor positivo.' });
  }

  try {
    // Primeiro, verificar se a carona pertence ao usuário
    const verificaPropriedade = await pool.query(
      'SELECT * FROM caronas WHERE id = $1 AND usuario_id = $2 AND LOWER(status) = LOWER($3)',
      [id, req.userId, 'Ativa']
    );

    if (verificaPropriedade.rows.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta carona.' });
    }

    // Formatar horário
    const horarioFormatado = new Date(horario);
    const horarioSemFuso = horarioFormatado.toISOString().split('T')[0] + ' ' + horarioFormatado.toISOString().split('T')[1].split('.')[0];

    // Atualizar a carona
    const { rows } = await pool.query(
      `UPDATE caronas 
       SET local_partida = $1, 
           horario = $2, 
           destino = $3, 
           vagas_disponiveis = $4 
       WHERE id = $5 
       RETURNING *`,
      [local_partida, horarioSemFuso, destino, vagas_disponiveis, id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao editar carona:', error);
    res.status(500).json({ error: 'Erro ao editar carona.' });
  }
});

// Nova rota para excluir carona
router.delete('/:id', verificarAutenticacao, async (req, res) => {
  const { id } = req.params;

  try {
    // Primeiro, verificar se a carona pertence ao usuário e está ativa
    const verificaPropriedade = await pool.query(
      'SELECT * FROM caronas WHERE id = $1 AND usuario_id = $2 AND LOWER(status) = LOWER($3)',
      [id, req.userId, 'Ativa']
    );

    if (verificaPropriedade.rows.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta carona.' });
    }

    // Atualizar status da carona para "Cancelada" em vez de excluir completamente
    const { rows } = await pool.query(
      `UPDATE caronas 
       SET status = 'Cancelada' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao excluir carona:', error);
    res.status(500).json({ error: 'Erro ao excluir carona.' });
  }
});

export default router;