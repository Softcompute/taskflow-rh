import {
  useEffect,
  // Mémorise le résultat de la recherche, des filtres et du tri.
  useMemo,
  // Crée les différents états locaux du composant.
  useState,
} from "react";

import {
  Link,
  // Permet de rediriger l’utilisateur avec JavaScript.
  useNavigate,
  // Récupère l’identifiant du projet présent dans l’URL.
  useParams,
} from "react-router-dom";

// Donne accès à l’utilisateur actuellement connecté.
import { useAuth } from "../hooks/useAuth";
// Importe le hook responsable du chargement et du rechargement des tâches.
import useTaches from "../hooks/useTaches";

// Affiche une tâche dans la liste.
import LigneTache from "../components/LigneTache";
// Affiche les informations complètes d’une tâche dans une modale.
import DetailTache from "../components/DetailTache";

import {
  obtenirProjet,
  // Enregistre une nouvelle tâche.
  creerTache,
  // Modifie une tâche existante.
  modifierTache,
  // Supprime une tâche.
  supprimerTache,
} from "../api/taches";

// Définit les valeurs utilisées pour réinitialiser le formulaire.
const formulaireInitial = {
  // Titre vide au départ.
  titre: "",
  // Description vide au départ.
  description: "",
  // Priorité moyenne sélectionnée par défaut.
  priorite: "moyenne",
  // Aucune date d’échéance au départ.
  echeance: "",
};

/**
 * Page de détail d’un projet RH.
 * Elle gère l’affichage, la recherche, les filtres et le CRUD des tâches.
 */
function DetailProjet() {
  // Récupère l’identifiant placé dans l’adresse /projets/:id.
  const { id } = useParams();
  // Récupère l’utilisateur connecté.
  const { utilisateur } = useAuth();
  // Prépare la fonction de redirection.
  const naviguer = useNavigate();

  // Contient le projet chargé depuis JSON Server.
  const [projet, setProjet] = useState(null);

  const [
    chargementProjet,
    setChargementProjet,
  ] = useState(true);

  // Contient une erreur liée au chargement du projet.
  const [erreurProjet, setErreurProjet] =
    useState("");

  const {
    taches,
    chargementTaches,
    erreurTaches,
    setErreurTaches,
    chargerTaches,
  } = useTaches(id); // Charge uniquement les tâches de ce projet.

  const [
    afficherFormulaire,
    setAfficherFormulaire,
  ] = useState(false);

  const [
    tacheEnModification,
    setTacheEnModification,
  ] = useState(null);

  // Contient les valeurs actuelles du formulaire.
  const [formulaire, setFormulaire] =
    useState(formulaireInitial);

  const [enregistrement, setEnregistrement] =
    useState(false);

  // Contient le message de réussite affiché à l’utilisateur.
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
    // Déclare la fonction asynchrone de chargement.
    const chargerProjet = async () => {
      try {
        setChargementProjet(true);
        setErreurProjet("");

        // Demande le projet correspondant à l’identifiant de l’URL.
        const projetRecu = await obtenirProjet(id);

        // Vérifie que le projet appartient bien à l’utilisateur connecté.
        const projetAutorise =
          String(projetRecu.utilisateurId) ===
          String(utilisateur.id);

        if (!projetAutorise) {
          // Redirige vers les projets si l’accès n’est pas autorisé.
          naviguer("/projets", {
            replace: true,
          });

          return;
        }

        // Enregistre le projet autorisé dans l’état React.
        setProjet(projetRecu);
      } catch (erreur) {
        setErreurProjet(
          erreur.message || "Projet introuvable."
        );
      } finally {
        setChargementProjet(false);
      }
    };

    // Lance réellement le chargement défini ci-dessus.
    chargerProjet();
  }, [id, utilisateur.id, naviguer]);

  /*
   * Recherche, filtres et tri combinés.
   */
  // Recalcule la liste uniquement si une dépendance change.
  const tachesFiltrees = useMemo(() => {
    // Nettoie et met la recherche en minuscules.
    const texteRecherche = recherche
      .trim()
      .toLowerCase();

    // Conserve uniquement les tâches correspondant aux trois critères.
    const resultat = taches.filter((tache) => {
      const titre = (tache.titre || "")
        .toLowerCase();

      // Vérifie si le titre contient le texte recherché.
      const correspondRecherche =
        titre.includes(texteRecherche);

      // Vérifie le filtre du statut.
      const correspondStatut =
        filtreStatut === "toutes" ||
        tache.statut === filtreStatut;

      // Vérifie le filtre de priorité.
      const correspondPriorite =
        filtrePriorite === "toutes" ||
        tache.priorite === filtrePriorite;

      return (
        correspondRecherche &&
        correspondStatut &&
        correspondPriorite
      );
    });

    // Trie une copie du résultat sans modifier le tableau original.
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

  // Met à jour automatiquement le champ de formulaire modifié.
  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  };

  // Replace tous les outils de recherche dans leur état initial.
  const reinitialiserFiltres = () => {
    setRecherche("");
    setFiltreStatut("toutes");
    setFiltrePriorite("toutes");
    setTri("echeance-croissante");
  };

  // Ouvre un formulaire vide pour créer une tâche.
  const ouvrirCreation = () => {
    setTacheEnModification(null);
    setFormulaire(formulaireInitial);
    setErreurTaches("");
    setMessage("");
    setAfficherFormulaire(true);
  };

  // Ouvre le formulaire rempli avec la tâche choisie.
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

  // Ferme et réinitialise le formulaire.
  const fermerFormulaire = () => {
    setAfficherFormulaire(false);
    setTacheEnModification(null);
    setFormulaire(formulaireInitial);
  };

  // Valide puis crée ou modifie une tâche.
  const enregistrerTache = async (evenement) => {
    // Empêche le navigateur de recharger la page.
    evenement.preventDefault();

    setErreurTaches("");
    setMessage("");

    // Retire les espaces inutiles du titre.
    const titreNettoye =
      formulaire.titre.trim();

    // Retire les espaces inutiles de la description.
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

    // Produit la date actuelle au format AAAA-MM-JJ.
    const dateActuelle = new Date()
      .toISOString()
      .split("T")[0];

    try {
      setEnregistrement(true);

      if (tacheEnModification) {
        // Envoie uniquement les nouvelles valeurs à JSON Server.
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
        // Enregistre une nouvelle tâche liée au projet courant.
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

  // Demande une confirmation puis supprime la tâche.
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

  // Modifie rapidement le statut depuis LigneTache.
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

  // Affiche un écran temporaire pendant le chargement du projet.
  if (chargementProjet) {
    return (
      <div className="etat-page">
        <p>Chargement du projet...</p>
      </div>
    );
  }

  // Affiche l’erreur si le projet ne peut pas être chargé.
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

  // Gère le cas où aucun projet n’a été retourné.
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

      {/* En-tête présentant le projet et le bouton de création. */}
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

      {/* Affiche une éventuelle erreur liée aux tâches. */}
      {erreurTaches && (
        <div className="message-erreur">
          {erreurTaches}
        </div>
      )}

      {/* Affiche un message après une opération réussie. */}
      {message && (
        <div className="message-succes">
          {message}
        </div>
      )}

      {/* Regroupe la recherche, les filtres et le tri. */}
      <section className="outils-taches">
        {/* Champ de recherche par titre. */}
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

        {/* Filtre des tâches par statut. */}
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

      {/* Résume le nombre de résultats et permet d’effacer les filtres. */}
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

      {/* Affiche le formulaire uniquement lorsqu’il est ouvert. */}
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

          {/* Déclenche enregistrerTache lors de la soumission. */}
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

      {/* Choisit entre chargement, état vide, aucun résultat et liste. */}
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
          {/* Transforme chaque tâche filtrée en composant LigneTache. */}
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

      {/* Ouvre la modale lorsqu’une tâche a été sélectionnée. */}
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

// Rend la page importable dans App.jsx.
export default DetailProjet;