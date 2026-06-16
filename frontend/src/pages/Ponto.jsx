import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/logo.svg";
import "../styles/Ponto.css";

const Ponto = () => {
  const [usuario, setUsuario] = useState(null);
  const [hora, setHora] = useState(new Date());
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("ENTRADA");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Pegar dados do usuário do localStorage
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }

    // Atualizar hora em tempo real
    const timer = setInterval(() => {
      setHora(new Date());
    }, 1000);

    // Buscar pontos do usuário
    carregarPontos();

    return () => clearInterval(timer);
  }, []);

  const carregarPontos = async () => {
    try {
      const response = await api.get("/api/meus-pontos");
      setPontos(response.data);
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
    }
  };

  const obterGeolocalização = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocalização não suportada"));
      }
    });
  };

  const handleBaterPonto = async () => {
    setCarregando(true);
    setMensagem("");

    try {
      // Obter geolocalização
      const geo = await obterGeolocalização();
      setLatitude(geo.latitude);
      setLongitude(geo.longitude);

      // Capturar foto da câmera
      // Para simplificar, vamos criar uma imagem vazia
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgb(200, 200, 200)";
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText("Foto - " + new Date().toLocaleTimeString(), 50, 120);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("tipo", tipo);
        formData.append("latitude", geo.latitude);
        formData.append("longitude", geo.longitude);
        formData.append("foto", blob, "foto.jpg");
        formData.append(
          "observacao",
          `Ponto registrado em ${new Date().toLocaleString()}`
        );

        try {
          await api.post("/api/pontos", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          setMensagem(`✓ ${tipo} registrada com sucesso!`);
          await carregarPontos();
        } catch (error) {
          setMensagem(
            `✗ Erro: ${error.response?.data?.erro || error.message}`
          );
        }
      });
    } catch (error) {
      setMensagem(`✗ Erro de geolocalização: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  const handleSair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const formatarHora = (data) => {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="ponto-container">
      <header className="ponto-header">
        <div className="header-content">
          <div className="header-logo-title">
            <img src={logo} alt="Ponto Digital" className="header-logo" />
            <h1>Ponto Digital</h1>
          </div>
          <div className="usuario-info">
            <span>👤 {usuario?.nome}</span>
            {(usuario?.cargo === "Admin" || 
              usuario?.cargo === "Gerente" || 
              usuario?.cargo === "Diretor") && (
              <button onClick={() => navigate("/admin")} className="btn-admin">
                ⚙️ Admin
              </button>
            )}
            <button onClick={handleSair} className="btn-sair">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="ponto-main">
        <div className="relogio-container">
          <div className="relogio">
            <h2>{formatarHora(hora)}</h2>
            <p>{hora.toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        <div className="ponto-section">
          <div className="tipo-select">
            <label>Tipo de Ponto:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              disabled={carregando}
            >
              <option value="ENTRADA">Entrada</option>
              <option value="CAFE_MANHA_SAIDA">Intervalo - Saída</option>
              <option value="CAFE_MANHA_RETORNO">Intervalo - Retorno</option>
              <option value="ALMOCO_SAIDA">Almoço - Saída</option>
              <option value="ALMOCO_RETORNO">Almoço - Retorno</option>
              <option value="CAFE_TARDE_SAIDA">Café - Saída</option>
              <option value="CAFE_TARDE_RETORNO">Café - Retorno</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          <button
            onClick={handleBaterPonto}
            disabled={carregando}
            className="btn-ponto"
          >
            {carregando ? "Registrando..." : "🕐 Bater Ponto"}
          </button>

          {mensagem && (
            <div
              className={`mensagem ${
                mensagem.startsWith("✓") ? "sucesso" : "erro"
              }`}
            >
              {mensagem}
            </div>
          )}
        </div>

        <div className="historico-section">
          <h3>Histórico de Pontos</h3>
          {pontos.length === 0 ? (
            <p className="vazio">Nenhum ponto registrado</p>
          ) : (
            <div className="pontos-list">
              {pontos.map((ponto) => (
                <div key={ponto.id} className="ponto-item">
                  <div className="ponto-tipo">{ponto.tipo}</div>
                  <div className="ponto-data">
                    {formatarData(ponto.dataHora)}
                  </div>
                  <div className="ponto-localizacao">
                    📍 {ponto.latitude?.toFixed(4)}, {ponto.longitude?.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ponto;
