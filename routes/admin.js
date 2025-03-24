import { Router } from 'express';
import verificarAutenticacao from "../middlewares/autenticacao.js";
import pool from '../lib/db.js';

const router = Router();

// Middleware para verificar se o usuário é administrador
async function verificarAdmin(req, res, next) {
    try {
        // Aqui estamos assumindo que o tipo de usuário já está disponível em req.userType
        if (req.userType !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
        }

        next(); // O usuário é admin, então passamos para o próximo middleware
    } catch (error) {
        console.error('Erro ao verificar administrador:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
}

// Rota para listar todos os usuários
router.get('/usuarios', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, nome, email, telefone, criado_em FROM usuarios');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

// Rota para listar todas as caronas
router.get('/caronas', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT c.id, u.nome AS motorista, c.local_partida, c.destino, c.horario, c.vagas_disponiveis, c.status, c.criado_em 
            FROM caronas c 
            JOIN usuarios u ON c.usuario_id = u.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao listar caronas:', error);
        res.status(500).json({ error: 'Erro ao buscar caronas.' });
    }
});

// Rota para deletar um usuário
router.delete('/usuarios/:id', verificarAutenticacao, verificarAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
});

// Rota para deletar uma carona
router.delete('/caronas/:id', verificarAutenticacao, verificarAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query('DELETE FROM caronas WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Carona não encontrada.' });
        }

        res.status(200).json({ message: 'Carona deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar carona:', error);
        res.status(500).json({ error: 'Erro ao excluir carona.' });
    }
});

// Rota para editar um usuário
router.put('/usuarios/:id', verificarAutenticacao, verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    try {
        const { rowCount } = await pool.query(
            'UPDATE usuarios SET nome = $1, email = $2, telefone = $3 WHERE id = $4',
            [nome, email, telefone, id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
});

// Rota para editar uma carona
router.put('/caronas/:id', verificarAutenticacao, verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { motorista, local_partida, destino, vagas_disponiveis, status } = req.body;

    try {
        // Primeiro, buscar o ID do usuário pelo nome (assumindo que motorista é o nome do usuário)
        let motoristaId = null;
        if (motorista) {
            const motoristaResult = await pool.query('SELECT id FROM usuarios WHERE nome = $1', [motorista]);
            if (motoristaResult.rows.length > 0) {
                motoristaId = motoristaResult.rows[0].id;
            } else {
                return res.status(400).json({ error: 'Motorista não encontrado.' });
            }
        }

        // Atualizar a carona com o ID do motorista
        const { rowCount } = await pool.query(
            'UPDATE caronas SET usuario_id = $1, local_partida = $2, destino = $3, vagas_disponiveis = $4, status = $5 WHERE id = $6',
            [motoristaId, local_partida, destino, vagas_disponiveis, status, id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Carona não encontrada.' });
        }

        res.status(200).json({ message: 'Carona atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao editar carona:', error);
        res.status(500).json({ error: 'Erro ao atualizar carona.' });
    }
});

export default router;
