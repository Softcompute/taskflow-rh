// Définit l’adresse principale de l’API JSON Server.
const API_URL = "http://localhost:3000";

/*
 * Récupère un projet précis grâce à son identifiant.
 */
export async function obtenirProjet(
  // Reçoit l’identifiant du projet recherché.
  projetId
) {
  // Envoie une requête GET vers JSON Server.
  const reponse = await fetch(
    // Construit l’adresse du projet recherché.
    // encodeURIComponent sécurise l’identifiant dans l’URL.
    `${API_URL}/projets/${encodeURIComponent(
      projetId
    )}`
  );

  // Vérifie si la requête a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction si le projet n’existe pas.
    throw new Error(
      // Message qui pourra être affiché dans l’application.
      "Projet introuvable."
    );
  }

  // Transforme la réponse JSON en objet JavaScript.
  return reponse.json();
}

/*
 * Récupère toutes les tâches associées
 * à un projet précis.
 */
export async function obtenirTachesProjet(
  // Reçoit l’identifiant du projet.
  projetId
) {
  // Envoie une requête GET vers la collection des tâches.
  const reponse = await fetch(
    // Le paramètre projetId filtre les tâches du projet.
    `${API_URL}/taches?projetId=${encodeURIComponent(
      // Sécurise l’identifiant avant son insertion dans l’URL.
      projetId
    )}`
  );

  // Vérifie si la récupération des tâches a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message destiné à l’utilisateur.
      "Impossible de charger les tâches."
    );
  }

  // Transforme la réponse JSON en tableau JavaScript.
  return reponse.json();
}

/*
 * Crée une nouvelle tâche dans JSON Server.
 */
export async function creerTache(
  // Reçoit toutes les informations de la nouvelle tâche.
  nouvelleTache
) {
  // Envoie une requête vers la collection des tâches.
  const reponse = await fetch(
    // Adresse utilisée pour créer une tâche.
    `${API_URL}/taches`,
    {
      // POST signifie que nous créons une nouvelle donnée.
      method: "POST",

      // Définit les informations concernant le contenu envoyé.
      headers: {
        // Indique que les données sont envoyées au format JSON.
        "Content-Type": "application/json",
      },

      // Convertit l’objet JavaScript en texte JSON.
      body: JSON.stringify(nouvelleTache),
    }
  );

  // Vérifie si la création a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message qui pourra être affiché dans le formulaire.
      "Impossible de créer la tâche."
    );
  }

  // Retourne la tâche créée avec son nouvel identifiant.
  return reponse.json();
}

/*
 * Modifie une tâche existante.
 */
export async function modifierTache(
  // Identifiant de la tâche à modifier.
  tacheId,

  // Objet contenant les propriétés à modifier.
  modifications
) {
  // Envoie une requête vers la tâche concernée.
  const reponse = await fetch(
    // Construit l’adresse de la tâche à modifier.
    `${API_URL}/taches/${encodeURIComponent(
      // Sécurise l’identifiant de la tâche.
      tacheId
    )}`,
    {
      // PATCH modifie uniquement les propriétés envoyées.
      method: "PATCH",

      // Définit le type des informations envoyées.
      headers: {
        // Indique que les données sont au format JSON.
        "Content-Type": "application/json",
      },

      // Transforme les modifications en texte JSON.
      body: JSON.stringify(modifications),
    }
  );

  // Vérifie si la modification a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message qui pourra être affiché dans l’interface.
      "Impossible de modifier la tâche."
    );
  }

  // Transforme et retourne la tâche après modification.
  return reponse.json();
}

/*
 * Supprime une tâche grâce à son identifiant.
 */
export async function supprimerTache(
  // Reçoit l’identifiant de la tâche à supprimer.
  tacheId
) {
  // Envoie une requête vers la tâche concernée.
  const reponse = await fetch(
    // Construit l’adresse de la tâche à supprimer.
    `${API_URL}/taches/${encodeURIComponent(
      // Sécurise l’identifiant avant son insertion dans l’URL.
      tacheId
    )}`,
    {
      // DELETE demande la suppression de la donnée.
      method: "DELETE",
    }
  );

  // Vérifie si la suppression a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message qui pourra être affiché dans l’application.
      "Impossible de supprimer la tâche."
    );
  }

  // Indique que la suppression a réussi.
  return true;
}