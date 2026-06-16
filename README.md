# Ponto Digital 🕐

Sistema de controle de ponto com geolocalização para funcionários.

## 🚀 Tecnologias

- **Backend:** Node.js + Express + Prisma + SQLite
- **Frontend:** React + Vite + React Router
- **Autenticação:** JWT
- **Upload de arquivos:** Multer

## 📋 Pré-requisitos

- Node.js (v18+)
- npm ou yarn
- Git

## ⚙️ Instalação

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

**Credenciais padrão:**
- Email: `admin@example.com`
- Senha: `admin123`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## 🔒 Variáveis de Ambiente

### Backend (`.env`)
```
DATABASE_URL="file:./dev.db"
PORT=3333
JWT_SECRET=sua_chave_secreta_aqui
```

⚠️ **IMPORTANTE:** Altere o `JWT_SECRET` em produção!

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3333
```

## 📁 Estrutura do Projeto

```
ponto-digital/
├── backend/
│   ├── middleware/         # Autenticação JWT
│   ├── prisma/             # Schema e migrações
│   ├── uploads/            # Fotos de ponto
│   ├── server.js           # Servidor Express
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/          # Login, Ponto, Admin
    │   ├── components/     # Rotas protegidas
    │   ├── services/       # Requisições HTTP
    │   ├── styles/         # CSS
    │   └── App.jsx
    └── package.json
```

## 🔑 Funcionalidades

- ✅ Login com JWT
- ✅ Bater ponto com geolocalização
- ✅ Upload de foto
- ✅ Histórico de pontos
- ✅ Painel administrativo
- ✅ Gerenciamento de funcionários

## 🚨 Segurança

- ✅ `.env` não é versionado (use `.env.example` como referência)
- ✅ `node_modules/` não é versionado
- ✅ Senhas criptografadas com bcryptjs
- ✅ Autenticação com JWT
- ✅ CORS configurado

## 📝 Scripts

**Backend:**
```bash
npm run dev   # Rodar servidor
npm run seed  # Popular banco de dados
```

**Frontend:**
```bash
npm run dev     # Modo desenvolvimento
npm run build   # Build para produção
npm run preview # Visualizar build
```

## 🤝 Contribuições

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

markskt

---

**Última atualização:** 16/06/2026
