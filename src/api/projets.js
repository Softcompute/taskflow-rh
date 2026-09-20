const API_URL = "http://localhost:3000";

// Récupérer les projets appartenant à l’utilisateur connecté
export async function obtenirProjets(utilisateurId) {
  if (!utilisateurId) {
    return [];
  }

  const idEncode = encodeURIComponent(utilisateurId);

  const reponse = await fetch(
    `${API_URL}/projets?utilisateurId=${idEncode}`
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de charger les projets."
    );
  }

  return reponse.json();
}

// Récupérer toutes les tâches
export async function obtenirTaches() {
  const reponse = await fetch(`${API_URL}/taches`);

  if (!reponse.ok) {
    throw new Error(
      "Impossible de charger les tâches."
    );
  }

  return reponse.json();
}

// Créer un nouveau projet
export async function creerProjet(nouveauProjet) {
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

  const reponse = await fetch(`${API_URL}/projets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nouveauProjet),
  });

  if (!reponse.ok) {
    throw new Error(
      "Impossible de créer le projet."
    );
  }

  return reponse.json();
}

// Modifier un projet existant
export async function modifierProjet(
  id,
  projetModifie
) {
  if (!id) {
    throw new Error(
      "L’identifiant du projet est obligatoire."
    );
  }

  const idEncode = encodeURIComponent(id);

  const reponse = await fetch(
    `${API_URL}/projets/${idEncode}`,
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

// Supprimer un projet et toutes ses tâches
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

  // Récupérer les tâches appartenant au projet
  const reponseTaches = await fetch(
    `${API_URL}/taches?projetId=${projetIdEncode}`
  );

  if (!reponseTaches.ok) {
    throw new Error(
      "Impossible de récupérer les tâches du projet."
    );
  }

  const taches = await reponseTaches.json();

  // Supprimer toutes les tâches du projet
  await Promise.all(
    taches.map(async (tache) => {
      const idTacheEncode = encodeURIComponent(
        tache.id
      );

      const reponseSuppression = await fetch(
        `${API_URL}/taches/${idTacheEncode}`,
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

  // Supprimer ensuite le projet
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