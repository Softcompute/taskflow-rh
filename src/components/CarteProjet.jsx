import { Link } from "react-router-dom";

function CarteProjet({
  projet,
  taches,
  onModifier,
  onSupprimer,
}) {
  const tachesProjet = taches.filter(
    (tache) =>
      String(tache.projetId) === String(projet.id)
  );

  const nombreTaches = tachesProjet.length;

  const nombreTerminees = tachesProjet.filter(
    (tache) => tache.statut === "terminee"
  ).length;

  const pourcentage =
    nombreTaches === 0
      ? 0
      : Math.round(
          (nombreTerminees / nombreTaches) * 100
        );

  return (
    <article className="carte-projet">
      <div
        className="couleur-projet"
        style={{ backgroundColor: projet.couleur }}
      />

      <div className="entete-carte-projet">
        <div>
          <h2>{projet.nom}</h2>

          <span className="date-projet">
            Créé le {projet.creeLe}
          </span>
        </div>

        <span className="nombre-taches">
          {nombreTaches} tâche
          {nombreTaches !== 1 ? "s" : ""}
        </span>
      </div>

      <p className="description-projet">
        {projet.description ||
          "Aucune description disponible."}
      </p>

      <div className="avancement">
        <div className="information-avancement">
          <span>Avancement</span>
          <strong>{pourcentage} %</strong>
        </div>

        <div className="barre-progression">
          <div
            className="progression"
            style={{
              width: `${pourcentage}%`,
              backgroundColor: projet.couleur,
            }}
          />
        </div>
      </div>

      <div className="actions-projet">
        <Link
          to={`/projets/${projet.id}`}
          className="bouton-voir"
        >
          Voir les tâches
        </Link>

        <button
          type="button"
          className="bouton-modifier"
          onClick={() => onModifier(projet)}
        >
          Modifier
        </button>

        <button
          type="button"
          className="bouton-supprimer"
          onClick={() => onSupprimer(projet)}
        >
          Supprimer
        </button>
      </div>
    </article>
  );
}

export default CarteProjet;