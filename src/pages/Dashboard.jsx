import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { obtenirDonneesDashboard } from "../api/dashboard";

import {
  calculerAvancementProjet,
  calculerStatistiques,
  obtenirTachesUrgentes,
} from "../utils/statistiques";

const nomsStatuts = {
  a_faire: "À faire",
  en_cours: "En cours",
  terminee: "Terminée",
};

const nomsPriorites = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
};

function Dashboard() {
  const { utilisateur } = useAuth();

  const [projets, setProjets] = useState([]);
  const [taches, setTaches] = useState([]);

  const [chargement, setChargement] =
    useState(true);

  const [erreur, setErreur] = useState("");

  const chargerDashboard = useCallback(
    async () => {
      if (!utilisateur?.id) {
        return;
      }

      try {
        setChargement(true);
        setErreur("");

        const donnees =
          await obtenirDonneesDashboard(
            utilisateur.id
          );

        setProjets(donnees.projets);
        setTaches(donnees.taches);
      } catch (erreurRequete) {
        setErreur(
          erreurRequete.message ||
            "Impossible de charger le tableau de bord."
        );
      } finally {
        setChargement(false);
      }
    },
    [utilisateur?.id]
  );

  useEffect(() => {
    chargerDashboard();
  }, [chargerDashboard]);

  const statistiques = useMemo(
    () => calculerStatistiques(taches),
    [taches]
  );

  const projetsAvecAvancement = useMemo(
    () =>
      projets.map((projet) =>
        calculerAvancementProjet(projet, taches)
      ),
    [projets, taches]
  );

  const tachesUrgentes = useMemo(
    () => obtenirTachesUrgentes(taches, 5),
    [taches]
  );

  const obtenirNomProjet = (projetId) => {
    const projet = projets.find(
      (element) =>
        String(element.id) === String(projetId)
    );

    return projet?.nom || "Projet inconnu";
  };

  if (chargement) {
    return (
      <div className="etat-page">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <section className="page-dashboard">
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

        <Link
          to="/projets"
          className="bouton-lien-principal"
        >
          Voir les projets
        </Link>
      </header>

      {erreur && (
        <div className="message-erreur">
          <span>{erreur}</span>

          <button
            type="button"
            className="bouton-reessayer"
            onClick={chargerDashboard}
          >
            Réessayer
          </button>
        </div>
      )}

      {!erreur && (
        <>
          <div className="cartes-statistiques">
            <article className="carte-statistique">
              <span>Projets RH</span>
              <strong>{projets.length}</strong>
            </article>

            <article className="carte-statistique">
              <span>Tâches totales</span>
              <strong>{statistiques.total}</strong>
            </article>

            <article className="carte-statistique">
              <span>À faire</span>
              <strong>
                {statistiques.aFaire}
              </strong>
            </article>

            <article className="carte-statistique">
              <span>En cours</span>
              <strong>
                {statistiques.enCours}
              </strong>
            </article>

            <article className="carte-statistique">
              <span>Terminées</span>
              <strong>
                {statistiques.terminees}
              </strong>
            </article>

            <article className="carte-statistique carte-pourcentage">
              <span>Avancement global</span>

              <strong>
                {statistiques.pourcentageTermine} %
              </strong>

              <div className="barre-progression">
                <div
                  className="progression progression-globale"
                  style={{
                    width: `${statistiques.pourcentageTermine}%`,
                  }}
                />
              </div>
            </article>
          </div>

          <div className="sections-dashboard">
            <section className="bloc-dashboard">
              <div className="titre-bloc-dashboard">
                <div>
                  <h2>
                    Avancement des projets
                  </h2>

                  <p>
                    Progression calculée à partir
                    des tâches terminées.
                  </p>
                </div>

                <Link to="/projets">
                  Tous les projets
                </Link>
              </div>

              {projetsAvecAvancement.length ===
              0 ? (
                <div className="etat-dashboard">
                  <p>
                    Aucun projet disponible.
                  </p>

                  <Link
                    to="/projets"
                    className="bouton-lien-principal"
                  >
                    Créer un projet
                  </Link>
                </div>
              ) : (
                <div className="liste-avancements">
                  {projetsAvecAvancement.map(
                    (projet) => (
                      <article
                        key={projet.id}
                        className="ligne-avancement"
                      >
                        <div className="information-projet-dashboard">
                          <div
                            className="indicateur-couleur"
                            style={{
                              backgroundColor:
                                projet.couleur ||
                                "#2563eb",
                            }}
                          />

                          <div>
                            <Link
                              to={`/projets/${projet.id}`}
                            >
                              {projet.nom}
                            </Link>

                            <span>
                              {
                                projet.nombreTerminees
                              }{" "}
                              sur{" "}
                              {projet.nombreTaches}{" "}
                              terminée
                              {projet.nombreTaches !==
                              1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                        </div>

                        <div className="progression-projet-dashboard">
                          <strong>
                            {projet.pourcentage} %
                          </strong>

                          <div className="barre-progression">
                            <div
                              className="progression"
                              style={{
                                width: `${projet.pourcentage}%`,
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

            <section className="bloc-dashboard">
              <div className="titre-bloc-dashboard">
                <div>
                  <h2>Tâches urgentes</h2>

                  <p>
                    Tâches non terminées classées
                    par priorité et échéance.
                  </p>
                </div>
              </div>

              {tachesUrgentes.length === 0 ? (
                <div className="etat-dashboard">
                  <p>
                    Aucune tâche urgente.
                  </p>
                </div>
              ) : (
                <div className="liste-urgences">
                  {tachesUrgentes.map((tache) => (
                    <article
                      key={tache.id}
                      className="tache-urgente"
                    >
                      <div>
                        <Link
                          to={`/projets/${tache.projetId}`}
                          className="titre-tache-urgente"
                        >
                          {tache.titre}
                        </Link>

                        <p>
                          {obtenirNomProjet(
                            tache.projetId
                          )}
                        </p>
                      </div>

                      <div className="informations-urgence">
                        <span
                          className={`badge-priorite priorite-${tache.priorite}`}
                        >
                          {nomsPriorites[
                            tache.priorite
                          ] || tache.priorite}
                        </span>

                        <span
                          className={`badge-statut statut-${tache.statut}`}
                        >
                          {nomsStatuts[
                            tache.statut
                          ] || tache.statut}
                        </span>

                        <span className="date-urgence">
                          Échéance :{" "}
                          {tache.echeance ||
                            "Non indiquée"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;