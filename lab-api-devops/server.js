const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const users = [
  { id: 1, nome: "Alice", versao: "1.1.0" },
  { id: 2, nome: "Bob", versao: "1.1.0" },
];

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Pipeline N3 com Testes e Deploy!",
    versao: "1.1.0",
  });
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "Usuário não encontrado" });
  }
});

module.exports = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
