// Importe les hooks nÃ©cessaires depuis React.
import {
  // useEffect permet de charger les donnÃ©es aprÃ¨s le rendu.
  useEffect,

  // useState permet de gÃ©rer les Ã©tats du Dashboard.
  useState,
} from "react";

// Importe Link pour naviguer sans recharger lâ€™application.
import { Link } from "react-router-dom";

// Importe le contexte contenant lâ€™utilisateur connectÃ©.
import { useAuth } from "../hooks/useAuth";

// Importe la fonction qui rÃ©cupÃ¨re les donnÃ©es du Dashboard.
import {
  obtenirDonneesDashboard,
} from "../api/dashboard";

// Importe les fonctions utilisÃ©es pour calculer les statistiques.
import {
  // Calcule lâ€™avancement dâ€™un projet.
  calculerAvancementProjet,

  // Calcule les statistiques gÃ©nÃ©rales.
  calculerStatistiques,

  // RÃ©cupÃ¨re les tÃ¢ches les plus urgentes.
  obtenirTachesUrgentes,
} from "../utils/statistiques";

/*
 * Correspondance entre les valeurs techniques
 * des statuts et les textes affichÃ©s.
 */
const nomsStatuts = {
  // Texte correspondant au statut a_faire.
  a_faire: "Ã€ faire",

  // Texte correspondant au statut en_cours.
  en_cours: "En cours",

  // Texte correspondant au statut terminee.
  terminee: "TerminÃ©e",
};

/*
 * Correspondance entre les valeurs techniques
 * des prioritÃ©s et les textes affichÃ©s.
 */
const nomsPriorites = {
  // Texte correspondant Ã  la prioritÃ© basse.
  basse: "Basse",

  // Texte correspondant Ã  la prioritÃ© moyenne.
  moyenne: "Moyenne",

  // Texte correspondant Ã  la prioritÃ© haute.
  haute: "Haute",
};

/*
 * Composant principal du tableau de bord.
 */
function Dashboard() {
  // RÃ©cupÃ¨re lâ€™utilisateur connectÃ© depuis AuthContext.
  const { utilisateur } = useAuth();

  // RÃ©cupÃ¨re son identifiant en toute sÃ©curitÃ©.
  const utilisateurId = utilisateur?.id;

  // RÃ©cupÃ¨re le rÃ´le de lâ€™utilisateur connectÃ©.
  const roleUtilisateur = utilisateur?.role;

  // Ã‰tat contenant les projets de lâ€™utilisateur.
  const [
    projets,
    setProjets,
  ] = useState([]);

  // Ã‰tat contenant les tÃ¢ches de ses projets.
  const [
    taches,
    setTaches,
  ] = useState([]);

  // Ã‰tat indiquant si les donnÃ©es sont en chargement.
  const [
    chargement,
    setChargement,
  ] = useState(true);

  // Ã‰tat contenant un Ã©ventuel message dâ€™erreur.
  const [
    erreur,
    setErreur,
  ] = useState("");

  /*
   * Compteur permettant de relancer useEffect
   * lorsque lâ€™utilisateur clique sur RÃ©essayer.
   */
  const [
    rechargement,
    setRechargement,
  ] = useState(0);

  /*
   * Charge les projets et les tÃ¢ches
   * appartenant Ã  lâ€™utilisateur connectÃ©.
   */
  useEffect(() => {
    // VÃ©rifie si lâ€™identifiant de lâ€™utilisateur existe.
    if (!utilisateurId) {
      // Nâ€™exÃ©cute aucune requÃªte sans utilisateur.
      return undefined;
    }

    /*
     * Indique si le composant est toujours prÃ©sent.
     * Cela Ã©vite une modification dâ€™Ã©tat aprÃ¨s sa fermeture.
     */
    let composantActif = true;

    // Appelle lâ€™API du tableau de bord.
    obtenirDonneesDashboard(
      // Transmet lâ€™identifiant de lâ€™utilisateur.
      utilisateurId,

      /*
       * Transmet Ã©galement son rÃ´le afin que
       * le Responsable RH puisse voir tous les projets.
       */
      roleUtilisateur
    )
      // then est exÃ©cutÃ© si la requÃªte rÃ©ussit.
      .then((donnees) => {
        // VÃ©rifie si la page est toujours ouverte.
        if (!composantActif) {
          // ArrÃªte le traitement si elle est fermÃ©e.
          return;
        }

        // Enregistre les projets reÃ§us.
        setProjets(donnees.projets);

        // Enregistre les tÃ¢ches reÃ§ues.
        setTaches(donnees.taches);

        // Efface un Ã©ventuel ancien message dâ€™erreur.
        setErreur("");
      })

      // catch est exÃ©cutÃ© si la requÃªte Ã©choue.
      .catch((erreurRequete) => {
        // VÃ©rifie si la page est toujours ouverte.
        if (!composantActif) {
          // ArrÃªte le traitement si elle est fermÃ©e.
          return;
        }

        // Enregistre un message dâ€™erreur.
        setErreur(
          // Utilise le message reÃ§u sâ€™il existe.
          erreurRequete.message ||
            // Utilise ce message par dÃ©faut.
            "Impossible de charger le tableau de bord."
        );
      })

      // finally est toujours exÃ©cutÃ© Ã  la fin.
      .finally(() => {
        // VÃ©rifie que le composant est toujours actif.
        if (composantActif) {
          // Indique que le chargement est terminÃ©.
          setChargement(false);
        }
      });

    /*
     * Fonction de nettoyage exÃ©cutÃ©e lorsque la page
     * est fermÃ©e ou que ses dÃ©pendances changent.
     */
    return () => {
      // Indique que les Ã©tats ne doivent plus Ãªtre modifiÃ©s.
      composantActif = false;
    };

    /*
   * Relance lâ€™effet si lâ€™identifiant, le rÃ´le
   * ou le compteur de rechargement change.
   */
  }, [
    utilisateurId,
    roleUtilisateur,
    rechargement,
  ]);

  /*
   * Calcule les statistiques gÃ©nÃ©rales
   * Ã  partir de toutes les tÃ¢ches reÃ§ues.
   */
  const statistiques =
    calculerStatistiques(taches);

  /*
   * Ajoute les informations dâ€™avancement
   * Ã  chaque projet de lâ€™utilisateur.
   */
  const projetsAvecAvancement = projets.map(
    // Examine chaque projet.
    (projet) =>
      // Calcule son avancement avec ses tÃ¢ches.
      calculerAvancementProjet(
        projet,
        taches
      )
  );

  /*
   * RÃ©cupÃ¨re au maximum cinq tÃ¢ches urgentes.
   */
  const tachesUrgentes =
    obtenirTachesUrgentes(
      // Tableau contenant toutes les tÃ¢ches.
      taches,

      // Nombre maximum de tÃ¢ches Ã  retourner.
      5
    );

  /*
   * Retrouve le nom du projet auquel
   * une tÃ¢che appartient.
   */
  const obtenirNomProjet = (
    // Identifiant du projet recherchÃ©.
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

    // Retourne le nom ou un texte par dÃ©faut.
    return projet?.nom || "Projet inconnu";
  };

  /*
   * Relance manuellement le chargement
   * lorsque lâ€™utilisateur clique sur RÃ©essayer.
   */
  const reessayerChargement = () => {
    // RÃ©active lâ€™Ã©tat de chargement.
    setChargement(true);

    // Efface lâ€™ancien message dâ€™erreur.
    setErreur("");

    // Augmente le compteur pour relancer useEffect.
    setRechargement(
      // ReÃ§oit la valeur prÃ©cÃ©dente.
      (ancienneValeur) =>
        // Ajoute 1 Ã  cette valeur.
        ancienneValeur + 1
    );
  };

  /*
   * Affiche cet Ã©cran tant que les donnÃ©es
   * sont en cours de chargement.
   */
  if (chargement) {
    return (
      // Conteneur de lâ€™Ã©tat de chargement.
      <div className="etat-page">
        {/* Message affichÃ© pendant la requÃªte. */}
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
      {/* En-tÃªte contenant le message dâ€™accueil. */}
      <header className="entete-page">
        {/* Groupe contenant les textes dâ€™introduction. */}
        <div>
          {/* Petit titre de la page. */}
          <p className="petit-titre">
            Tableau de bord
          </p>

          {/* Message de bienvenue personnalisÃ©. */}
          <h1>
            {/* Texte placÃ© avant le nom. */}
            Bonjour,{" "}

            {
              // Affiche le nom de lâ€™utilisateur sâ€™il existe.
              utilisateur?.nom ||
                // Texte utilisÃ© si le nom est absent.
                "Utilisateur"
            }
          </h1>

          {/* Description du contenu de la page. */}
          <p>
            Voici un aperÃ§u des activitÃ©s du
            dÃ©partement RH.
          </p>
        </div>

        {/* Lien permettant dâ€™ouvrir les projets. */}
        <Link
          to="/projets"
          className="bouton-lien-principal"
        >
          Voir les projets
        </Link>
      </header>

      {/*
       * Affiche ce bloc seulement lorsquâ€™un message
       * dâ€™erreur existe.
       */}
      {erreur && (
        // Conteneur du message dâ€™erreur.
        <div
          className="message-erreur"
          role="alert"
        >
          {/* Affiche le texte de lâ€™erreur. */}
          <span>{erreur}</span>

          {/* Bouton qui relance le chargement. */}
          <button
            type="button"
            className="bouton-reessayer"
            onClick={reessayerChargement}
          >
            RÃ©essayer
          </button>
        </div>
      )}

      {/*
       * Affiche les statistiques seulement
       * lorsquâ€™il nâ€™existe aucune erreur.
       */}
      {!erreur && (
        // Fragment regroupant plusieurs Ã©lÃ©ments.
        <>
          {/* Grille des cartes statistiques. */}
          <div className="cartes-statistiques">
            {/* Carte affichant le nombre de projets. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Projets RH</span>

              {/* Nombre de projets de lâ€™utilisateur. */}
              <strong>
                {projets.length}
              </strong>
            </article>

            {/* Carte affichant le total des tÃ¢ches. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Tâches totales</span>

              {/* Nombre total de tÃ¢ches. */}
              <strong>
                {statistiques.total}
              </strong>
            </article>

            {/* Carte affichant les tÃ¢ches Ã  faire. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Ã€ faire</span>

              {/* Nombre de tÃ¢ches qui nâ€™ont pas commencÃ©. */}
              <strong>
                {statistiques.aFaire}
              </strong>
            </article>

            {/* Carte affichant les tÃ¢ches en cours. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>En cours</span>

              {/* Nombre de tÃ¢ches en traitement. */}
              <strong>
                {statistiques.enCours}
              </strong>
            </article>

            {/* Carte affichant les tÃ¢ches terminÃ©es. */}
            <article className="carte-statistique">
              {/* Nom de la statistique. */}
              <span>Terminees</span>

              {/* Nombre de tÃ¢ches terminÃ©es. */}
              <strong>
                {statistiques.terminees}
              </strong>
            </article>

            {/* Carte affichant lâ€™avancement global. */}
            <article
              className="carte-statistique carte-pourcentage"
            >
              {/* Nom de la statistique. */}
              <span>Avancement global</span>

              {/* Pourcentage total des tÃ¢ches terminÃ©es. */}
              <strong>
                {statistiques.pourcentageTermine} %
              </strong>

              {/* Conteneur extÃ©rieur de la progression. */}
              <div className="barre-progression">
                {/*
                 * Barre intÃ©rieure dont la largeur
                 * dÃ©pend du pourcentage terminÃ©.
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
            {/* Bloc prÃ©sentant lâ€™avancement des projets. */}
            <section className="bloc-dashboard">
              {/* En-tÃªte du bloc. */}
              <div className="titre-bloc-dashboard">
                {/* Groupe contenant le titre et sa description. */}
                <div>
                  {/* Titre de la section. */}
                  <h2>
                    Avancement des projets
                  </h2>

                  {/* Explication du calcul. */}
                  <p>
                    Progression calculÃ©e Ã  partir
                    des tÃ¢ches terminÃ©es.
                  </p>
                </div>

                {/* Lien vers la liste complÃ¨te des projets. */}
                <Link to="/projets">
                  Tous les projets
                </Link>
              </div>

              {/*
               * VÃ©rifie si lâ€™utilisateur ne possÃ¨de
               * encore aucun projet.
               */}
              {projetsAvecAvancement.length === 0 ? (
                // Affichage lorsque la liste est vide.
                <div className="etat-dashboard">
                  {/* Message dâ€™Ã©tat vide. */}
                  <p>
                    Aucun projet disponible.
                  </p>

                  {/* Lien permettant de crÃ©er un projet. */}
                  <Link
                    to="/projets"
                    className="bouton-lien-principal"
                  >
                    CrÃ©er un projet
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
                    // ReÃ§oit un projet Ã  chaque passage.
                    (projet) => (
                      // ReprÃ©sente une ligne dâ€™avancement.
                      <article
                        // Aide React Ã  identifier la ligne.
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
                                // Utilise le bleu par dÃ©faut.
                                "#2563eb",
                            }}
                          />

                          {/* Groupe contenant le nom et les nombres. */}
                          <div>
                            {/* Lien vers le dÃ©tail du projet. */}
                            <Link
                              to={`/projets/${projet.id}`}
                            >
                              {/* Affiche le nom du projet. */}
                              {projet.nom}
                            </Link>

                            {/* RÃ©sumÃ© des tÃ¢ches terminÃ©es. */}
                            <span>
                              {/* Nombre de tÃ¢ches terminÃ©es. */}
                              {
                                projet.nombreTerminees
                              }{" "}

                              {/* Texte de liaison. */}
                              sur{" "}

                              {/* Nombre total de tÃ¢ches. */}
                              {projet.nombreTaches}{" "}

                              {/* Mot affichÃ© au singulier. */}
                              terminee

                              {
                                // Ajoute s si le total est diffÃ©rent de 1.
                                projet.nombreTaches !== 1
                                  ? "s"
                                  : ""
                              }
                            </span>
                          </div>
                        </div>

                        {/* Zone contenant la progression du projet. */}
                        <div className="progression-projet-dashboard">
                          {/* Pourcentage dâ€™avancement. */}
                          <strong>
                            {projet.pourcentage} %
                          </strong>

                          {/* Conteneur extÃ©rieur de la progression. */}
                          <div className="barre-progression">
                            {/* Partie colorÃ©e de la progression. */}
                            <div
                              className="progression"
                              style={{
                                // Largeur calculÃ©e du projet.
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

            {/* Bloc contenant les tÃ¢ches urgentes. */}
            <section className="bloc-dashboard">
              {/* En-tÃªte du bloc. */}
              <div className="titre-bloc-dashboard">
                {/* Groupe du titre et de sa description. */}
                <div>
                  {/* Titre de la section. */}
                  <h2>Tâches urgentes</h2>

                  {/* Explication du classement. */}
                  <p>
                    Tâches non termines classes
                    par prioritÃ© et Ã©chÃ©ance.
                  </p>
                </div>
              </div>

              {/*
               * VÃ©rifie si aucune tÃ¢che urgente
               * nâ€™a Ã©tÃ© trouvÃ©e.
               */}
              {tachesUrgentes.length === 0 ? (
                // Affichage lorsquâ€™il nâ€™existe aucune urgence.
                <div className="etat-dashboard">
                  {/* Message dâ€™Ã©tat vide. */}
                  <p>
                    Aucune tÃ¢che urgente.
                  </p>
                </div>
              ) : (
                // Affichage lorsque des tÃ¢ches urgentes existent.
                <div className="liste-urgences">
                  {/* Parcourt toutes les tÃ¢ches urgentes. */}
                  {tachesUrgentes.map(
                    // ReÃ§oit une tÃ¢che Ã  chaque passage.
                    (tache) => (
                      // ReprÃ©sente une tÃ¢che urgente.
                      <article
                        // Aide React Ã  identifier la tÃ¢che.
                        key={tache.id}
                        className="tache-urgente"
                      >
                        {/* Groupe du titre et du projet. */}
                        <div>
                          {/* Lien vers le projet de la tÃ¢che. */}
                          <Link
                            to={`/projets/${tache.projetId}`}
                            className="titre-tache-urgente"
                          >
                            {/* Affiche le titre de la tÃ¢che. */}
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

                        {/* Zone contenant prioritÃ©, statut et date. */}
                        <div className="informations-urgence">
                          {/* Badge de la prioritÃ©. */}
                          <span
                            className={`badge-priorite priorite-${tache.priorite}`}
                          >
                            {
                              // Affiche le nom lisible de la prioritÃ©.
                              nomsPriorites[
                                tache.priorite
                              ] ||
                                // Utilise la valeur brute par dÃ©faut.
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
                                // Utilise la valeur brute par dÃ©faut.
                                tache.statut
                            }
                          </span>

                          {/* Affiche lâ€™Ã©chÃ©ance de la tÃ¢che. */}
                          <span className="date-urgence">
                            {/* LibellÃ© de la date. */}
                            Ã‰chÃ©ance :{" "}

                            {
                              // Affiche la date si elle existe.
                              tache.echeance ||
                                // Texte affichÃ© si elle est absente.
                                "Non indiquÃ©e"
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