// Adresse principale de notre API JSON Server.
const API_URL = "http://localhost:3000";

// Cette fonction récupère les projets et les tâches
// appartenant à l'utilisateur actuellement connecté.
export async function obtenirDonneesDashboard(
  // Reçoit l'identifiant de l'utilisateur connecté.
  utilisateurId
) {
  // Envoie une requête à JSON Server pour récupérer
  // uniquement les projets de l'utilisateur connecté.
  const reponseProjets = await fetch(
    // Construit l'adresse de la requête avec utilisateurId.
    `${API_URL}/projets?utilisateurId=${encodeURIComponent(
      // Sécurise l'identifiant avant de l'ajouter dans l'URL.
      utilisateurId
    )}`
  );

  // Vérifie si la requête des projets a échoué.
  if (!reponseProjets.ok) {
    // Arrête la fonction et retourne un message d'erreur.
    throw new Error(
      // Message qui pourra être affiché dans le Dashboard.
      "Impossible de charger les projets."
    );
  }

  // Transforme la réponse JSON en tableau JavaScript.
  const projets = await reponseProjets.json();

  // Envoie une requête pour récupérer toutes les tâches.
  const reponseTaches = await fetch(
    // Adresse de la collection des tâches.
    `${API_URL}/taches`
  );

  // Vérifie si la requête des tâches a échoué.
  if (!reponseTaches.ok) {
    // Arrête la fonction et retourne un message d'erreur.
    throw new Error(
      // Message qui pourra être affiché dans le Dashboard.
      "Impossible de charger les tâches."
    );
  }

  // Transforme la réponse JSON en tableau JavaScript.
  const toutesLesTaches =
    await reponseTaches.json();

  // Parcourt les projets de l'utilisateur.
  const identifiantsProjets = projets.map(
    // Pour chaque projet, récupère uniquement son identifiant.
    (projet) =>
      // Convertit l'identifiant en chaîne de caractères.
      String(projet.id)
  );

  // Filtre toutes les tâches récupérées.
  const taches = toutesLesTaches.filter(
    // Examine chaque tâche individuellement.
    (tache) =>
      // Vérifie si le projet de cette tâche appartient
      // à l'utilisateur actuellement connecté.
      identifiantsProjets.includes(
        // Convertit projetId en chaîne pour éviter
        // une différence entre 1 et "1".
        String(tache.projetId)
      )
  );

  // Retourne les données nécessaires au tableau de bord.
  return {
    // Liste des projets de l'utilisateur connecté.
    projets,

    // Liste des tâches appartenant à ces projets.
    taches,
  };
}