import jwt from "jsonwebtoken";

function verificarAutenticacao(req, res, next) {
  const token = req.headers["x-access-token"];
  
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      console.error("Erro na verificação do token:", err);
      return res.status(401).json({ message: "Usuário não Autenticado" }).end();
    }

    const tipoDeUsuario = decoded.tipo || 'comum';
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = tipoDeUsuario;

    next();
  });
}

export default verificarAutenticacao;
