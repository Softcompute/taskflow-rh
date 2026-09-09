import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { utilisateur, deconnecter } = useAuth();
  const naviguer = useNavigate();

  const gererDeconnexion = () => {
    deconnecter();
    naviguer("/connexion");
  };

  return (
    <main className="page-simple">
      <section className="carte-simple">
        <p className="etiquette">Tableau de bord</p>

        <h1>Bienvenue, {utilisateur.nom}</h1>

        <p>
          Vous êtes connecté comme :
          <strong> {utilisateur.role}</strong>
        </p>

        <p>
          Le tableau de bord avec les statistiques sera ajouté
          prochainement.
        </p>

        <button
          type="button"
          className="bouton-danger"
          onClick={gererDeconnexion}
        >
          Se déconnecter
        </button>
      </section>
    </main>
  );
}

export default Dashboard;