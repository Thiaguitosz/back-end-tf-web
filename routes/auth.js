import { Router } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import verificarAutenticacao from "../middlewares/autenticacao.js";
import pool from '../lib/db.js';

const router = Router();

// Função para gerar o hash da senha com bcrypt
async function hashPassword(password) {
  const saltRounds = 12;
  return await hash(password, saltRounds);
}

router.get('/validate-token', (req, res, next) => {
  // Use the existing authentication middleware
  verificarAutenticacao(req, res, () => {
    // If the middleware calls next(), it means the token is valid
    return res.status(200).json({ valid: true });
  });
});

// Rota para cadastro de usuário
router.post('/signup', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const hashedPassword = await hashPassword(senha);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone) VALUES ($1, $2, $3, $4) RETURNING id, email, tipo',
      [nome, email, hashedPassword, telefone]
    );
    
    const usuario = rows[0];
    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, process.env.SECRET_TOKEN, {
      expiresIn: '1h',
    });

    return res.status(201).json({ token });
  } catch (error) {
    console.error('Erro no signup:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar o usuário.' });
  }
});

// Rota para login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = rows[0];
    const senhaCorreta = await compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, process.env.SECRET_TOKEN, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Rota para obter o tipo de usuário
router.get("/userType", verificarAutenticacao, (req, res) => {
  res.status(200).json({ tipo: req.userType });
});

export default router;
