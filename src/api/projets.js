// Définit l’adresse principale de l’API JSON Server.
const API_URL = "http://localhost:3000";

/*
 * Récupère les projets appartenant
 * à l’utilisateur actuellement connecté.
 */
export async function obtenirProjets(
  // Reçoit l’identifiant de l’utilisateur connecté.
  utilisateurId
) {
  // Vérifie si l’identifiant existe.
  if (!utilisateurId) {
    // Retourne un tableau vide lorsqu’il n’existe pas.
    return [];
  }

  // Sécurise l’identifiant avant son insertion dans l’URL.
  const idEncode =
    encodeURIComponent(utilisateurId);

  // Envoie une requête GET à JSON Server.
  const reponse = await fetch(
    // Demande uniquement les projets de cet utilisateur.
    `${API_URL}/projets?utilisateurId=${idEncode}`
  );

  // Vérifie si la requête a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction avec un message d’erreur.
    throw new Error(
      // Message qui pourra être affiché dans l’interface.
      "Impossible de charger les projets."
    );
  }

  // Transforme la réponse JSON en données JavaScript.
  return reponse.json();
}

/*
 * Récupère toutes les tâches enregistrées.
 */
export async function obtenirTaches() {
  // Envoie une requête GET vers la collection des tâches.
  const reponse = await fetch(
    // Adresse complète de la collection.
    `${API_URL}/taches`
  );

  // Vérifie si JSON Server a refusé la requête.
  if (!reponse.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message envoyé au composant React.
      "Impossible de charger les tâches."
    );
  }

  // Transforme la réponse JSON en tableau JavaScript.
  return reponse.json();
}

/*
 * Crée un nouveau projet dans JSON Server.
 */
export async function creerProjet(
  // Reçoit les informations du nouveau projet.
  nouveauProjet
) {
  // Vérifie que le projet contient utilisateurId.
  // Le symbole ?. évite une erreur si nouveauProjet est absent.
  if (!nouveauProjet?.utilisateurId) {
    // Arrête la création si utilisateurId est absent.
    throw new Error(
      // Explique précisément le problème rencontré.
      "L’identifiant de l’utilisateur est obligatoire."
    );
  }

  // Vérifie que le projet possède un nom non vide.
  // trim() retire les espaces placés au début et à la fin.
  if (!nouveauProjet?.nom?.trim()) {
    // Arrête la création lorsque le nom est vide.
    throw new Error(
      // Message d’erreur destiné à l’utilisateur.
      "Le nom du projet est obligatoire."
    );
  }

  // Envoie le nouveau projet à JSON Server.
  const reponse = await fetch(
    // Adresse utilisée pour créer un projet.
    `${API_URL}/projets`,
    {
      // POST signifie que nous créons une nouvelle donnée.
      method: "POST",

      // Définit les informations concernant le contenu envoyé.
      headers: {
        // Indique que les données sont envoyées en JSON.
        "Content-Type": "application/json",
      },

      // Convertit l’objet JavaScript en texte JSON.
      body: JSON.stringify(nouveauProjet),
    }
  );

  // Vérifie si la création a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction si le serveur retourne une erreur.
    throw new Error(
      // Message affichable dans la page des projets.
      "Impossible de créer le projet."
    );
  }

  // Récupère et retourne le projet créé par JSON Server.
  // Le projet retourné contient également son nouvel identifiant.
  return reponse.json();
}

/*
 * Modifie un projet déjà enregistré.
 */
export async function modifierProjet(
  // Identifiant du projet à modifier.
  id,

  // Nouvelles informations du projet.
  projetModifie
) {
  // Vérifie si l’identifiant du projet existe.
  if (!id) {
    // Arrête la modification si l’identifiant est absent.
    throw new Error(
      // Message expliquant l’erreur rencontrée.
      "L’identifiant du projet est obligatoire."
    );
  }

  // Sécurise l’identifiant avant son ajout dans l’URL.
  const idEncode = encodeURIComponent(id);

  // Envoie la demande de modification à JSON Server.
  const reponse = await fetch(
    // Adresse du projet qui doit être modifié.
    `${API_URL}/projets/${idEncode}`,
    {
      // PATCH modifie uniquement les propriétés envoyées.
      method: "PATCH",

      // Définit le type des données envoyées.
      headers: {
        // Indique que le contenu est au format JSON.
        "Content-Type": "application/json",
      },

      // Convertit les modifications en texte JSON.
      body: JSON.stringify(projetModifie),
    }
  );

  // Vérifie si la modification a échoué.
  if (!reponse.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message qui pourra être affiché dans l’application.
      "Impossible de modifier le projet."
    );
  }

  // Retourne le projet après sa modification.
  return reponse.json();
}

/*
 * Supprime un projet ainsi que toutes
 * les tâches associées à ce projet.
 */
export async function supprimerProjetEtTaches(
  // Reçoit l’identifiant du projet à supprimer.
  projetId
) {
  // Vérifie si l’identifiant du projet existe.
  if (!projetId) {
    // Arrête la suppression s’il n’existe pas.
    throw new Error(
      // Message expliquant la donnée manquante.
      "L’identifiant du projet est obligatoire."
    );
  }

  // Sécurise l’identifiant du projet pour l’URL.
  const projetIdEncode =
    encodeURIComponent(projetId);

  /*
   * Première étape :
   * récupérer toutes les tâches du projet.
   */

  // Envoie une requête pour chercher les tâches
  // qui possèdent le même projetId.
  const reponseTaches = await fetch(
    // Filtre les tâches avec le paramètre projetId.
    `${API_URL}/taches?projetId=${projetIdEncode}`
  );

  // Vérifie si la récupération des tâches a échoué.
  if (!reponseTaches.ok) {
    // Arrête la suppression du projet.
    throw new Error(
      // Explique que les tâches n’ont pas pu être récupérées.
      "Impossible de récupérer les tâches du projet."
    );
  }

  // Transforme la réponse JSON en tableau de tâches.
  const taches = await reponseTaches.json();

  /*
   * Deuxième étape :
   * supprimer toutes les tâches du projet.
   */

  // Attend que toutes les suppressions soient terminées.
  await Promise.all(
    // Parcourt le tableau des tâches.
    taches.map(
      // Exécute une suppression pour chaque tâche.
      async (tache) => {
        // Sécurise l’identifiant de la tâche pour l’URL.
        const idTacheEncode =
          encodeURIComponent(tache.id);

        // Envoie une requête pour supprimer la tâche.
        const reponseSuppression = await fetch(
          // Adresse précise de la tâche à supprimer.
          `${API_URL}/taches/${idTacheEncode}`,
          {
            // DELETE demande la suppression de la donnée.
            method: "DELETE",
          }
        );

        // Vérifie si la suppression de cette tâche a échoué.
        if (!reponseSuppression.ok) {
          // Interrompt l’opération avec une erreur précise.
          throw new Error(
            // Ajoute l’identifiant de la tâche dans le message.
            `Impossible de supprimer la tâche ${tache.id}.`
          );
        }
      }
    )
  );

  /*
   * Troisième étape :
   * supprimer le projet après ses tâches.
   */

  // Envoie une requête pour supprimer le projet.
  const reponseProjet = await fetch(
    // Adresse précise du projet à supprimer.
    `${API_URL}/projets/${projetIdEncode}`,
    {
      // DELETE demande la suppression du projet.
      method: "DELETE",
    }
  );

  // Vérifie si la suppression du projet a échoué.
  if (!reponseProjet.ok) {
    // Interrompt la fonction avec une erreur.
    throw new Error(
      // Message qui pourra être affiché dans l’interface.
      "Impossible de supprimer le projet."
    );
  }

  // Indique que toutes les suppressions ont réussi.
  return true;
}