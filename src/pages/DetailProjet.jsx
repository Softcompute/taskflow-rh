import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import useTaches from "../hooks/useTaches";

import LigneTache from "../components/LigneTache";
import DetailTache from "../components/DetailTache";

import {
  obtenirProjet,
  creerTache,
  modifierTache,
  supprimerTache,
} from "../api/taches";

const formulaireInitial = {
  titre: "",
  description: "",
  priorite: "moyenne",
  echeance: "",
};

function DetailProjet() {
  const { id } = useParams();
  const { utilisateur } = useAuth();
  const naviguer = useNavigate();

  const [projet, setProjet] = useState(null);

  const [
    chargementProjet,
    setChargementProjet,
  ] = useState(true);

  const [erreurProjet, setErreurProjet] =
    useState("");

  const {
    taches,
    chargementTaches,
    erreurTaches,
    setErreurTaches,
    chargerTaches,
  } = useTaches(id);

  const [
    afficherFormulaire,
    setAfficherFormulaire,
  ] = useState(false);

  const [
    tacheEnModification,
    setTacheEnModification,
  ] = useState(null);

  const [formulaire, setFormulaire] =
    useState(formulaireInitial);

  const [enregistrement, setEnregistrement] =
    useState(false);

  const [message, setMessage] = useState("");

  /*
   * États de recherche, filtres et tri.
   */
  const [recherche, setRecherche] =
    useState("");

  const [filtreStatut, setFiltreStatut] =
    useState("toutes");

  const [filtrePriorite, setFiltrePriorite] =
    useState("toutes");

  const [tri, setTri] = useState(
    "echeance-croissante"
  );

  const [
    tacheSelectionnee,
    setTacheSelectionnee,
  ] = useState(null);

  /*
   * Chargement du projet.
   */
  useEffect(() => {
    const chargerProjet = async () => {
      try {
        setChargementProjet(true);
        setErreurProjet("");

        const projetRecu = await obtenirProjet(id);

        const projetAutorise =
          String(projetRecu.utilisateurId) ===
          String(utilisateur.id);

        if (!projetAutorise) {
          naviguer("/projets", {
            replace: true,
          });

          return;
        }

        setProjet(projetRecu);
      } catch (erreur) {
        setErreurProjet(
          erreur.message || "Projet introuvable."
        );
      } finally {
        setChargementProjet(false);
      }
    };

    chargerProjet();
  }, [id, utilisateur.id, naviguer]);

  /*
   * Recherche, filtres et tri combinés.
   */
  const tachesFiltrees = useMemo(() => {
    const texteRecherche = recherche
      .trim()
      .toLowerCase();

    const resultat = taches.filter((tache) => {
      const titre = (tache.titre || "")
        .toLowerCase();

      const correspondRecherche =
        titre.includes(texteRecherche);

      const correspondStatut =
        filtreStatut === "toutes" ||
        tache.statut === filtreStatut;

      const correspondPriorite =
        filtrePriorite === "toutes" ||
        tache.priorite === filtrePriorite;

      return (
        correspondRecherche &&
        correspondStatut &&
        correspondPriorite
      );
    });

    return [...resultat].sort(
      (premiereTache, deuxiemeTache) => {
        if (tri === "echeance-croissante") {
          return (
            new Date(premiereTache.echeance) -
            new Date(deuxiemeTache.echeance)
          );
        }

        if (tri === "echeance-decroissante") {
          return (
            new Date(deuxiemeTache.echeance) -
            new Date(premiereTache.echeance)
          );
        }

        if (tri === "creation-recente") {
          return (
            new Date(deuxiemeTache.creeLe) -
            new Date(premiereTache.creeLe)
          );
        }

        if (tri === "creation-ancienne") {
          return (
            new Date(premiereTache.creeLe) -
            new Date(deuxiemeTache.creeLe)
          );
        }

        return 0;
      }
    );
  }, [
    taches,
    recherche,
    filtreStatut,
    filtrePriorite,
    tri,
  ]);

  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  };

  const reinitialiserFiltres = () => {
    setRecherche("");
    setFiltreStatut("toutes");
    setFiltrePriorite("toutes");
    setTri("echeance-croissante");
  };

  const ouvrirCreation = () => {
    setTacheEnModification(null);
    setFormulaire(formulaireInitial);
    setErreurTaches("");
    setMessage("");
    setAfficherFormulaire(true);
  };

  const ouvrirModification = (tache) => {
    setTacheEnModification(tache);

    setFormulaire({
      titre: tache.titre || "",
      description: tache.description || "",
      priorite: tache.priorite || "moyenne",
      echeance: tache.echeance || "",
    });

    setErreurTaches("");
    setMessage("");
    setAfficherFormulaire(true);
  };

  const fermerFormulaire = () => {
    setAfficherFormulaire(false);
    setTacheEnModification(null);
    setFormulaire(formulaireInitial);
  };

  const enregistrerTache = async (evenement) => {
    evenement.preventDefault();

    setErreurTaches("");
    setMessage("");

    const titreNettoye =
      formulaire.titre.trim();

    const descriptionNettoyee =
      formulaire.description.trim();

    if (!titreNettoye) {
      setErreurTaches(
        "Le titre de la tâche est obligatoire."
      );
      return;
    }

    if (!descriptionNettoyee) {
      setErreurTaches(
        "La description est obligatoire."
      );
      return;
    }

    if (!formulaire.echeance) {
      setErreurTaches(
        "La date d’échéance est obligatoire."
      );
      return;
    }

    const dateActuelle = new Date()
      .toISOString()
      .split("T")[0];

    try {
      setEnregistrement(true);

      if (tacheEnModification) {
        await modifierTache(
          tacheEnModification.id,
          {
            titre: titreNettoye,
            description: descriptionNettoyee,
            priorite: formulaire.priorite,
            echeance: formulaire.echeance,
            modifieLe: dateActuelle,
          }
        );

        fermerFormulaire();
        await chargerTaches();

        setMessage(
          "Tâche modifiée avec succès."
        );
      } else {
        await creerTache({
          projetId: id,
          titre: titreNettoye,
          description: descriptionNettoyee,
          statut: "a_faire",
          priorite: formulaire.priorite,
          echeance: formulaire.echeance,
          creeLe: dateActuelle,
          modifieLe: dateActuelle,
        });

        fermerFormulaire();
        await chargerTaches();

        setMessage(
          "Tâche créée avec succès."
        );
      }
    } catch (erreur) {
      setErreurTaches(
        erreur.message ||
          "Impossible d’enregistrer la tâche."
      );
    } finally {
      setEnregistrement(false);
    }
  };

  const gererSuppression = async (tache) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la tâche « ${tache.titre} » ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setErreurTaches("");
      setMessage("");

      await supprimerTache(tache.id);
      await chargerTaches();

      if (
        String(tacheSelectionnee?.id) ===
        String(tache.id)
      ) {
        setTacheSelectionnee(null);
      }

      setMessage(
        "Tâche supprimée avec succès."
      );
    } catch (erreur) {
      setErreurTaches(
        erreur.message ||
          "Impossible de supprimer la tâche."
      );
    }
  };

  const gererChangementStatut = async (
    tache,
    nouveauStatut
  ) => {
    try {
      setErreurTaches("");
      setMessage("");

      const dateActuelle = new Date()
        .toISOString()
        .split("T")[0];

      await modifierTache(tache.id, {
        statut: nouveauStatut,
        modifieLe: dateActuelle,
      });

      await chargerTaches();

      setMessage(
        "Statut modifié avec succès."
      );
    } catch (erreur) {
      setErreurTaches(
        erreur.message ||
          "Impossible de modifier le statut."
      );
    }
  };

  if (chargementProjet) {
    return (
      <div className="etat-page">
        <p>Chargement du projet...</p>
      </div>
    );
  }

  if (erreurProjet) {
    return (
      <div className="etat-page">
        <div className="message-erreur">
          {erreurProjet}
        </div>

        <Link to="/projets">
          Retour aux projets
        </Link>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="etat-page">
        <h2>Projet introuvable</h2>

        <Link to="/projets">
          Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <section className="page-taches">
      <Link
        to="/projets"
        className="lien-retour"
      >
        ← Retour aux projets
      </Link>

      <header className="entete-taches">
        <div>
          <p className="petit-titre">
            Projet RH
          </p>

          <h1>{projet.nom}</h1>

          <p>{projet.description}</p>
        </div>

        <button
          type="button"
          className="bouton-principal bouton-nouveau"
          onClick={ouvrirCreation}
        >
          + Nouvelle tâche
        </button>
      </header>

      {erreurTaches && (
        <div className="message-erreur">
          {erreurTaches}
        </div>
      )}

      {message && (
        <div className="message-succes">
          {message}
        </div>
      )}

      <section className="outils-taches">
        <div className="champ-recherche">
          <label htmlFor="recherche">
            Rechercher une tâche
          </label>

          <input
            id="recherche"
            type="search"
            value={recherche}
            onChange={(evenement) =>
              setRecherche(evenement.target.value)
            }
            placeholder="Rechercher par titre..."
          />
        </div>

        <div className="champ-filtre">
          <label htmlFor="filtreStatut">
            Statut
          </label>

          <select
            id="filtreStatut"
            value={filtreStatut}
            onChange={(evenement) =>
              setFiltreStatut(
                evenement.target.value
              )
            }
          >
            <option value="toutes">
              Toutes
            </option>

            <option value="a_faire">
              À faire
            </option>

            <option value="en_cours">
              En cours
            </option>

            <option value="terminee">
              Terminées
            </option>
          </select>
        </div>

        <div className="champ-filtre">
          <label htmlFor="filtrePriorite">
            Priorité
          </label>

          <select
            id="filtrePriorite"
            value={filtrePriorite}
            onChange={(evenement) =>
              setFiltrePriorite(
                evenement.target.value
              )
            }
          >
            <option value="toutes">
              Toutes
            </option>

            <option value="basse">
              Basse
            </option>

            <option value="moyenne">
              Moyenne
            </option>

            <option value="haute">
              Haute
            </option>
          </select>
        </div>

        <div className="champ-filtre">
          <label htmlFor="tri">
            Trier par
          </label>

          <select
            id="tri"
            value={tri}
            onChange={(evenement) =>
              setTri(evenement.target.value)
            }
          >
            <option value="echeance-croissante">
              Échéance la plus proche
            </option>

            <option value="echeance-decroissante">
              Échéance la plus éloignée
            </option>

            <option value="creation-recente">
              Création la plus récente
            </option>

            <option value="creation-ancienne">
              Création la plus ancienne
            </option>
          </select>
        </div>
      </section>

      <div className="resume-filtres">
        <span>
          {tachesFiltrees.length} tâche
          {tachesFiltrees.length !== 1
            ? "s"
            : ""}{" "}
          affichée
          {tachesFiltrees.length !== 1
            ? "s"
            : ""}
        </span>

        <button
          type="button"
          className="bouton-reinitialiser"
          onClick={reinitialiserFiltres}
        >
          Réinitialiser les filtres
        </button>
      </div>

      {afficherFormulaire && (
        <section className="formulaire-tache">
          <div className="entete-formulaire">
            <h2>
              {tacheEnModification
                ? "Modifier la tâche"
                : "Créer une tâche"}
            </h2>

            <button
              type="button"
              className="bouton-fermer"
              onClick={fermerFormulaire}
              aria-label="Fermer le formulaire"
            >
              ×
            </button>
          </div>

          <form onSubmit={enregistrerTache}>
            <div className="groupe-champ">
              <label htmlFor="titre">
                Titre de la tâche
              </label>

              <input
                id="titre"
                name="titre"
                type="text"
                value={formulaire.titre}
                onChange={modifierChamp}
                placeholder="Exemple : Examiner les CV"
                disabled={enregistrement}
              />
            </div>

            <div className="groupe-champ">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formulaire.description}
                onChange={modifierChamp}
                rows="4"
                placeholder="Décrivez la tâche"
                disabled={enregistrement}
              />
            </div>

            <div className="champs-deux-colonnes">
              <div className="groupe-champ">
                <label htmlFor="priorite">
                  Priorité
                </label>

                <select
                  id="priorite"
                  name="priorite"
                  value={formulaire.priorite}
                  onChange={modifierChamp}
                  disabled={enregistrement}
                >
                  <option value="basse">
                    Basse
                  </option>

                  <option value="moyenne">
                    Moyenne
                  </option>

                  <option value="haute">
                    Haute
                  </option>
                </select>
              </div>

              <div className="groupe-champ">
                <label htmlFor="echeance">
                  Date d’échéance
                </label>

                <input
                  id="echeance"
                  name="echeance"
                  type="date"
                  value={formulaire.echeance}
                  onChange={modifierChamp}
                  disabled={enregistrement}
                />
              </div>
            </div>

            <div className="actions-formulaire">
              <button
                type="button"
                className="bouton-annuler"
                onClick={fermerFormulaire}
                disabled={enregistrement}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="bouton-principal"
                disabled={enregistrement}
              >
                {enregistrement
                  ? "Enregistrement..."
                  : tacheEnModification
                    ? "Enregistrer les modifications"
                    : "Créer la tâche"}
              </button>
            </div>
          </form>
        </section>
      )}

      {chargementTaches ? (
        <div className="etat-page">
          <p>Chargement des tâches...</p>
        </div>
      ) : taches.length === 0 ? (
        <div className="etat-page">
          <h2>Aucune tâche</h2>

          <p>
            Ce projet ne contient aucune tâche.
          </p>

          <button
            type="button"
            className="bouton-principal"
            onClick={ouvrirCreation}
          >
            Créer la première tâche
          </button>
        </div>
      ) : tachesFiltrees.length === 0 ? (
        <div className="etat-page">
          <h2>Aucun résultat</h2>

          <p>
            Aucune tâche ne correspond aux critères
            sélectionnés.
          </p>

          <button
            type="button"
            className="bouton-reinitialiser"
            onClick={reinitialiserFiltres}
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="liste-taches">
          {tachesFiltrees.map((tache) => (
            <LigneTache
              key={tache.id}
              tache={tache}
              onVoir={setTacheSelectionnee}
              onModifier={ouvrirModification}
              onSupprimer={gererSuppression}
              onChangerStatut={
                gererChangementStatut
              }
            />
          ))}
        </div>
      )}

      {tacheSelectionnee && (
        <DetailTache
          tache={tacheSelectionnee}
          onFermer={() =>
            setTacheSelectionnee(null)
          }
        />
      )}
    </section>
  );
}

export default DetailProjet;