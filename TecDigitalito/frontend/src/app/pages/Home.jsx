import { useAuth } from "../hooks/useAuth";
import QuickAccess from "../components/QuickAccess";
import { LogOut } from "lucide-react";
import "../../styles/Home.css";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="home-page">
      <div className="home-header-row">
        <div className="home-title-group">
          <h1>Bienvenido, {user?.name || "Usuario"}</h1>
          <p className="home-subtitle">Tu plataforma de cursos virtuales del TEC.</p>
        </div>
        <button onClick={logout} className="btn-logout">
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
      <QuickAccess />
    </div>
  );
}
