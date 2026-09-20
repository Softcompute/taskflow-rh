import {
  useCallback,
  // Lance le chargement initial après le rendu.
  useEffect,
  // Gère les états locaux de la page.
  useState,
} from "react";

// Donne accès à l’utilisateur actuellement connecté.
import { useAuth } from "../context/AuthContext";
// Importe la carte utilisée pour afficher chaque projet.
import CarteProjet from "../components/CarteProjet";

import {
  obtenirProjets,
  // Récupère les tâches utilisées pour calculer les progressions.
  obtenirTaches,
  // Enregistre un nouveau projet.
  creerProjet,
  // Modifie un projet existant.
  modifierProjet,
  // Supprime un projet et les tâches qui lui appartiennent.
  supprimerProjetEtTaches,
} from "../api/projets";

// Définit les valeurs utilisées pour réinitialiser le formulaire.
const formulaireInitial = {
  // Le nom est vide au départ.
  nom: "",
  // La description est vide au départ.
  description: "",
  // Le bleu est la couleur sélectionnée par défaut.
  couleur: "#2563eb",
};

/**
 * Page responsable de l’affichage et du CRUD des projets RH.
 */
function Projets() {
  // Récupère l’utilisateur connecté depuis AuthContext.
  const { utilisateur } = useAuth();
  // Récupère son identifiant sans provoquer d’erreur s’il est absent.
  const utilisateurId = utilisateur?.id;

  // Contient les projets affichés dans la page.
  const [projets, setProjets] = useState([]);
  // Contient les tâches nécessaires aux calculs des cartes.
  const [taches, setTaches] = useState([]);

  // Contient les valeurs actuelles du formulaire.
  const [formulaire, setFormulaire] = useState(
    formulaireInitial
  );

  const [
    projetEnModification,
    setProjetEnModification,
  ] = useState(null);

  const [
    afficherFormulaire,
    setAfficherFormulaire,
  ] = useState(false);

  const [chargement, setChargement] =
    useState(true);

  const [enregistrement, setEnregistrement] =
    useState(false);

  const [suppressionId, setSuppressionId] =
    useState(null);

  // Contient un éventuel message d’erreur.
  const [erreur, setErreur] = useState("");
  // Contient le message affiché après une opération réussie.
  const [message, setMessage] = useState("");

  // Charge ou recharge les projets et les tâches depuis l’API.
  const chargerDonnees = useCallback(async () => {
    // Arrête le chargement lorsqu’aucun utilisateur n’est connecté.
    if (!utilisateurId) {
      // Réinitialise la liste des projets.
      setProjets([]);
      // Réinitialise également la liste des tâches.
      setTaches([]);
      setErreur(
        "Aucun utilisateur connecté."
      );
      setChargement(false);
      return;
    }

    try {
      setChargement(true);
      setErreur("");

      // Exécute les deux requêtes en parallèle pour gagner du temps.
      const [projetsRecus, tachesRecues] =
        await Promise.all([
          obtenirProjets(utilisateurId),
          obtenirTaches(),
        ]);

      setProjets(
        Array.isArray(projetsRecus)
          ? projetsRecus
          : []
      );

      setTaches(
        Array.isArray(tachesRecues)
          ? tachesRecues
          : []
      );
    } catch (erreurRequete) {
      setErreur(
        erreurRequete.message ||
          "Impossible de charger les projets."
      );
    } finally {
      setChargement(false);
    }
  }, [utilisateurId]);

  // Exécute chargerDonnees à l’ouverture ou au changement d’utilisateur.
  useEffect(() => {
    // Chargement initial depuis JSON Server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerDonnees();
  }, [chargerDonnees]);

  // Met à jour automatiquement le champ de formulaire modifié.
  const modifierChamp = (evenement) => {
    // Récupère le nom du champ et sa nouvelle valeur.
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  };

  // Ouvre un formulaire vide pour créer un projet.
  const ouvrirCreation = () => {
    setProjetEnModification(null);
    setFormulaire(formulaireInitial);
    setErreur("");
    setMessage("");
    setAfficherFormulaire(true);
  };

  // Ouvre le formulaire rempli avec le projet choisi.
  const ouvrirModification = (projet) => {
    setProjetEnModification(projet);

    setFormulaire({
      nom: projet.nom || "",
      description: projet.description || "",
      couleur: projet.couleur || "#2563eb",
    });

    setErreur("");
    setMessage("");
    setAfficherFormulaire(true);
  };

  // Ferme le formulaire et réinitialise son contenu.
  const fermerFormulaire = () => {
    setAfficherFormulaire(false);
    setProjetEnModification(null);
    setFormulaire(formulaireInitial);
  };

  // Valide le formulaire puis crée ou modifie le projet.
  const enregistrerProjet = async (evenement) => {
    // Empêche le rechargement automatique du navigateur.
    evenement.preventDefault();

    setErreur("");
    setMessage("");

    if (!utilisateurId) {
      setErreur(
        "Vous devez être connecté pour enregistrer un projet."
      );
      return;
    }

    // Retire les espaces inutiles autour du nom.
    const nomNettoye = formulaire.nom.trim();
    // Retire les espaces inutiles autour de la description.
    const descriptionNettoyee =
      formulaire.description.trim();

    if (!nomNettoye) {
      setErreur(
        "Le nom du projet est obligatoire."
      );
      return;
    }

    if (!descriptionNettoyee) {
      setErreur(
        "La description du projet est obligatoire."
      );
      return;
    }

    try {
      setEnregistrement(true);

      // Choisit PATCH si un projet est en cours de modification.
      if (projetEnModification) {
        // Envoie les nouvelles informations à JSON Server.
        const projetModifie =
          await modifierProjet(
            projetEnModification.id,
            {
              nom: nomNettoye,
              description: descriptionNettoyee,
              couleur: formulaire.couleur,
              modifieLe: new Date()
                .toISOString()
                .split("T")[0],
            }
          );

        /*
         * Mettre immédiatement à jour le projet
         * visible dans l'interface.
         */
        // Remplace immédiatement le projet dans l’état local.
        // Retire immédiatement le projet de la liste visible.
      setProjets((anciensProjets) =>
          anciensProjets.map((projet) =>
            String(projet.id) ===
            String(projetModifie.id)
              ? projetModifie
              : projet
          )
        );

        fermerFormulaire();

        setMessage(
          "Projet modifié avec succès."
        );
      } else {
        // Envoie le nouveau projet à JSON Server.
        const nouveauProjet = await creerProjet({
          // Associe le projet à l’utilisateur connecté.
          utilisateurId: String(utilisateurId),
          nom: nomNettoye,
          description: descriptionNettoyee,
          couleur: formulaire.couleur,
          creeLe: new Date()
            .toISOString()
            .split("T")[0],
        });

        /*
         * Ajouter immédiatement le projet retourné
         * par JSON Server dans l'interface.
         */
        // Ajoute immédiatement le projet retourné dans l’interface.
        setProjets((anciensProjets) => [
          ...anciensProjets,
          nouveauProjet,
        ]);

        fermerFormulaire();

        setMessage(
          "Projet créé avec succès."
        );
      }
    } catch (erreurRequete) {
      setErreur(
        erreurRequete.message ||
          "Impossible d’enregistrer le projet."
      );
    } finally {
      setEnregistrement(false);
    }
  };

  // Demande une confirmation puis supprime le projet et ses tâches.
  const gererSuppression = async (projet) => {
    // Ouvre une boîte de dialogue de confirmation.
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le projet « ${projet.nom} » et toutes ses tâches ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setSuppressionId(projet.id);
      setErreur("");
      setMessage("");

      // Supprime les données correspondantes dans JSON Server.
      await supprimerProjetEtTaches(projet.id);

      /*
       * Retirer immédiatement le projet supprimé
       * de l'interface.
       */
      setProjets((anciensProjets) =>
        anciensProjets.filter(
          (ancienProjet) =>
            String(ancienProjet.id) !==
            String(projet.id)
        )
      );

      /*
       * Retirer aussi ses tâches de l'état local.
       */
      // Retire également ses tâches de l’état local.
      setTaches((anciennesTaches) =>
        anciennesTaches.filter(
          (tache) =>
            String(tache.projetId) !==
            String(projet.id)
        )
      );

      setMessage(
        "Projet et tâches supprimés avec succès."
      );
    } catch (erreurRequete) {
      setErreur(
        erreurRequete.message ||
          "Impossible de supprimer le projet."
      );
    } finally {
      setSuppressionId(null);
    }
  };

  return (
    <section className="page-projets">
      {/* En-tête contenant le titre et le bouton de création. */}
      <header className="entete-projets">
        <div>
          <p className="petit-titre">
            Gestion des activités
          </p>

          <h1>Projets RH</h1>

          <p>
            Créez et suivez les projets de votre
            département.
          </p>
        </div>

        <button
          type="button"
          className="bouton-principal bouton-nouveau"
          onClick={ouvrirCreation}
          disabled={!utilisateurId}
        >
          + Nouveau projet
        </button>
      </header>

      {/* Affiche un message et un bouton Réessayer en cas d’erreur. */}
      {erreur && (
        <div
          className="message-erreur"
          role="alert"
        >
          <span>{erreur}</span>

          <button
            type="button"
            className="bouton-reessayer"
            onClick={chargerDonnees}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Affiche la confirmation d’une opération réussie. */}
      {message && (
        <div
          className="message-succes"
          role="status"
        >
          {message}
        </div>
      )}

      {/* Affiche le formulaire uniquement lorsqu’il est ouvert. */}
      {afficherFormulaire && (
        <section className="formulaire-projet">
          <div className="entete-formulaire">
            <h2>
              {projetEnModification
                ? "Modifier le projet"
                : "Créer un projet"}
            </h2>

            <button
              type="button"
              className="bouton-fermer"
              onClick={fermerFormulaire}
              aria-label="Fermer le formulaire"
              disabled={enregistrement}
            >
              ×
            </button>
          </div>

          {/* Déclenche enregistrerProjet lors de la soumission. */}
          <form onSubmit={enregistrerProjet}>
            {/* Champ utilisé pour saisir le nom du projet. */}
            <div className="groupe-champ">
              <label htmlFor="nom">
                Nom du projet
              </label>

              <input
                id="nom"
                name="nom"
                type="text"
                value={formulaire.nom}
                onChange={modifierChamp}
                placeholder="Exemple : Recrutement 2026"
                disabled={enregistrement}
                required
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
                placeholder="Décrivez l’objectif du projet"
                rows="4"
                disabled={enregistrement}
                required
              />
            </div>

            <div className="groupe-champ">
              <label htmlFor="couleur">
                Couleur du projet
              </label>

              <div className="selection-couleur">
                <input
                  id="couleur"
                  name="couleur"
                  type="color"
                  value={formulaire.couleur}
                  onChange={modifierChamp}
                  disabled={enregistrement}
                />

                <span>{formulaire.couleur}</span>
              </div>
            </div>

            {/* Boutons permettant d’annuler ou d’enregistrer. */}
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
                  : projetEnModification
                    ? "Enregistrer les modifications"
                    : "Créer le projet"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Choisit entre le chargement, l’état vide et la grille. */}
      {chargement ? (
        <div className="etat-page">
          <p>Chargement des projets...</p>
        </div>
      ) : projets.length === 0 ? (
        <div className="etat-page">
          <h2>Aucun projet</h2>

          <p>
            Vous n’avez pas encore créé de projet RH.
          </p>

          <button
            type="button"
            className="bouton-principal"
            onClick={ouvrirCreation}
          >
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <div className="grille-projets">
          {/* Transforme chaque projet en composant CarteProjet. */}
          {projets.map((projet) => (
            <CarteProjet
              key={projet.id}
              projet={projet}
              taches={taches}
              onModifier={ouvrirModification}
              onSupprimer={gererSuppression}
              suppressionEnCours={
                String(suppressionId) ===
                String(projet.id)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Rend la page disponible dans App.jsx.
export default Projets;