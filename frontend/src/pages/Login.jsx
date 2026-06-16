import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/logo.svg";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await api.post("/api/login", { email, senha });

      // Salvar token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.funcionario));

      // Redirecionar para /ponto
      navigate("/ponto");
    } catch (error) {
      setErro(
        error.response?.data?.erro || "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };



  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src={logo} alt="Ponto Digital" className="logo" />
          <h1>Ponto Digital</h1>
          <p>Sistema de Controle de Ponto</p>
        </div>

        <form onSubmit={handleLogin}>
          {erro && <div className="erro-message">{erro}</div>}

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
              placeholder="Sua senha"
              required
            />
          </div>

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">
          <p>Solicite ao administrador para criar sua conta</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
