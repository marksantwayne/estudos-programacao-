const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  try {
    // Verificar se já existe um admin
    const adminExistente = await prisma.funcionario.findFirst({
      where: {
        cargo: "Admin",
      },
    });

    if (adminExistente) {
      console.log("✓ Admin já existe");
      return;
    }

    // Criar conta de admin padrão
    const senhaHash = await bcrypt.hash("admin123", 10);

    const admin = await prisma.funcionario.create({
      data: {
        nome: "Administrador",
        email: "admin@example.com",
        senha: senhaHash,
        cargo: "Admin",
        ativo: true,
      },
    });

    console.log("✓ Admin criado com sucesso!");
    console.log(`  Email: admin@example.com`);
    console.log(`  Senha: admin123`);
    console.log(`  ⚠️  ALTERE A SENHA NA PRIMEIRA ENTRADA!`);
  } catch (error) {
    console.error("Erro ao criar admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
