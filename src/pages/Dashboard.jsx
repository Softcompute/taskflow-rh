import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { utilisateur } = useAuth();

  return (
    <section>
      <header className="entete-page">
        <div>
          <p className="petit-titre">
            Tableau de bord
          </p>

          <h1>
            Bonjour, {utilisateur.nom}
          </h1>

          <p>
            Voici un aperçu des activités du
            département RH.
          </p>
        </div>
      </header>

      <div className="cartes-statistiques">
        <article className="carte-statistique">
          <span>Projets RH</span>
          <strong>0</strong>
        </article>

        <article className="carte-statistique">
          <span>Tâches totales</span>
          <strong>0</strong>
        </article>

        <article className="carte-statistique">
          <span>En cours</span>
          <strong>0</strong>
        </article>

        <article className="carte-statistique">
          <span>Terminées</span>
          <strong>0 %</strong>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;