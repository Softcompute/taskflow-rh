const API_URL = "http://localhost:3000";

export async function obtenirDonneesDashboard(
  utilisateurId
) {
  const reponseProjets = await fetch(
    `${API_URL}/projets?utilisateurId=${encodeURIComponent(
      utilisateurId
    )}`
  );

  if (!reponseProjets.ok) {
    throw new Error(
      "Impossible de charger les projets."
    );
  }

  const projets = await reponseProjets.json();

  const reponseTaches = await fetch(
    `${API_URL}/taches`
  );

  if (!reponseTaches.ok) {
    throw new Error(
      "Impossible de charger les tâches."
    );
  }

  const toutesLesTaches =
    await reponseTaches.json();

  const identifiantsProjets = projets.map(
    (projet) => String(projet.id)
  );

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