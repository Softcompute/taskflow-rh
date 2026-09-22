const API_URL = "http://localhost:3000";

export async function obtenirDonneesDashboard(
  utilisateurId,
  roleUtilisateur
) {
  if (!utilisateurId) {
    return {
      projets: [],
      taches: [],
    };
  }

  /*
   * Le Responsable RH récupère tous les projets.
   * Les autres utilisateurs récupèrent uniquement
   * les projets qu’ils ont créés.
   */
  const adresseProjets =
    roleUtilisateur === "Responsable RH"
      ? `${API_URL}/projets`
      : `${API_URL}/projets?utilisateurId=${encodeURIComponent(
          utilisateurId
        )}`;

  /*
   * Les deux requêtes sont exécutées ensemble :
   * une pour les projets et une pour les tâches.
   */
  const [reponseProjets, reponseTaches] =
    await Promise.all([
      fetch(adresseProjets),
      fetch(`${API_URL}/taches`),
    ]);

  if (!reponseProjets.ok) {
    throw new Error(
      "Impossible de charger les projets."
    );
  }

  if (!reponseTaches.ok) {
    throw new Error(
      "Impossible de charger les tâches."
    );
  }

  const projets = await reponseProjets.json();
  const toutesLesTaches =
    await reponseTaches.json();

  /*
   * Transforme les identifiants des projets
   * visibles en chaînes de caractères.
   */
  const identifiantsProjets = projets.map(
    (projet) => String(projet.id)
  );

  /*
   * Conserve seulement les tâches qui appartiennent
   * aux projets visibles par l’utilisateur.
   */
  const taches = toutesLesTaches.filter(
    (tache) =>
      identifiantsProjets.includes(
        String(tache.projetId)
      )
  );

  return {
    projets,
    taches,
  };
}