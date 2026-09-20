/*
 * Objet permettant de transformer les valeurs techniques
 * des statuts en textes faciles à comprendre.
 */
const nomsStatuts = {
  // Texte affiché pour une tâche qui n’a pas commencé.
  a_faire: "À faire",

  // Texte affiché pour une tâche en traitement.
  en_cours: "En cours",

  // Texte affiché pour une tâche terminée.
  terminee: "Terminée",
};

/*
 * Objet permettant de transformer les valeurs techniques
 * des priorités en textes lisibles.
 */
const nomsPriorites = {
  // Texte affiché pour une priorité basse.
  basse: "Basse",

  // Texte affiché pour une priorité moyenne.
  moyenne: "Moyenne",

  // Texte affiché pour une priorité haute.
  haute: "Haute",
};

/*
 * Composant qui affiche une tâche dans la liste
 * des tâches d’un projet.
 */
function LigneTache({
  // Objet contenant toutes les informations de la tâche.
  tache,

  // Fonction permettant d’afficher le détail de la tâche.
  onVoir,

  // Fonction permettant d’ouvrir le formulaire de modification.
  onModifier,

  // Fonction permettant de supprimer la tâche.
  onSupprimer,

  // Fonction permettant de changer rapidement son statut.
  onChangerStatut,
}) {
  /*
   * Détermine le prochain statut de la tâche.
   *
   * Le cycle utilisé est :
   * À faire -> En cours -> Terminée -> À faire.
   */
  const obtenirStatutSuivant = () => {
    // Vérifie si la tâche est actuellement à faire.
    if (tache.statut === "a_faire") {
      // Le prochain statut sera en cours.
      return "en_cours";
    }

    // Vérifie si la tâche est actuellement en cours.
    if (tache.statut === "en_cours") {
      // Le prochain statut sera terminée.
      return "terminee";
    }

    // Si la tâche est terminée, le cycle recommence
    // avec le statut à faire.
    return "a_faire";
  };

  // Exécute la fonction et conserve le prochain statut.
  const statutSuivant = obtenirStatutSuivant();

  // Retourne l’interface d’une ligne de tâche.
  return (
    // article représente une tâche indépendante.
    <article className="ligne-tache">
      {/* Zone principale contenant les informations. */}
      <div className="contenu-tache">
        {/* Zone contenant les badges. */}
        <div className="badges-tache">
          {/*
           * Badge du statut.
           * La classe CSS dépend du statut actuel.
           * Exemple : statut-en_cours.
           */}
          <span
            className={`badge-statut statut-${tache.statut}`}
          >
            {
              // Cherche le texte correspondant au statut.
              nomsStatuts[tache.statut] ||
                // Utilise la valeur d’origine si aucune
                // correspondance n’est trouvée.
                tache.statut
            }
          </span>

          {/*
           * Badge de la priorité.
           * La classe CSS dépend de la priorité actuelle.
           * Exemple : priorite-haute.
           */}
          <span
            className={`badge-priorite priorite-${tache.priorite}`}
          >
            {/* Texte affiché avant la priorité. */}
            Priorité :{" "}

            {
              // Cherche le texte correspondant à la priorité.
              nomsPriorites[tache.priorite] ||
                // Utilise la valeur d’origine si elle
                // n’existe pas dans nomsPriorites.
                tache.priorite
            }
          </span>
        </div>

        {/* Affiche le titre de la tâche. */}
        <h3>{tache.titre}</h3>

        {/* Affiche la description de la tâche. */}
        <p>
          {
            // Utilise la description lorsqu’elle existe.
            tache.description ||
              // Affiche ce texte lorsque la description est vide.
              "Aucune description disponible."
          }
        </p>

        {/* Zone contenant les différentes dates. */}
        <div className="dates-tache">
          {/* Affiche la date d’échéance. */}
          <span>
            {/* Libellé de la date d’échéance. */}
            Échéance :{" "}

            {/* Met la date en évidence. */}
            <strong>
              {
                // Affiche l’échéance si elle existe.
                tache.echeance ||
                  // Texte utilisé lorsque la date est absente.
                  "Non indiquée"
              }
            </strong>
          </span>

          {/* Affiche la date de dernière modification. */}
          <span>
            {/* Libellé de la dernière modification. */}
            Modifiée le :{" "}

            {/* Met la date en évidence. */}
            <strong>
              {
                // Affiche modifieLe si cette date existe.
                tache.modifieLe ||
                  // Texte affiché lorsque la date est absente.
                  "Non indiquée"
              }
            </strong>
          </span>
        </div>
      </div>

      {/* Zone contenant les boutons d’action. */}
      <div className="actions-tache">
        {/*
         * Bouton permettant de consulter
         * toutes les informations de la tâche.
         */}
        <button
          type="button"
          className="bouton-detail"
          onClick={() => onVoir(tache)}
        >
          {/* Texte visible du bouton. */}
          Voir le détail
        </button>

        {/*
         * Bouton permettant de passer rapidement
         * au prochain statut.
         */}
        <button
          type="button"
          className="bouton-statut"
          onClick={() =>
            onChangerStatut(
              // Envoie la tâche sélectionnée.
              tache,

              // Envoie le prochain statut calculé.
              statutSuivant
            )
          }
        >
          {/* Texte placé avant le prochain statut. */}
          Passer à :{" "}

          {
            // Transforme le prochain statut
            // en texte lisible.
            nomsStatuts[statutSuivant]
          }
        </button>

        {/*
         * Bouton permettant d’ouvrir
         * le formulaire de modification.
         */}
        <button
          type="button"
          className="bouton-modifier"
          onClick={() => onModifier(tache)}
        >
          {/* Texte visible du bouton. */}
          Modifier
        </button>

        {/* Bouton permettant de supprimer la tâche. */}
        <button
          type="button"
          className="bouton-supprimer"
          onClick={() => onSupprimer(tache)}
        >
          {/* Texte visible du bouton. */}
          Supprimer
        </button>
      </div>
    </article>
  );
}

// Rend le composant disponible dans les autres fichiers.
export default LigneTache;