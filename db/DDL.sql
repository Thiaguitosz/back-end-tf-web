-- Criação da tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    criado_em TIMESTAMP DEFAULT now()
);

-- Criação da tabela de caronas oferecidas
CREATE TABLE caronas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    local_partida VARCHAR(255) NOT NULL,
    horario TIMESTAMP NOT NULL,
    destino VARCHAR(255) NOT NULL,
    vagas_disponiveis INT NOT NULL CHECK (vagas_disponiveis > 0),
    status VARCHAR(50) DEFAULT 'Ativa',
    criado_em TIMESTAMP DEFAULT now()
);