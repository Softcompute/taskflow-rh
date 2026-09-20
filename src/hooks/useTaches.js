// Importe les hooks nécessaires depuis React.
import {
  // useCallback mémorise une fonction entre les rendus.
  useCallback,

  // useEffect exécute une opération après le rendu.
  useEffect,

  // useState permet de gérer les états du hook.
  useState,
} from "react";

// Importe la fonction qui récupère les tâches d’un projet.
import {
  obtenirTachesProjet,
} from "../api/taches";

/*
 * Hook personnalisé chargé de gérer les tâches
 * associées à un projet.
 */
function useTaches(
  // Reçoit l’identifiant du projet sélectionné.
  projetId
) {
  /*
   * État qui contient la liste des tâches.
   *
   * La valeur initiale est un tableau vide.
   */
  const [
    // Tableau actuel des tâches.
    taches,

    // Fonction permettant de modifier ce tableau.
    setTaches,
  ] = useState([]);

  /*
   * État qui indique si les tâches
   * sont actuellement en cours de chargement.
   */
  const [
    // Valeur actuelle du chargement.
    chargementTaches,

    // Fonction permettant de modifier le chargement.
    setChargementTaches,
  ] = useState(true);

  /*
   * État qui contient un éventuel message d’erreur.
   */
  const [
    // Message d’erreur actuel.
    erreurTaches,

    // Fonction permettant de modifier le message.
    setErreurTaches,
  ] = useState("");

  /*
   * Cette fonction permet de recharger les tâches
   * après une création, une modification
   * ou une suppression.
   */
  const chargerTaches = useCallback(
    // Déclare une fonction asynchrone mémorisée.
    async () => {
      /*
       * Vérifie si aucun identifiant de projet
       * n’a été fourni au hook.
       */
      if (!projetId) {
        // Réinitialise le tableau des tâches.
        setTaches([]);

        // Indique que le chargement est terminé.
        setChargementTaches(false);

        // Arrête immédiatement la fonction.
        return;
      }

      /*
       * Essaie de récupérer les tâches du projet.
       */
      try {
        // Indique que le chargement commence.
        setChargementTaches(true);

        // Efface l’ancien message d’erreur.
        setErreurTaches("");

        /*
         * Appelle l’API et attend la réponse
         * contenant les tâches du projet.
         */
        const donnees =
          await obtenirTachesProjet(
            // Transmet l’identifiant du projet.
            projetId
          );

        // Enregistre les tâches reçues dans l’état.
        setTaches(donnees);
      } catch (erreur) {
        /*
         * Ce bloc est exécuté lorsque la requête échoue.
         */

        // Enregistre un message d’erreur dans l’état.
        setErreurTaches(
          // Utilise d’abord le message de l’erreur reçue.
          erreur.message ||
            // Utilise ce texte si aucun message n’existe.
            "Impossible de charger les tâches."
        );
      } finally {
        /*
         * Ce bloc est toujours exécuté,
         * que la requête réussisse ou échoue.
         */

        // Indique que le chargement est terminé.
        setChargementTaches(false);
      }
    },

    /*
     * React recrée chargerTaches uniquement
     * lorsque projetId change.
     */
    [projetId]
  );

  /*
   * Effectue le chargement initial des tâches
   * et recommence lorsque projetId change.
   */
  useEffect(() => {
    /*
     * Vérifie si l’identifiant du projet existe.
     */
    if (!projetId) {
      /*
       * Ne lance aucune requête.
       *
       * undefined signifie qu’aucune fonction
       * de nettoyage n’est nécessaire.
       */
      return undefined;
    }

    /*
     * Cette variable indique si le composant
     * utilisant le hook est toujours actif.
     */
    let composantActif = true;

    /*
     * Appelle la fonction API pour récupérer
     * les tâches du projet.
     */
    obtenirTachesProjet(
      // Transmet l’identifiant du projet.
      projetId
    )
      /*
       * then est exécuté lorsque la requête réussit.
       */
      .then((donnees) => {
        /*
         * Vérifie si le composant a déjà été démonté.
         */
        if (!composantActif) {
          // Arrête cette partie du traitement.
          return;
        }

        // Enregistre les tâches reçues.
        setTaches(donnees);

        // Efface un éventuel ancien message d’erreur.
        setErreurTaches("");
      })

      /*
       * catch est exécuté lorsque la requête échoue.
       */
      .catch((erreur) => {
        /*
         * Vérifie si le composant est toujours actif.
         */
        if (!composantActif) {
          // Arrête le traitement si le composant est démonté.
          return;
        }

        // Enregistre le message d’erreur.
        setErreurTaches(
          // Utilise le message de l’erreur lorsqu’il existe.
          erreur.message ||
            // Message utilisé par défaut.
            "Impossible de charger les tâches."
        );
      })

      /*
       * finally est toujours exécuté à la fin
       * de la requête.
       */
      .finally(() => {
        /*
         * Vérifie que le composant est encore actif
         * avant de modifier son état.
         */
        if (composantActif) {
          // Indique que le chargement est terminé.
          setChargementTaches(false);
        }
      });

    /*
     * Retourne la fonction de nettoyage de useEffect.
     *
     * Cette fonction est exécutée lorsque le composant
     * est démonté ou lorsque projetId change.
     */
    return () => {
      /*
       * Empêche les mises à jour d’état après
       * le démontage du composant.
       */
      composantActif = false;
    };

    /*
     * Relance cet effet uniquement
     * lorsque projetId change.
     */
  }, [projetId]);

  /*
   * Retourne les données et les fonctions
   * qui seront utilisées par DetailProjet.jsx.
   */
  return {
    // Liste actuelle des tâches.
    taches,

    // Permet de modifier directement la liste des tâches.
    setTaches,

    // Indique si un chargement est en cours.
    chargementTaches,

    // Contient le message d’erreur actuel.
    erreurTaches,

    // Permet de modifier ou d’effacer l’erreur.
    setErreurTaches,

    // Permet de recharger manuellement les tâches.
    chargerTaches,
  };
}

// Rend le hook disponible dans les autres fichiers.
export default useTaches;