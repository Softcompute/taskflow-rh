import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import useTaches from "../hooks/useTaches";
import LigneTache from "../components/LigneTache";

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
  const [chargementProjet, setChargementProjet] =
    useState(true);
  const [erreurProjet, setErreurProjet] =
    useState("");

  const {
    taches,
    chargementTaches,
    erreurTaches,
    setErreurTaches,
    chargerTaches,
  } = useTaches(id);

  const [afficherFormulaire, setAfficherFormulaire] =
    useState(false);

  const [tacheEnModification, setTacheEnModification] =
    useState(null);

  const [formulaire, setFormulaire] =
    useState(formulaireInitial);

  const [enregistrement, setEnregistrement] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const chargerProjet = async () => {
      try {
        setChargementProjet(true);
        setErreurProjet("");

        const projetRecu = await obtenirProjet(id);

        if (
          String(projetRecu.utilisateurId) !==
          String(utilisateur.id)
        ) {
          naviguer("/projets", { replace: true });
          return;
        }

        setProjet(projetRecu);
      } catch (erreur) {
        setErreurProjet(erreur.message);
      } finally {
        setChargementProjet(false);
      }
    };

    chargerProjet();
  }, [id, utilisateur.id, naviguer]);

  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
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
      titre: tache.titre,
      description: tache.description || "",
      priorite: tache.priorite,
      echeance: tache.echeance,
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

    if (!formulaire.titre.trim()) {
      setErreurTaches(
        "Le titre de la tâche est obligatoire."
      );
      return;
    }

    if (!formulaire.description.trim()) {
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
            titre: formulaire.titre.trim(),
            description:
              formulaire.description.trim(),
            priorite: formulaire.priorite,
            echeance: formulaire.echeance,
            modifieLe: dateActuelle,
          }
        );

        setMessage("Tâche modifiée avec succès.");
      } else {
        await creerTache({
          projetId: id,
          titre: formulaire.titre.trim(),
          description:
            formulaire.description.trim(),
          statut: "a_faire",
          priorite: formulaire.priorite,
          echeance: formulaire.echeance,
          creeLe: dateActuelle,
          modifieLe: dateActuelle,
        });

        setMessage("Tâche créée avec succès.");
      }

      fermerFormulaire();
      await chargerTaches();
    } catch (erreur) {
      setErreurTaches(erreur.message);
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

      setMessage("Tâche supprimée avec succès.");
      await chargerTaches();
    } catch (erreur) {
      setErreurTaches(erreur.message);
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

      setMessage("Statut modifié avec succès.");
      await chargerTaches();
    } catch (erreur) {
      setErreurTaches(erreur.message);
    }
  };

  if (chargementProjet) {
    return <p>Chargement du projet...</p>;
  }

  if (erreurProjet) {
    return (
      <div className="message-erreur">
        {erreurProjet}
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
                placeholder="Décrivez la tâche à réaliser"
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
                />
              </div>
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
      ) : (
        <div className="liste-taches">
          {taches.map((tache) => (
            <LigneTache
              key={tache.id}
              tache={tache}
              onModifier={ouvrirModification}
              onSupprimer={gererSuppression}
              onChangerStatut={
                gererChangementStatut
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default DetailProjet;