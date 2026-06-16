import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const usuarioData = localStorage.getItem("usuario");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (usuarioData) {
    const usuario = JSON.parse(usuarioData);
    // Verificar se é admin, gerente ou diretor
    if (usuario.cargo === "Admin" || usuario.cargo === "Gerente" || usuario.cargo === "Diretor") {
      return children;
    }
  }

  // Se não for admin, redirecionar para o ponto
  return <Navigate to="/ponto" replace />;
};

export default ProtectedAdminRoute;
