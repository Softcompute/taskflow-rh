const API_URL = "http://localhost:3000";

/*
 * Récupère les projets visibles par
 * l’utilisateur connecté.
 *
 * Le Responsable RH voit tous les projets.
 * Les autres utilisateurs voient leurs projets.
 */
export async function obtenirProjets(
  utilisateurId,
  roleUtilisateur
) {
  if (!utilisateurId) {
    return [];
  }

  const adresseProjets =
    roleUtilisateur === "Responsable RH"
      ? `${API_URL}/projets`
      : `${API_URL}/projets?utilisateurId=${encodeURIComponent(
          utilisateurId
        )}`;

  const reponse = await fetch(adresseProjets);

  if (!reponse.ok) {
    throw new Error(
      "Impossible de charger les projets."
    );
  }

  return reponse.json();
}

/*
 * Récupère toutes les tâches enregistrées.
 */
export async function obtenirTaches() {
  const reponse = await fetch(
    `${API_URL}/taches`
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de charger les tâches."
    );
  }

  return reponse.json();
}

/*
 * Crée un nouveau projet.
 */
export async function creerProjet(
  nouveauProjet
) {
  if (!nouveauProjet?.utilisateurId) {
    throw new Error(
      "L’identifiant de l’utilisateur est obligatoire."
    );
  }

  if (!nouveauProjet?.nom?.trim()) {
    throw new Error(
      "Le nom du projet est obligatoire."
    );
  }

  const reponse = await fetch(
    `${API_URL}/projets`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(nouveauProjet),
    }
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de créer le projet."
    );
  }

  return reponse.json();
}

/*
 * Modifie un projet existant.
 */
export async function modifierProjet(
  projetId,
  projetModifie
) {
  if (!projetId) {
    throw new Error(
      "L’identifiant du projet est obligatoire."
    );
  }

  const projetIdEncode =
    encodeURIComponent(projetId);

  const reponse = await fetch(
    `${API_URL}/projets/${projetIdEncode}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(projetModifie),
    }
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de modifier le projet."
    );
  }

  return reponse.json();
}

/*
 * Supprime un projet et toutes les tâches
 * qui appartiennent à ce projet.
 */
export async function supprimerProjetEtTaches(
  projetId
) {
  if (!projetId) {
    throw new Error(
      "L’identifiant du projet est obligatoire."
    );
  }

  const projetIdEncode =
    encodeURIComponent(projetId);

  /*
   * Récupération des tâches appartenant
   * au projet qui doit être supprimé.
   */
  const reponseTaches = await fetch(
    `${API_URL}/taches?projetId=${projetIdEncode}`
  );

  if (!reponseTaches.ok) {
    throw new Error(
      "Impossible de récupérer les tâches du projet."
    );
  }

  const taches = await reponseTaches.json();

  /*
   * Suppression de toutes les tâches du projet.
   */
  await Promise.all(
    taches.map(async (tache) => {
      const tacheIdEncode =
        encodeURIComponent(tache.id);

      const reponseSuppression =
        await fetch(
          `${API_URL}/taches/${tacheIdEncode}`,
          {
            method: "DELETE",
          }
        );

      if (!reponseSuppression.ok) {
        throw new Error(
          `Impossible de supprimer la tâche ${tache.id}.`
        );
      }
    })
  );

  /*
   * Suppression du projet après la suppression
   * de toutes ses tâches.
   */
  const reponseProjet = await fetch(
    `${API_URL}/projets/${projetIdEncode}`,
    {
      method: "DELETE",
    }
  );

  if (!reponseProjet.ok) {
    throw new Error(
      "Impossible de supprimer le projet."
    );
  }

  return true;
}