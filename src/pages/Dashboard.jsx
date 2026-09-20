// Importe les hooks nécessaires depuis React.
import {
  // useEffect permet de charger les données après le rendu.
  useEffect,

  // useState permet de gérer les états du Dashboard.
  useState,
} from "react";

// Importe Link pour naviguer sans recharger l’application.
import { Link } from "react-router-dom";

// Importe le contexte contenant l’utilisateur connecté.
import { useAuth } from "../context/AuthContext";

// Importe la fonction qui récupère les données du Dashboard.
import {
  obtenirDonneesDashboard,
} from "../api/dashboard";

// Importe les fonctions utilisées pour calculer les statistiques.
import {
  // Calcule l’avancement d’un projet.
  calculerAvancementProjet,

  // Calcule les statistiques générales.
  calculerStatistiques,

  // Récupère les tâches les plus urgentes.
  obtenirTachesUrgentes,
} from "../utils/statistiques";

/*
 * Correspondance entre les valeurs techniques
 * des statuts et les textes affichés.
 */
const nomsStatuts = {
  // Texte correspondant au statut a_faire.
  a_faire: "À faire",

  // Texte correspondant au statut en_cours.
  en_cours: "En cours",

  // Texte correspondant au statut terminee.
  terminee: "Terminée",
};

/*
 * Correspondance entre les valeurs techniques
 * des priorités et les textes affichés.
 */
const nomsPriorites = {
  // Texte correspondant à la priorité basse.
  basse: "Basse",

  // Texte correspondant à la priorité moyenne.
  moyenne: "Moyenne",

  // Texte correspondant à la priorité haute.
  haute: "Haute",
};

/*
 * Composant principal du tableau de bord.
 */
function Dashboard() {
  // Récupère l’utilisateur connecté depuis AuthContext.
  const { utilisateur } = useAuth();

  // Récupère son identifiant en toute sécurité.
  const utilisateurId = utilisateur?.id;

  // État contenant les projets de l’utilisateur.
  const [
    projets,
    setProjets,
  ] = useState([]);

  // État contenant les tâches de ses projets.
  const [
    taches,
    setTaches,
  ] = useState([]);

  // État indiquant si les données sont en chargement.
  const [
    chargement,
    setChargement,
  ] = useState(true);

  // État contenant un éventuel message d’erreur.
  const [
    erreur,
    setErreur,
  ] = useState("");

  /*
   * Compteur permettant de relancer useEffect
   * lorsque l’utilisateur clique sur Réessayer.
   */
  const [
    rechargement,
    setRechargement,
  ] = useState(0);

  /*
   * Charge les projets et les tâches
   * appartenant à l’utilisateur connecté.
   */
  useEffect(() => {
    // Vérifie si l’identifiant de l’utilisateur existe.
    if (!utilisateurId) {
      // N’exécute aucune requête sans utilisateur.
      return undefined;
    }

    /*
     * Indique si le composant est toujours présent.
     * Cela évite une modification d’état après sa fermeture.
     */
    let composantActif = true;

    // Appelle l’API du tableau de bord.
    obtenirDonneesDashboard(
      // Transmet l’identifiant de l’utilisateur.
      utilisateurId
    )
      // then est exécuté si la requête réussit.
      .then((donnees) => {
        // Vérifie si la page est toujours ouverte.
        if (!composantActif) {
          // Arrête le traitement si elle est fermée.
          return;
        }

        // Enregistre les projets reçus.
        setProjets(donnees.projets);

        // Enregistre les tâches reçues.
        setTaches(donnees.taches);

        // Efface un éventuel ancien message d’erreur.
        setErreur("");
      })

      // catch est exécuté si la requête échoue.
      .catch((erreurRequete) => {
        // Vérifie si la page est toujours ouverte.
        if (!composantActif) {
          // Arrête le traitement si elle est fermée.
          return;
        }

        // Enregistre un message d’erreur.
        setErreur(
          // Utilise le message reçu s’il existe.
          erreurRequete.message ||
            // Utilise ce message par défaut.
            "Impossible de charger le tableau de bord."
        );
      })

      // finally est toujours exécuté à la fin.
      .finally(() => {
        // Vérifie que le composant est toujours actif.
        if (composantActif) {
          // Indique que le chargement est terminé.
          setChargement(false);
        }
      });

    /*
     * Fonction de nettoyage exécutée lorsque la page
     * est fermée ou que ses dépendances changent.
     */
    return () => {
      // Indique que les états ne doivent plus être modifiés.
      composantActif = false;
    };

    /*
     * Relance l’effet si utilisateurId
     * ou rechargement change.
     */
  }, [utilisateurId, rechargement]);

  /*
   * Calcule les statistiques générales
   * à partir de toutes les tâches reçues.
   */
  const statistiques =
    calculerStatistiques(taches);

  /*
   * Ajoute les informations d’avancement
   * à chaque projet de l’utilisateur.
   */
  const projetsAvecAvancement = projets.map(
    // Examine chaque projet.
    (projet) =>
      // Calcule son avancement avec ses tâches.
      calculerAvancementProjet(
        projet,
        taches
      )
  );

  /*
   * Récupère au maximum cinq tâches urgentes.
   */
  const tachesUrgentes =
    obtenirTachesUrgentes(
      // Tableau contenant toutes les tâches.
      taches,

      // Nombre maximum de tâches à retourner.
      5
    );

  /*
   * Retrouve le nom du projet auquel
   * une tâche appartient.
   */
  const obtenirNomProjet = (
    // Identifiant du projet recherché.
    projetId
  ) => {
    // Recherche le projet dans le tableau.
    const projet = projets.find(
      // Examine chaque projet.
      (element) =>
        // Compare les identifiants sous forme de texte.
        String(element.id) ===
        String(projetId)
    );

    // Retourne le nom ou un texte par défaut.
    return projet?.nom || "Projet inconnu";
  };

  /*
   * Relance manuellement le chargement
   * lorsque l’utilisateur clique sur Réessayer.
   */
  const reessayerChargement = () => {
    // Réactive l’état de chargement.
    setChargement(true);

    // Efface l’ancien message d’erreur.
    setErreur("");

    // Augmente le compteur pour relancer useEffect.
    setRechargement(
      // Reçoit la valeur précédente.
      (ancienneValeur) =>
        // Ajoute 1 à cette valeur.
        ancienneValeur + 1
    );
  };

  /*
   * Affiche cet écran tant que les données
   * sont en cours de chargement.
   */
  if (chargement) {
    return (
      // Conteneur de l’état de chargement.
      <div className="etat-page">
        {/* Message affiché pendant la requête. */}
        <p>
          Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  // Retourne le contenu principal du Dashboard.
  return (
    // Section principale du tableau de bord.
    <section className="page-dashboard">
      {/* En-tête contenant le message d’accueil. */}
      <header className="entete-page">
        {/* Groupe contenant les textes d’introduction. */}
        <div>
          {/* Petit titre de la page. */}
          <p className="petit-titre">
            Tableau de bord
          </p>

          {/* Message de bienvenue personnalisé. */}
          <h1>
            {/* Texte placé avant le nom. */}
            Bonjour,{" "}

            {
              // Affiche le nom de l’utilisateur s’il existe.
              utilisateur?.nom ||
                // Texte utilisé si le nom est absent.
                "Utilisateur"
            }
          </h1>

          {/* Description du contenu de la page. */}
          <p>
            Voici un aperçu des activités du
            département RH.
          </p>
        </div>

        {/* Lien permettant d’ouvrir les projets. */}
        <Link
          to="/projets"
          className="bouton-lien-principal"
        >
          Voir les projets
        </Link>
      </header>

      {/*
       * Affiche ce bloc seulement lorsqu’un message
       * d’erreur existe.
       */}
      {erreur && (
        // Conteneur du message d’erreur.
        <div
          className="message-erreur"
          role="alert"
        >
          {/* Affiche le texte de l’erreur. */}
          <span>{erreur}</span>

          {/* Bouton qui relance le chargement. */}
          <button
            type="button"
            className="bouton-reessayer"
            onClick={reessayerChargement}
          >
            Réessayer
          </button>
        </div>
      )}

      {/*
       * Affiche les statistiques seulement
       * lorsqu’il n’existe aucune erreur.
       */}
      {!erreur && (
        // Fragment regroupant plusieurs éléments.
        <>
          {/* Grille des cartes statistiques. */}
          <div className="cartes-statistiques">
            {/* Carte affichant le nombre de projets. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Projets RH</span>

              {/* Nombre de projets de l’utilisateur. */}
              <strong>
                {projets.length}
              </strong>
            </article>

            {/* Carte affichant le total des tâches. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Tâches totales</span>

              {/* Nombre total de tâches. */}
              <strong>
                {statistiques.total}
              </strong>
            </article>

            {/* Carte affichant les tâches à faire. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>À faire</span>

              {/* Nombre de tâches qui n’ont pas commencé. */}
              <strong>
                {statistiques.aFaire}
              </strong>
            </article>

            {/* Carte affichant les tâches en cours. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>En cours</span>

              {/* Nombre de tâches en traitement. */}
              <strong>
                {statistiques.enCours}
              </strong>
            </article>

            {/* Carte affichant les tâches terminées. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Terminées</span>

              {/* Nombre de tâches terminées. */}
              <strong>
                {statistiques.terminees}
              </strong>
            </article>

            {/* Carte affichant l’avancement global. */}
            <article
              className="carte-statistique carte-pourcentage"
            >
              {/* Nom de la statistique. */}
              <span>Avancement global</span>

              {/* Pourcentage total des tâches terminées. */}
              <strong>
                {statistiques.pourcentageTermine} %
              </strong>

              {/* Conteneur extérieur de la progression. */}
              <div className="barre-progression">
                {/*
                 * Barre intérieure dont la largeur
                 * dépend du pourcentage terminé.
                 */}
                <div
                  className="progression progression-globale"
                  style={{
                    width:
                      `${statistiques.pourcentageTermine}%`,
                  }}
                />
              </div>
            </article>
          </div>

          {/* Zone contenant les deux grands blocs du Dashboard. */}
          <div className="sections-dashboard">
            {/* Bloc présentant l’avancement des projets. */}
            <section className="bloc-dashboard">
              {/* En-tête du bloc. */}
              <div className="titre-bloc-dashboard">
                {/* Groupe contenant le titre et sa description. */}
                <div>
                  {/* Titre de la section. */}
                  <h2>
                    Avancement des projets
                  </h2>

                  {/* Explication du calcul. */}
                  <p>
                    Progression calculée à partir
                    des tâches terminées.
                  </p>
                </div>

                {/* Lien vers la liste complète des projets. */}
                <Link to="/projets">
                  Tous les projets
                </Link>
              </div>

              {/*
               * Vérifie si l’utilisateur ne possède
               * encore aucun projet.
               */}
              {projetsAvecAvancement.length === 0 ? (
                // Affichage lorsque la liste est vide.
                <div className="etat-dashboard">
                  {/* Message d’état vide. */}
                  <p>
                    Aucun projet disponible.
                  </p>

                  {/* Lien permettant de créer un projet. */}
                  <Link
                    to="/projets"
                    className="bouton-lien-principal"
                  >
                    Créer un projet
                  </Link>
                </div>
              ) : (
                // Affichage lorsque des projets existent.
                <div className="liste-avancements">
                  {/*
                   * Parcourt tous les projets
                   * avec leurs statistiques.
                   */}
                  {projetsAvecAvancement.map(
                    // Reçoit un projet à chaque passage.
                    (projet) => (
                      // Représente une ligne d’avancement.
                      <article
                        // Aide React à identifier la ligne.
                        key={projet.id}
                        className="ligne-avancement"
                      >
                        {/* Informations principales du projet. */}
                        <div className="information-projet-dashboard">
                          {/*
                           * Petit indicateur affichant
                           * la couleur du projet.
                           */}
                          <div
                            className="indicateur-couleur"
                            style={{
                              backgroundColor:
                                // Utilise la couleur choisie.
                                projet.couleur ||
                                // Utilise le bleu par défaut.
                                "#2563eb",
                            }}
                          />

                          {/* Groupe contenant le nom et les nombres. */}
                          <div>
                            {/* Lien vers le détail du projet. */}
                            <Link
                              to={`/projets/${projet.id}`}
                            >
                              {/* Affiche le nom du projet. */}
                              {projet.nom}
                            </Link>

                            {/* Résumé des tâches terminées. */}
                            <span>
                              {/* Nombre de tâches terminées. */}
                              {
                                projet.nombreTerminees
                              }{" "}

                              {/* Texte de liaison. */}
                              sur{" "}

                              {/* Nombre total de tâches. */}
                              {projet.nombreTaches}{" "}

                              {/* Mot affiché au singulier. */}
                              terminée

                              {
                                // Ajoute s si le total est différent de 1.
                                projet.nombreTaches !== 1
                                  ? "s"
                                  : ""
                              }
                            </span>
                          </div>
                        </div>

                        {/* Zone contenant la progression du projet. */}
                        <div className="progression-projet-dashboard">
                          {/* Pourcentage d’avancement. */}
                          <strong>
                            {projet.pourcentage} %
                          </strong>

                          {/* Conteneur extérieur de la progression. */}
                          <div className="barre-progression">
                            {/* Partie colorée de la progression. */}
                            <div
                              className="progression"
                              style={{
                                // Largeur calculée du projet.
                                width:
                                  `${projet.pourcentage}%`,

                                // Couleur de la barre.
                                backgroundColor:
                                  projet.couleur ||
                                  "#2563eb",
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Bloc contenant les tâches urgentes. */}
            <section className="bloc-dashboard">
              {/* En-tête du bloc. */}
              <div className="titre-bloc-dashboard">
                {/* Groupe du titre et de sa description. */}
                <div>
                  {/* Titre de la section. */}
                  <h2>Tâches urgentes</h2>

                  {/* Explication du classement. */}
                  <p>
                    Tâches non terminées classées
                    par priorité et échéance.
                  </p>
                </div>
              </div>

              {/*
               * Vérifie si aucune tâche urgente
               * n’a été trouvée.
               */}
              {tachesUrgentes.length === 0 ? (
                // Affichage lorsqu’il n’existe aucune urgence.
                <div className="etat-dashboard">
                  {/* Message d’état vide. */}
                  <p>
                    Aucune tâche urgente.
                  </p>
                </div>
              ) : (
                // Affichage lorsque des tâches urgentes existent.
                <div className="liste-urgences">
                  {/* Parcourt toutes les tâches urgentes. */}
                  {tachesUrgentes.map(
                    // Reçoit une tâche à chaque passage.
                    (tache) => (
                      // Représente une tâche urgente.
                      <article
                        // Aide React à identifier la tâche.
                        key={tache.id}
                        className="tache-urgente"
                      >
                        {/* Groupe du titre et du projet. */}
                        <div>
                          {/* Lien vers le projet de la tâche. */}
                          <Link
                            to={`/projets/${tache.projetId}`}
                            className="titre-tache-urgente"
                          >
                            {/* Affiche le titre de la tâche. */}
                            {tache.titre}
                          </Link>

                          {/* Affiche le nom de son projet. */}
                          <p>
                            {
                              obtenirNomProjet(
                                tache.projetId
                              )
                            }
                          </p>
                        </div>

                        {/* Zone contenant priorité, statut et date. */}
                        <div className="informations-urgence">
                          {/* Badge de la priorité. */}
                          <span
                            className={`badge-priorite priorite-${tache.priorite}`}
                          >
                            {
                              // Affiche le nom lisible de la priorité.
                              nomsPriorites[
                                tache.priorite
                              ] ||
                                // Utilise la valeur brute par défaut.
                                tache.priorite
                            }
                          </span>

                          {/* Badge du statut. */}
                          <span
                            className={`badge-statut statut-${tache.statut}`}
                          >
                            {
                              // Affiche le nom lisible du statut.
                              nomsStatuts[
                                tache.statut
                              ] ||
                                // Utilise la valeur brute par défaut.
                                tache.statut
                            }
                          </span>

                          {/* Affiche l’échéance de la tâche. */}
                          <span className="date-urgence">
                            {/* Libellé de la date. */}
                            Échéance :{" "}

                            {
                              // Affiche la date si elle existe.
                              tache.echeance ||
                                // Texte affiché si elle est absente.
                                "Non indiquée"
                            }
                          </span>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}

// Rend Dashboard disponible dans App.jsx.
export default Dashboard;