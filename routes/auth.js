/*import { Router } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import verificarAutenticacao from "../middlewares/autenticacao.js";
import pool from '../lib/db.js'; // Supondo que você tenha a conexão com o banco aqui

const router = Router();

// Função para gerar o hash da senha com bcrypt
async function hashPassword(password) {
  const saltRounds = 12;
  const hashedPassword = await hash(password, saltRounds);
  return hashedPassword;
}

// Rota para cadastro de usuário
router.post('/signup', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    // Criptografa a senha antes de salvar no banco
    const hashedPassword = await hashPassword(senha);

    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone) VALUES ($1, $2, $3, $4) RETURNING id, email',
      [nome, email, hashedPassword, telefone]
    );

    const usuario = rows[0];

    // Gera um token JWT para o usuário recém-cadastrado
    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, process.env.SECRET_TOKEN, {
      expiresIn: '1h',
    });

    return res.status(201).json({ token }); // Retorna apenas o token
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cadastrar o usuário.' });
  }
});

router.post('/login', async (req, res) => {
  console.log('oi');
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  

  try {
    console.log('oi2');
    // 1️⃣ Busca usuário pelo email
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('oi3');
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
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

router.get("/userType", verificarAutenticacao, (req, res) => {
  // Acessando o tipo de usuário que foi adicionado no middleware
  const tipoDeUsuario = req.userType;

  // Retornando o tipo de usuário na resposta
  res.status(200).json({ tipo: tipoDeUsuario });
});

export default router;
*/