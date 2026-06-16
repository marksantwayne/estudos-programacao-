import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Registro.css";

const Registro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("Funcionário");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      await api.post("/api/funcionarios", {
        nome,
        email,
        senha,
        cargo,
      });

      setSucesso("✓ Conta criada com sucesso! Redirecionando...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setErro(
        error.response?.data?.erro || "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <div className="registro-header">
          <h1>Criar Conta</h1>
          <p>Sistema de Controle de Ponto</p>
        </div>

        <form onSubmit={handleRegistro}>
          {erro && <div className="erro-message">{erro}</div>}
          {sucesso && <div className="sucesso-message">{sucesso}</div>}

          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
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
              <option value="Diretor">Diretor</option>
            </select>
          </div>

          <button type="submit" disabled={carregando}>
            {carregando ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <div className="registro-footer">
          <p>
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="link-button"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
