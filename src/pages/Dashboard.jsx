import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { utilisateur, deconnecter } = useAuth();
  const naviguer = useNavigate();

  const gererDeconnexion = () => {
    deconnecter();
    naviguer("/connexion", { replace: true });
  };

  return (
    <main>
      <h1>Tableau de bord RH</h1>

      <p>
        Bienvenue, <strong>{utilisateur.nom}</strong>
      </p>

      <p>
        Fonction : {utilisateur.role}
      </p>

      <button type="button" onClick={gererDeconnexion}>
        Se déconnecter
      </button>
    </main>
  );
}

export default Dashboard;