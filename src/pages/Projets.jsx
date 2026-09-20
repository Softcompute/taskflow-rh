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
  const utilisateurId = utilisateur?.id;

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

  const chargerDonnees = useCallback(async () => {
    if (!utilisateurId) {
      setProjets([]);
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

  useEffect(() => {
    // Chargement initial depuis JSON Server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerDonnees();
  }, [chargerDonnees]);

  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  };

  const ouvrirCreation = () => {
    setProjetEnModification(null);
    setFormulaire(formulaireInitial);
    setErreur("");
    setMessage("");
    setAfficherFormulaire(true);
  };

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

  const fermerFormulaire = () => {
    setAfficherFormulaire(false);
    setProjetEnModification(null);
    setFormulaire(formulaireInitial);
  };

  const enregistrerProjet = async (evenement) => {
    evenement.preventDefault();

    setErreur("");
    setMessage("");

    if (!utilisateurId) {
      setErreur(
        "Vous devez être connecté pour enregistrer un projet."
      );
      return;
    }

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
        const nouveauProjet = await creerProjet({
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

      {message && (
        <div
          className="message-succes"
          role="status"
        >
          {message}
        </div>
      )}

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