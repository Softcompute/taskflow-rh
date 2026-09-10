import { useEffect, useState } from "react";

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

  const [formulaire, setFormulaire] =
    useState(formulaireInitial);

  const [projetEnModification, setProjetEnModification] =
    useState(null);

  const [afficherFormulaire, setAfficherFormulaire] =
    useState(false);

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] =
    useState(false);

  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  const chargerDonnees = async () => {
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
      setErreur(erreurRequete.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, [utilisateur.id]);

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
      nom: projet.nom,
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

    if (!formulaire.nom.trim()) {
      setErreur("Le nom du projet est obligatoire.");
      return;
    }

    if (!formulaire.description.trim()) {
      setErreur(
        "La description du projet est obligatoire."
      );
      return;
    }

    try {
      setEnregistrement(true);

      if (projetEnModification) {
        await modifierProjet(
          projetEnModification.id,
          {
            nom: formulaire.nom.trim(),
            description:
              formulaire.description.trim(),
            couleur: formulaire.couleur,
          }
        );

        setMessage("Projet modifié avec succès.");
      } else {
        await creerProjet({
          utilisateurId: utilisateur.id,
          nom: formulaire.nom.trim(),
          description:
            formulaire.description.trim(),
          couleur: formulaire.couleur,
          creeLe: new Date()
            .toISOString()
            .split("T")[0],
        });

        setMessage("Projet créé avec succès.");
      }

      fermerFormulaire();
      await chargerDonnees();
    } catch (erreurRequete) {
      setErreur(erreurRequete.message);
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
      setErreur("");
      setMessage("");

      await supprimerProjetEtTaches(projet.id);

      setMessage("Projet supprimé avec succès.");
      await chargerDonnees();
    } catch (erreurRequete) {
      setErreur(erreurRequete.message);
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
        >
          + Nouveau projet
        </button>
      </header>

      {erreur && (
        <div className="message-erreur">
          {erreur}
        </div>
      )}

      {message && (
        <div className="message-succes">
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
              />
            </div>

            <div className="groupe-champ">
              <label htmlFor="couleur">
                Couleur du projet
              </label>

              <input
                id="couleur"
                name="couleur"
                type="color"
                value={formulaire.couleur}
                onChange={modifierChamp}
              />
            </div>

            <div className="actions-formulaire">
              <button
                type="button"
                className="bouton-annuler"
                onClick={fermerFormulaire}
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
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Projets;