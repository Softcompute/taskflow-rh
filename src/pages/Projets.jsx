import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import CarteProjet from "../components/CarteProjet";

import {
  obtenirProjets,
  obtenirTaches,
  creerProjet,
  modifierProjet,
  supprimerProjetEtTaches,
} from "../api/projets";

const formulaireInitial = {
  nom: "",
  description: "",
  couleur: "#2563eb",
};

function Projets() {
  const { utilisateur } = useAuth();

  const [projets, setProjets] = useState([]);
  const [taches, setTaches] = useState([]);

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

  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  /*
   * Charge les projets de l'utilisateur connecté
   * et toutes les tâches.
   */
  const chargerDonnees = useCallback(async () => {
    if (!utilisateur?.id) {
      return;
    }

    try {
      setChargement(true);
      setErreur("");

      const [projetsRecus, tachesRecues] =
        await Promise.all([
          obtenirProjets(utilisateur.id),
          obtenirTaches(),
        ]);

      setProjets(projetsRecus);
      setTaches(tachesRecues);
    } catch (erreurRequete) {
      setErreur(
        erreurRequete.message ||
          "Une erreur est survenue."
      );
    } finally {
      setChargement(false);
    }
  }, [utilisateur?.id]);

  /*
   * Charge les données à l'ouverture de la page
   * et lorsque l'utilisateur change.
   */
  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  /*
   * Met à jour un champ du formulaire.
   */
  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  };

  /*
   * Ouvre un formulaire vide pour créer un projet.
   */
  const ouvrirCreation = () => {
    setProjetEnModification(null);
    setFormulaire(formulaireInitial);
    setErreur("");
    setMessage("");
    setAfficherFormulaire(true);
  };

  /*
   * Ouvre le formulaire avec les informations
   * du projet à modifier.
   */
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

  /*
   * Ferme et réinitialise le formulaire.
   */
  const fermerFormulaire = () => {
    setAfficherFormulaire(false);
    setProjetEnModification(null);
    setFormulaire(formulaireInitial);
  };

  /*
   * Crée ou modifie un projet.
   */
  const enregistrerProjet = async (evenement) => {
    evenement.preventDefault();

    setErreur("");
    setMessage("");

    const nomNettoye = formulaire.nom.trim();
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

      if (projetEnModification) {
        /*
         * Modification avec PATCH.
         */
        await modifierProjet(
          projetEnModification.id,
          {
            nom: nomNettoye,
            description: descriptionNettoyee,
            couleur: formulaire.couleur,
          }
        );

        fermerFormulaire();
        await chargerDonnees();

        setMessage(
          "Projet modifié avec succès."
        );
      } else {
        /*
         * Création avec POST.
         */
        await creerProjet({
          utilisateurId: utilisateur.id,
          nom: nomNettoye,
          description: descriptionNettoyee,
          couleur: formulaire.couleur,
          creeLe: new Date()
            .toISOString()
            .split("T")[0],
        });

        fermerFormulaire();
        await chargerDonnees();

        setMessage(
          "Projet créé avec succès."
        );
      }
    } catch (erreurRequete) {
      setErreur(
        erreurRequete.message ||
          "Impossible d'enregistrer le projet."
      );
    } finally {
      setEnregistrement(false);
    }
  };

  /*
   * Supprime le projet et toutes ses tâches.
   */
  const gererSuppression = async (projet) => {
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

      await supprimerProjetEtTaches(projet.id);
      await chargerDonnees();

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
      {/* En-tête de la page */}
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
        >
          + Nouveau projet
        </button>
      </header>

      {/* Message d'erreur */}
      {erreur && (
        <div className="message-erreur">
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

      {/* Message de réussite */}
      {message && (
        <div className="message-succes">
          {message}
        </div>
      )}

      {/* Formulaire de création et modification */}
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
            >
              ×
            </button>
          </div>

          <form onSubmit={enregistrerProjet}>
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
                placeholder="Décrivez l'objectif du projet"
                rows="4"
                disabled={enregistrement}
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

      {/* État de chargement */}
      {chargement ? (
        <div className="etat-page">
          <p>Chargement des projets...</p>
        </div>
      ) : projets.length === 0 ? (
        /* État vide */
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
        /* Liste des projets */
        <div className="grille-projets">
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

export default Projets;