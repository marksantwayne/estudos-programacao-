const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const autenticar = require("./middleware/autenticar");
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpg";
    cb(null, nome);
  },
});

const upload = multer({ storage });

// Rota de verificação
app.get("/", (req, res) => {
  res.json({ mensagem: "Servidor do ponto rodando!" });
});

// Rota de Registro
app.post("/api/funcionarios", async (req, res) => {
  try {
    const { nome, email, senha, cargo, empresaLat, empresaLng } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
    }

    // Verificar se email já existe
    const emailExistente = await prisma.funcionario.findUnique({
      where: { email },
    });

    if (emailExistente) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo: cargo || "Funcionário",
        empresaLat: empresaLat ? Number(empresaLat) : null,
        empresaLng: empresaLng ? Number(empresaLng) : null,
      },
    });

    // Não retornar a senha
    const { senha: _, ...funcionarioSemSenha } = funcionario;
    return res.status(201).json(funcionarioSemSenha);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
});

// Rota de Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    // Buscar funcionário por email
    const funcionario = await prisma.funcionario.findUnique({
      where: { email },
    });

    if (!funcionario) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, funcionario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    // Gerar JWT com validade de 8 horas
    const token = jwt.sign(
      { id: funcionario.id, email: funcionario.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
        email: funcionario.email,
        cargo: funcionario.cargo,
      },
    });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
});

// Listar funcionários (apenas para administração)
app.get("/api/funcionarios", async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        ativo: true,
        createdAt: true,
      },
    });
    return res.json(funcionarios);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
});

// Registrar ponto (protegido)
app.post("/api/pontos", autenticar, upload.single("foto"), async (req, res) => {
  try {
    const { tipo, latitude, longitude, endereco, observacao } = req.body;
    const funcionarioId = req.funcionarioId; // Do middleware de autenticação

    if (!tipo || !latitude || !longitude) {
      return res.status(400).json({ erro: "Campos obrigatórios faltando" });
    }

    if (!req.file) {
      return res.status(400).json({ erro: "Foto obrigatória" });
    }

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      return res.status(404).json({ erro: "Funcionário não encontrado" });
    }

    const ponto = await prisma.ponto.create({
      data: {
        funcionarioId,
        tipo,
        latitude: Number(latitude),
        longitude: Number(longitude),
        endereco: endereco || null,
        fotoUrl: `/uploads/${req.file.filename}`,
        observacao: observacao || null,
        dentroDoRaio: true,
      },
    });

    return res.status(201).json(ponto);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
});

// Obter pontos do funcionário autenticado (protegido)
app.get("/api/meus-pontos", autenticar, async (req, res) => {
  try {
    const funcionarioId = req.funcionarioId;

    const pontos = await prisma.ponto.findMany({
      where: { funcionarioId },
      orderBy: { dataHora: "desc" },
    });

    return res.json(pontos);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
});

// Obter pontos de um funcionário específico (para compatibilidade)
app.get("/api/pontos/:funcionarioId", async (req, res) => {
  try {
    const { funcionarioId } = req.params;

    const pontos = await prisma.ponto.findMany({
      where: { funcionarioId },
      orderBy: { dataHora: "desc" },
    });

    return res.json(pontos);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});