// Importe Link depuis React Router.
// Link permet de naviguer sans recharger toute la page.
import { Link } from "react-router-dom";

/*
 * Composant qui affiche les informations
 * d’un projet sous la forme d’une carte.
 */
function CarteProjet({
  // Objet contenant les informations du projet.
  projet,

  // Tableau contenant toutes les tâches.
  taches,

  // Fonction à exécuter pour modifier le projet.
  onModifier,

  // Fonction à exécuter pour supprimer le projet.
  onSupprimer,

  // Indique si la suppression est en cours.
  suppressionEnCours,
}) {
  /*
   * Sélectionne uniquement les tâches
   * appartenant au projet affiché.
   */
  const tachesProjet = taches.filter(
    // Examine chaque tâche du tableau.
    (tache) =>
      // Compare l’identifiant du projet de la tâche
      // avec l’identifiant du projet affiché.
      // String évite une différence entre 1 et "1".
      String(tache.projetId) ===
      String(projet.id)
  );

  // Compte le nombre total de tâches du projet.
  const nombreTaches = tachesProjet.length;

  /*
   * Compte uniquement les tâches terminées.
   */
  const nombreTerminees = tachesProjet.filter(
    // Conserve les tâches dont le statut est terminee.
    (tache) =>
      tache.statut === "terminee"
  ).length;

  /*
   * Calcule le pourcentage d’avancement du projet.
   */
  const pourcentage =
    // Vérifie si le projet ne contient aucune tâche.
    nombreTaches === 0
      // Sans tâche, l’avancement est de 0 %.
      ? 0
      // Sinon, calcule le pourcentage de tâches terminées.
      : Math.round(
          // Divise le nombre de tâches terminées
          // par le nombre total, puis multiplie par 100.
          (nombreTerminees / nombreTaches) * 100
        );

  // Retourne l’interface visuelle de la carte.
  return (
    // article représente une carte de projet indépendante.
    <article className="carte-projet">
      {/* Bande colorée permettant d’identifier le projet. */}
      <div
        // Classe utilisée pour appliquer le style CSS.
        className="couleur-projet"

        // Applique une couleur dynamique directement en JSX.
        style={{
          // Utilise la couleur du projet.
          backgroundColor:
            // Si aucune couleur n’existe,
            // utilise le bleu comme couleur par défaut.
            projet.couleur || "#2563eb",
        }}
      />

      {/* En-tête contenant le nom, la date et le nombre de tâches. */}
      <div className="entete-carte-projet">
        {/* Groupe contenant le nom et la date du projet. */}
        <div>
          {/* Affiche le nom du projet. */}
          <h2>{projet.nom}</h2>

          {/* Affiche la date de création du projet. */}
          <span className="date-projet">
            {/* Texte suivi de la date contenue dans creeLe. */}
            Créé le {projet.creeLe}
          </span>
        </div>

        {/* Affiche le nombre total de tâches du projet. */}
        <span className="nombre-taches">
          {/* Insère le nombre calculé. */}
          {nombreTaches} tâche

          {
            // Ajoute la lettre s lorsque le nombre
            // de tâches est différent de 1.
            nombreTaches !== 1 ? "s" : ""
          }
        </span>
      </div>

      {/* Zone qui affiche la description du projet. */}
      <p className="description-projet">
        {
          // Affiche la description lorsqu’elle existe.
          projet.description ||
            // Affiche ce texte si la description est vide.
            "Aucune description disponible."
        }
      </p>

      {/* Zone présentant l’avancement du projet. */}
      <div className="avancement">
        {/* Ligne contenant le titre et le pourcentage. */}
        <div className="information-avancement">
          {/* Libellé de la progression. */}
          <span>Avancement</span>

          {/* Affiche le pourcentage calculé. */}
          <strong>{pourcentage} %</strong>
        </div>

        {/* Conteneur extérieur de la barre de progression. */}
        <div className="barre-progression">
          {/* Partie colorée représentant la progression réelle. */}
          <div
            // Classe CSS de la progression intérieure.
            className="progression"

            // Applique des styles calculés avec JavaScript.
            style={{
              // Définit la largeur selon le pourcentage.
              width: `${pourcentage}%`,

              // Utilise la couleur du projet.
              backgroundColor:
                // Utilise le bleu si aucune couleur n’existe.
                projet.couleur || "#2563eb",
            }}
          />
        </div>
      </div>

      {/* Zone contenant les boutons d’action. */}
      <div className="actions-projet">
        {/* Lien qui ouvre la page des tâches du projet. */}
        <Link
          // Construit une adresse contenant l’identifiant.
          // Exemple : /projets/1
          to={`/projets/${projet.id}`}

          // Classe utilisée pour le style du lien.
          className="bouton-voir"
        >
          {/* Texte visible dans le lien. */}
          Voir les tâches
        </Link>

        {/* Bouton permettant de modifier le projet. */}
        <button
          // Empêche un éventuel envoi de formulaire.
          type="button"

          // Classe utilisée pour le style CSS.
          className="bouton-modifier"

          // Exécute onModifier en lui donnant le projet.
          onClick={() => onModifier(projet)}
        >
          {/* Texte visible dans le bouton. */}
          Modifier
        </button>

        {/* Bouton permettant de supprimer le projet. */}
        <button
          // Définit un bouton simple.
          type="button"

          // Classe utilisée pour le style CSS.
          className="bouton-supprimer"

          // Exécute onSupprimer avec le projet sélectionné.
          onClick={() => onSupprimer(projet)}

          // Désactive le bouton pendant la suppression.
          disabled={suppressionEnCours}
        >
          {
            // Vérifie si la suppression est en cours.
            suppressionEnCours
              // Texte affiché pendant la suppression.
              ? "Suppression..."
              // Texte affiché lorsque le bouton est disponible.
              : "Supprimer"
          }
        </button>
      </div>
    </article>
  );
}

// Rend CarteProjet importable dans les autres fichiers.
export default CarteProjet;