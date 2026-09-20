// Associe chaque valeur technique d’un statut
// au texte qui sera affiché dans l’interface.
const nomsStatuts = {
  // Texte correspondant au statut a_faire.
  a_faire: "À faire",

  // Texte correspondant au statut en_cours.
  en_cours: "En cours",

  // Texte correspondant au statut terminee.
  terminee: "Terminée",
};

// Associe chaque valeur technique d’une priorité
// à son texte lisible dans l’interface.
const nomsPriorites = {
  // Texte correspondant à la priorité basse.
  basse: "Basse",

  // Texte correspondant à la priorité moyenne.
  moyenne: "Moyenne",

  // Texte correspondant à la priorité haute.
  haute: "Haute",
};

/*
 * Composant qui affiche les informations complètes
 * d’une tâche dans une fenêtre modale.
 */
function DetailTache({
  // Objet contenant les informations de la tâche.
  tache,

  // Fonction utilisée pour fermer la fenêtre.
  onFermer,
}) {
  // Vérifie si aucune tâche n’a été sélectionnée.
  if (!tache) {
    // N’affiche aucun élément lorsque tache est vide.
    return null;
  }

  // Retourne l’interface de la fenêtre modale.
  return (
    <>
      {/* Arrière-plan sombre placé derrière la fenêtre. */}
      <div
        className="fond-modale"
        onClick={onFermer}
        role="presentation"
      >
        {/*
         * Fenêtre qui contient les informations de la tâche.
         *
         * className applique le style de la fenêtre.
         * onClick empêche la fermeture lorsque l’utilisateur
         * clique à l’intérieur de la fenêtre.
         * role="dialog" indique qu’il s’agit d’une boîte de dialogue.
         * aria-modal indique que la fenêtre est modale.
         * aria-labelledby relie la fenêtre à son titre.
         */}
        <article
          className="modale-detail"
          onClick={(evenement) =>
            evenement.stopPropagation()
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-detail-tache"
        >
          {/* En-tête de la fenêtre de détail. */}
          <header className="entete-modale">
            {/* Groupe contenant le petit titre et le titre principal. */}
            <div>
              {/* Petit texte indiquant le contenu de la fenêtre. */}
              <p className="petit-titre">
                Détail de la tâche
              </p>

              {/*
               * Titre principal de la fenêtre.
               * Son identifiant est utilisé par aria-labelledby.
               */}
              <h2 id="titre-detail-tache">
                {/* Affiche le titre de la tâche sélectionnée. */}
                {tache.titre}
              </h2>
            </div>

            {/*
             * Bouton qui ferme la fenêtre.
             *
             * type="button" empêche l’envoi d’un formulaire.
             * className applique le style du bouton.
             * onClick appelle la fonction de fermeture.
             * aria-label explique le bouton aux lecteurs d’écran.
             */}
            <button
              type="button"
              className="bouton-fermer"
              onClick={onFermer}
              aria-label="Fermer le détail"
            >
              {/* Symbole visible dans le bouton. */}
              ×
            </button>
          </header>

          {/* Zone contenant les badges du statut et de la priorité. */}
          <div className="badges-tache">
            {/*
             * Badge du statut.
             * La classe CSS dépend du statut de la tâche.
             * Exemple : statut-en_cours.
             */}
            <span
              className={`badge-statut statut-${tache.statut}`}
            >
              {
                // Cherche le texte correspondant au statut.
                nomsStatuts[tache.statut] ||
                  // Affiche la valeur originale si le statut
                  // n’existe pas dans nomsStatuts.
                  tache.statut
              }
            </span>

            {/*
             * Badge de la priorité.
             * La classe CSS dépend de la priorité.
             * Exemple : priorite-haute.
             */}
            <span
              className={`badge-priorite priorite-${tache.priorite}`}
            >
              {/* Texte placé avant le nom de la priorité. */}
              Priorité :{" "}

              {
                // Cherche le texte lisible de la priorité.
                nomsPriorites[tache.priorite] ||
                  // Utilise la valeur originale si aucune
                  // correspondance n’est trouvée.
                  tache.priorite
              }
            </span>
          </div>

          {/* Section contenant la description de la tâche. */}
          <section className="bloc-detail">
            {/* Titre de la section. */}
            <h3>Description</h3>

            {/* Paragraphe contenant la description. */}
            <p>
              {
                // Affiche la description lorsqu’elle existe.
                tache.description ||
                  // Affiche un message lorsqu’elle est vide.
                  "Aucune description disponible."
              }
            </p>
          </section>

          {/* Grille contenant les différentes dates. */}
          <div className="grille-detail">
            {/* Bloc de la date de création. */}
            <section className="bloc-detail">
              {/* Titre du premier bloc. */}
              <h3>Date de création</h3>

              {/* Affiche la date de création. */}
              <p>
                {
                  // Utilise creeLe si cette propriété existe.
                  tache.creeLe ||
                    // Texte affiché si la date est absente.
                    "Non indiquée"
                }
              </p>
            </section>

            {/* Bloc de la date d’échéance. */}
            <section className="bloc-detail">
              {/* Titre du deuxième bloc. */}
              <h3>Date d’échéance</h3>

              {/* Affiche la date limite de la tâche. */}
              <p>
                {
                  // Utilise echeance si la date existe.
                  tache.echeance ||
                    // Texte affiché si elle n’existe pas.
                    "Non indiquée"
                }
              </p>
            </section>

            {/* Bloc de la dernière modification. */}
            <section className="bloc-detail">
              {/* Titre du troisième bloc. */}
              <h3>Dernière modification</h3>

              {/* Affiche la date de dernière modification. */}
              <p>
                {
                  // Utilise modifieLe si cette date existe.
                  tache.modifieLe ||
                    // Texte utilisé si elle n’est pas renseignée.
                    "Non indiquée"
                }
              </p>
            </section>
          </div>

          {/* Pied de la fenêtre contenant le bouton final. */}
          <footer className="pied-modale">
            {/*
             * Bouton principal de fermeture.
             * Il exécute la même fonction que le bouton ×.
             */}
            <button
              type="button"
              className="bouton-principal"
              onClick={onFermer}
            >
              {/* Texte visible dans le bouton. */}
              Fermer
            </button>
          </footer>
        </article>
      </div>
    </>
  );
}

// Rend DetailTache importable dans les autres fichiers.
export default DetailTache;