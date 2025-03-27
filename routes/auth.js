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
    return res.status(200).json({ valid: true, isAdmin: req.userType === 'admin' });
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

router.put('/edit-profile', verificarAutenticacao, async (req, res) => {
  const userId = req.userId; // Obtido do middleware de autenticação
  const { nome, email, senha, telefone } = req.body;

  // Verifica se pelo menos um campo foi enviado para atualização
  if (!nome && !email && !senha && !telefone) {
    return res.status(400).json({ error: 'Nenhum dado para atualizar foi fornecido.' });
  }

  try {
    // Primeiro, busca o usuário atual para manter os dados que não foram alterados
    const { rows: currentUserRows } = await pool.query(
      'SELECT nome, email, telefone FROM usuarios WHERE id = $1',
      [userId]
    );

    if (currentUserRows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Prepara os dados para atualização, usando os valores atuais se não forem fornecidos
    const updateNome = nome || currentUserRows[0].nome;
    const updateEmail = email || currentUserRows[0].email;
    const updateTelefone = telefone || currentUserRows[0].telefone;

    // Hash da senha, se fornecida
    const hashedSenha = senha ? await hashPassword(senha) : null;

    // Constrói a query de atualização
    let query = 'UPDATE usuarios SET nome = $1, email = $2, telefone = $3';
    let queryParams = [updateNome, updateEmail, updateTelefone];

    // Adiciona atualização de senha, se fornecida
    if (hashedSenha) {
      query += ', senha = $4 WHERE id = $5';
      queryParams.push(hashedSenha, userId);
    } else {
      query += ' WHERE id = $4';
      queryParams.push(userId);
    }

    // Executa a atualização
    await pool.query(query, queryParams);

    return res.status(200).json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro na edição de perfil:', error);
    
    // Verifica se é um erro de violação de restrição única (ex: email duplicado)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email já está em uso.' });
    }

    return res.status(500).json({ error: 'Erro ao atualizar o perfil.' });
  }
});

router.get('/profile', verificarAutenticacao, async (req, res) => {
  const userId = req.userId; // Obtido do middleware de autenticação

  try {
    // Busca os dados do usuário (excluindo a senha)
    const { rows } = await pool.query(
      'SELECT nome, email, telefone FROM usuarios WHERE id = $1', 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Retorna os dados do perfil
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dados do perfil:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do perfil.' });
  }
});

export default router;
