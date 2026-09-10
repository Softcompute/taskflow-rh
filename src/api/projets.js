const API_URL = "http://localhost:3000";

export async function obtenirProjets(utilisateurId) {
  const reponse = await fetch(
    `${API_URL}/projets?utilisateurId=${utilisateurId}`
  );

  if (!reponse.ok) {
    throw new Error("Impossible de charger les projets.");
  }

  return reponse.json();
}

export async function obtenirTaches() {
  const reponse = await fetch(`${API_URL}/taches`);

  if (!reponse.ok) {
    throw new Error("Impossible de charger les tâches.");
  }

  return reponse.json();
}

export async function creerProjet(nouveauProjet) {
  const reponse = await fetch(`${API_URL}/projets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nouveauProjet),
  });

  if (!reponse.ok) {
    throw new Error("Impossible de créer le projet.");
  }

  return reponse.json();
}

export async function modifierProjet(id, projetModifie) {
  const reponse = await fetch(
    `${API_URL}/projets/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projetModifie),
    }
  );

  if (!reponse.ok) {
    throw new Error("Impossible de modifier le projet.");
  }

  return reponse.json();
}

export async function supprimerProjetEtTaches(projetId) {
  const reponseTaches = await fetch(
    `${API_URL}/taches?projetId=${projetId}`
  );

  if (!reponseTaches.ok) {
    throw new Error(
      "Impossible de récupérer les tâches du projet."
    );
  }

  const taches = await reponseTaches.json();

  await Promise.all(
    taches.map(async (tache) => {
      const reponseSuppression = await fetch(
        `${API_URL}/taches/${tache.id}`,
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

  const reponseProjet = await fetch(
    `${API_URL}/projets/${projetId}`,
    {
      method: "DELETE",
    }
  );

  if (!reponseProjet.ok) {
    throw new Error("Impossible de supprimer le projet.");
  }
}