## Rotas de Administração

### **[GET] /usuarios**
**Descrição:** Lista todos os usuários.

### **[GET] /caronas**
**Descrição:** Lista todas as caronas.

### **[DELETE] /usuarios/:id**
**Descrição:** Deleta um usuário pelo ID.

### **[DELETE] /caronas/:id**
**Descrição:** Deleta uma carona pelo ID.

### **[PUT] /usuarios/:id**
**Descrição:** Edita um usuário pelo ID.

**Body:**
```json
{
  "nome": "Nome do usuário",
  "email": "email@exemplo.com",
  "telefone": "(00) 00000-0000"
}
```

### **[PUT] /caronas/:id**
**Descrição:** Edita uma carona pelo ID.

**Body:**
```json
{
  "motorista": "Nome do motorista",
  "local_partida": "Local de partida",
  "destino": "Destino",
  "vagas_disponiveis": 3,
  "status": "ativo"
}
