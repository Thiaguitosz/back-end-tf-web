# IFMobi - API Routes
### URL_API: https://back-end-tf-web-alpha.vercel.app/

## Authentication Routes `/api/auth`
### `POST /signup`
- **Descrição**: Cadastra um novo usuário
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Nome do usuário",
    "email": "email-usuario@email.com",
    "senha": "****",
    "telefone": "(opcional)"
  }
  ```
- **Retorno**: Token de autenticação
- **Observações**: Todos os campos são obrigatórios (exceto telefone)

### `POST /login`
- **Descrição**: Autenticação de usuário
- **Corpo da Requisição**:
  ```json
  {
    "email": "email-usuario@email.com",
    "senha": "****"
  }
  ```
- **Retorno**: Token de autenticação
- **Observações**: Ambos os campos são obrigatórios

### `GET /userType`
- **Descrição**: Retorna o tipo de usuário
- **Requer**: Token de autenticação
- **Retorno**: Tipo do usuário (admin/usuário comum)

## Caronas Routes `/api/caronas`

### `GET /`
- **Descrição**: Lista todas as caronas ativas
- **Retorno**: Array de caronas ativas com detalhes

### `GET /minhas`
- **Descrição**: Lista as caronas do usuário autenticado
- **Requer**: Token de autenticação
- **Retorno**: Caronas ativas do usuário

### `POST /`
- **Descrição**: Oferece uma nova carona
- **Requer**: Token de autenticação
- **Corpo da Requisição**:
  ```json
  {
    "local_partida": "Local de partida",
    "horario": "Data e hora da carona",
    "destino": "Destino da carona",
    "vagas_disponiveis": "Número de vagas"
  }
  ```
- **Observações**: 
  - Todos os campos são obrigatórios
  - Número de vagas deve ser positivo
  - Usuário só pode ter uma carona ativa por vez

## Admin Routes `/api/admin`

### `GET /usuarios`
- **Descrição**: Lista todos os usuários
- **Requer**: Token de autenticação de admin
- **Retorno**: Array de usuários (id, nome, email, telefone)

### `GET /caronas`
- **Descrição**: Lista todas as caronas
- **Requer**: Token de autenticação de admin
- **Retorno**: Array de caronas com detalhes do motorista

### `DELETE /usuarios/:id`
- **Descrição**: Deleta um usuário específico
- **Requer**: Token de autenticação de admin
- **Parâmetro**: ID do usuário

### `DELETE /caronas/:id`
- **Descrição**: Deleta uma carona específica
- **Requer**: Token de autenticação de admin
- **Parâmetro**: ID da carona

### `PUT /usuarios/:id`
- **Descrição**: Edita informações de um usuário
- **Requer**: Token de autenticação de admin
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Novo nome",
    "email": "novo-email@email.com",
    "telefone": "Novo telefone"
  }
  ```

### `PUT /caronas/:id`
- **Descrição**: Edita informações de uma carona
- **Requer**: Token de autenticação de admin
- **Corpo da Requisição**:
  ```json
  {
    "motorista": "Nome do motorista",
    "local_partida": "Novo local de partida",
    "destino": "Novo destino",
    "vagas_disponiveis": "Novo número de vagas",
    "status": "Novo status da carona"
  }
  ```

## Observações Gerais
- Todas as rotas que modificam dados requerem autenticação
- Rotas de admin são exclusivas para usuários com tipo 'admin'
- Tokens de autenticação expiram em 1 hora
