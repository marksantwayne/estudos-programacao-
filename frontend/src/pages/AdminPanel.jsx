import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/logo.svg";
import "../styles/Admin.css";

const AdminPanel = () => {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("Funcionário");
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se é admin
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      if (user.cargo !== "Admin" && user.cargo !== "Diretor" && user.cargo !== "Gerente") {
        navigate("/ponto");
        return;
      }
      setUsuario(user);
    }

    carregarFuncionarios();
  }, [navigate]);

  const carregarFuncionarios = async () => {
    try {
      const response = await api.get("/api/funcionarios");
      setFuncionarios(response.data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const handleCriarConta = async (e) => {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      await api.post("/api/funcionarios", {
        nome,
        email,
        senha,
        cargo,
      });

      setMensagem("✓ Conta criada com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setCargo("Funcionário");

      // Recarregar lista de funcionários
      await carregarFuncionarios();
    } catch (error) {
      setMensagem(
        `✗ Erro: ${error.response?.data?.erro || error.message}`
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleSair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  if (!usuario) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-logo-title">
            <img src={logo} alt="Ponto Digital" className="header-logo" />
            <h1>Painel Administrativo</h1>
          </div>
          <div className="usuario-info">
            <span>👤 {usuario?.nome} ({usuario?.cargo})</span>
            <button onClick={handleSair} className="btn-sair">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-grid">
          {/* Seção de Criar Conta */}
          <section className="criar-conta-section">
            <h2>Criar Nova Conta</h2>
            <form onSubmit={handleCriarConta}>
              {mensagem && (
                <div
                  className={`mensagem ${
                    mensagem.startsWith("✓") ? "sucesso" : "erro"
                  }`}
                >
                  {mensagem}
                </div>
              )}

              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do funcionário"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha Temporária:</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cargo:</label>
                <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
                  <option value="Funcionário">Funcionário</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button type="submit" disabled={carregando} className="btn-criar">
                {carregando ? "Criando..." : "+ Criar Conta"}
              </button>
            </form>
          </section>

          {/* Seção de Funcionários */}
          <section className="funcionarios-section">
            <h2>Funcionários Cadastrados</h2>
            {funcionarios.length === 0 ? (
              <p className="vazio">Nenhum funcionário cadastrado</p>
            ) : (
              <div className="funcionarios-list">
                {funcionarios.map((func) => (
                  <div key={func.id} className="funcionario-item">
                    <div className="info">
                      <h4>{func.nome}</h4>
                      <p className="email">{func.email}</p>
                      <p className="cargo">{func.cargo}</p>
                    </div>
                    <div className="status">
                      {func.ativo ? (
                        <span className="ativo">✓ Ativo</span>
                      ) : (
                        <span className="inativo">✗ Inativo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
