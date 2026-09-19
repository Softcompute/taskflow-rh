export function calculerStatistiques(taches) {
  const total = taches.length;

  const aFaire = taches.filter(
    (tache) => tache.statut === "a_faire"
  ).length;

  const enCours = taches.filter(
    (tache) => tache.statut === "en_cours"
  ).length;

  const terminees = taches.filter(
    (tache) => tache.statut === "terminee"
  ).length;

  const pourcentageTermine =
    total === 0
      ? 0
      : Math.round((terminees / total) * 100);

  return {
    total,
    aFaire,
    enCours,
    terminees,
    pourcentageTermine,
  };
}

export function calculerAvancementProjet(
  projet,
  taches
) {
  const tachesProjet = taches.filter(
    (tache) =>
      String(tache.projetId) === String(projet.id)
  );

  const nombreTotal = tachesProjet.length;

  const nombreTerminees = tachesProjet.filter(
    (tache) => tache.statut === "terminee"
  ).length;

  const pourcentage =
    nombreTotal === 0
      ? 0
      : Math.round(
          (nombreTerminees / nombreTotal) * 100
        );

  return {
    ...projet,
    nombreTaches: nombreTotal,
    nombreTerminees,
    pourcentage,
  };
}

export function obtenirTachesUrgentes(
  taches,
  limite = 5
) {
  return [...taches]
    .filter(
      (tache) => tache.statut !== "terminee"
    )
    .sort((premiereTache, deuxiemeTache) => {
      const priorites = {
        haute: 1,
        moyenne: 2,
        basse: 3,
      };

      const comparaisonPriorite =
        priorites[premiereTache.priorite] -
        priorites[deuxiemeTache.priorite];

      if (comparaisonPriorite !== 0) {
        return comparaisonPriorite;
      }

      return (
        new Date(premiereTache.echeance) -
        new Date(deuxiemeTache.echeance)
      );
    })
    .slice(0, limite);
}