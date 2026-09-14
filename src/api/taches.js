const API_URL = "http://localhost:3000";

export async function obtenirProjet(projetId) {
  const reponse = await fetch(
    `${API_URL}/projets/${projetId}`
  );

  if (!reponse.ok) {
    throw new Error("Projet introuvable.");
  }

  return reponse.json();
}

export async function obtenirTachesProjet(projetId) {
  const reponse = await fetch(
    `${API_URL}/taches?projetId=${projetId}`
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de charger les tâches."
    );
  }

  return reponse.json();
}

export async function creerTache(nouvelleTache) {
  const reponse = await fetch(`${API_URL}/taches`, {
    method: "POST",
    headers: {
      "Content-Type": "/json",
    },
    body: JSON.stringify(nouvelleTache),
  });

  if (!reponse.ok) {
    throw new Error("Impossible de créer la tâche.");
  }

  return reponse.json();
}

export async function modifierTache(
  tacheId,
  modifications
) {
  const reponse = await fetch(
    `${API_URL}/taches/${tacheId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modifications),
    }
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de modifier la tâche."
    );
  }

  return reponse.json();
}

export async function supprimerTache(tacheId) {
  const reponse = await fetch(
    `${API_URL}/taches/${tacheId}`,
    {
      method: "DELETE",
    }
  );

  if (!reponse.ok) {
    throw new Error(
      "Impossible de supprimer la tâche."
    );
  }
}