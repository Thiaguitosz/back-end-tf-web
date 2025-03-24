# trabalhofinal-backend
# Thiago Araújo Miranda

# API de Caronas

## Rotas

### **Usuário**

**[POST] /usuario**

Descrição: Cadastra um usuário.

Body:
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456"
}
```

---

**[POST] /login**

Descrição: Realiza o login do usuário.

Body:
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

---

**[GET] /usuario/{id}**

Descrição: Obtém informações de um usuário pelo ID.

---

### **Carona**

**[POST] /carona**

Descrição: Cria uma nova carona.

Body:
```json
{
  "origem": "Campus IFNMG",
  "destino": "Centro de Salinas",
  "horario": "18:00",
  "vagas": 3
}
```

---

**[GET] /carona**

Descrição: Lista todas as caronas disponíveis.

---

**[GET] /carona/{id}**

Descrição: Obtém detalhes de uma carona específica pelo ID.

---

**[PUT] /carona/{id}**

Descrição: Atualiza os dados de uma carona existente.

Body:
```json
{
  "origem": "Campus IFNMG",
  "destino": "Rodoviária",
  "horario": "19:00",
  "vagas": 2
}
```

---

**[DELETE] /carona/{id}**

Descrição: Remove uma carona pelo ID.

---

### **Administração**

**[GET] /admin/usuarios**

Descrição: Obtém a lista de todos os usuários cadastrados. (Requer permissão de administrador)

---

**[DELETE] /admin/usuario/{id}**

Descrição: Remove um usuário pelo ID. (Requer permissão de administrador)
