/*
 * Calcule les statistiques générales
 * de toutes les tâches reçues.
 */
export function calculerStatistiques(
  // Tableau contenant les tâches à analyser.
  taches
) {
  // Récupère le nombre total de tâches.
  const total = taches.length;

  /*
   * Compte les tâches qui possèdent
   * le statut a_faire.
   */
  const aFaire = taches.filter(
    // Examine chaque tâche du tableau.
    (tache) =>
      // Conserve uniquement les tâches à faire.
      tache.statut === "a_faire"
  ).length; // Compte les tâches conservées.

  /*
   * Compte les tâches qui possèdent
   * le statut en_cours.
   */
  const enCours = taches.filter(
    // Examine chaque tâche.
    (tache) =>
      // Conserve uniquement les tâches en cours.
      tache.statut === "en_cours"
  ).length; // Récupère le nombre de résultats.

  /*
   * Compte les tâches qui possèdent
   * le statut terminee.
   */
  const terminees = taches.filter(
    // Examine chaque tâche.
    (tache) =>
      // Conserve uniquement les tâches terminées.
      tache.statut === "terminee"
  ).length; // Compte les tâches terminées.

  /*
   * Calcule le pourcentage global
   * des tâches terminées.
   */
  const pourcentageTermine =
    // Vérifie si le tableau ne contient aucune tâche.
    total === 0
      // Retourne 0 pour éviter une division par zéro.
      ? 0
      // Sinon, calcule le pourcentage.
      : Math.round(
          // Divise les tâches terminées par le total,
          // puis multiplie le résultat par 100.
          (terminees / total) * 100
        );

  /*
   * Retourne toutes les statistiques
   * dans un seul objet.
   */
  return {
    // Nombre total de tâches.
    total,

    // Nombre de tâches à faire.
    aFaire,

    // Nombre de tâches en cours.
    enCours,

    // Nombre de tâches terminées.
    terminees,

    // Pourcentage des tâches terminées.
    pourcentageTermine,
  };
}

/*
 * Calcule la progression d’un projet précis.
 */
export function calculerAvancementProjet(
  // Objet contenant les informations du projet.
  projet,

  // Tableau contenant toutes les tâches.
  taches
) {
  /*
   * Sélectionne uniquement les tâches
   * qui appartiennent au projet reçu.
   */
  const tachesProjet = taches.filter(
    // Examine chaque tâche du tableau.
    (tache) =>
      /*
       * Compare projetId de la tâche
       * avec id du projet.
       *
       * String évite une différence
       * entre un nombre 1 et un texte "1".
       */
      String(tache.projetId) ===
      String(projet.id)
  );

  // Compte toutes les tâches du projet.
  const nombreTotal =
    tachesProjet.length;

  /*
   * Sélectionne puis compte
   * les tâches terminées du projet.
   */
  const nombreTerminees =
    tachesProjet.filter(
      // Examine chaque tâche du projet.
      (tache) =>
        // Conserve les tâches terminées.
        tache.statut === "terminee"
    ).length;

  /*
   * Calcule le pourcentage d’avancement
   * du projet.
   */
  const pourcentage =
    // Vérifie si le projet ne contient aucune tâche.
    nombreTotal === 0
      // Retourne 0 pour éviter une division par zéro.
      ? 0
      // Sinon, calcule le pourcentage terminé.
      : Math.round(
          // Divise les tâches terminées par le total
          // avant de multiplier par 100.
          (nombreTerminees / nombreTotal) *
            100
        );

  /*
   * Retourne le projet accompagné
   * de ses informations d’avancement.
   */
  return {
    /*
     * Copie toutes les propriétés du projet :
     * id, nom, description, couleur, etc.
     */
    ...projet,

    // Ajoute le nombre total de tâches.
    nombreTaches: nombreTotal,

    // Ajoute le nombre de tâches terminées.
    nombreTerminees,

    // Ajoute le pourcentage d’avancement.
    pourcentage,
  };
}

/*
 * Récupère les tâches non terminées
 * qui doivent être traitées en priorité.
 */
export function obtenirTachesUrgentes(
  // Tableau contenant les tâches.
  taches,

  /*
   * Nombre maximum de tâches à retourner.
   * La valeur par défaut est 5.
   */
  limite = 5
) {
  /*
   * Retourne directement le résultat
   * du filtrage, du tri et de la limitation.
   */
  return [
    /*
     * Crée une copie du tableau.
     *
     * Cela évite que sort() modifie
     * le tableau original de React.
     */
    ...taches,
  ]
    /*
     * Retire les tâches déjà terminées.
     */
    .filter(
      // Examine chaque tâche.
      (tache) =>
        // Conserve les tâches non terminées.
        tache.statut !== "terminee"
    )

    /*
     * Trie les tâches d’abord par priorité,
     * puis par date d’échéance.
     */
    .sort(
      (
        // Première tâche à comparer.
        premiereTache,

        // Deuxième tâche à comparer.
        deuxiemeTache
      ) => {
        /*
         * Associe chaque priorité
         * à une valeur numérique.
         *
         * Plus la valeur est petite,
         * plus la priorité est importante.
         */
        const priorites = {
          // La priorité haute passe en premier.
          haute: 1,

          // La priorité moyenne passe ensuite.
          moyenne: 2,

          // La priorité basse passe en dernier.
          basse: 3,
        };

        /*
         * Compare les valeurs numériques
         * des deux priorités.
         */
        const comparaisonPriorite =
          // Valeur de la première priorité.
          priorites[
            premiereTache.priorite
          ] -
          // Valeur de la deuxième priorité.
          priorites[
            deuxiemeTache.priorite
          ];

        /*
         * Vérifie si les deux tâches
         * ont des priorités différentes.
         */
        if (comparaisonPriorite !== 0) {
          /*
           * Retourne la comparaison.
           *
           * Une valeur négative place la première
           * tâche avant la deuxième.
           */
          return comparaisonPriorite;
        }

        /*
         * Si les priorités sont identiques,
         * compare les dates d’échéance.
         */
        return (
          // Convertit la première échéance en date.
          new Date(
            premiereTache.echeance
          ) -
          // Convertit la deuxième échéance en date.
          new Date(
            deuxiemeTache.echeance
          )
        );
      }
    )

    /*
     * Conserve uniquement le nombre
     * de tâches demandé par limite.
     */
    .slice(
      // Commence au premier élément.
      0,

      // Termine au nombre maximum demandé.
      limite
    );
}