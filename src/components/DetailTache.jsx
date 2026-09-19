const nomsStatuts = {
  a_faire: "À faire",
  en_cours: "En cours",
  terminee: "Terminée",
};

const nomsPriorites = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
};

function DetailTache({ tache, onFermer }) {
  if (!tache) {
    return null;
  }

  return (
    <div
      className="fond-modale"
      onClick={onFermer}
      role="presentation"
    >
      <article
        className="modale-detail"
        onClick={(evenement) =>
          evenement.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-detail-tache"
      >
        <header className="entete-modale">
          <div>
            <p className="petit-titre">
              Détail de la tâche
            </p>

            <h2 id="titre-detail-tache">
              {tache.titre}
            </h2>
          </div>

          <button
            type="button"
            className="bouton-fermer"
            onClick={onFermer}
            aria-label="Fermer le détail"
          >
            ×
          </button>
        </header>

        <div className="badges-tache">
          <span
            className={`badge-statut statut-${tache.statut}`}
          >
            {nomsStatuts[tache.statut] ||
              tache.statut}
          </span>

          <span
            className={`badge-priorite priorite-${tache.priorite}`}
          >
            Priorité :{" "}
            {nomsPriorites[tache.priorite] ||
              tache.priorite}
          </span>
        </div>

        <section className="bloc-detail">
          <h3>Description</h3>

          <p>
            {tache.description ||
              "Aucune description disponible."}
          </p>
        </section>

        <div className="grille-detail">
          <section className="bloc-detail">
            <h3>Date de création</h3>

            <p>
              {tache.creeLe || "Non indiquée"}
            </p>
          </section>

          <section className="bloc-detail">
            <h3>Date d’échéance</h3>

            <p>
              {tache.echeance || "Non indiquée"}
            </p>
          </section>

          <section className="bloc-detail">
            <h3>Dernière modification</h3>

            <p>
              {tache.modifieLe || "Non indiquée"}
            </p>
          </section>
        </div>

        <footer className="pied-modale">
          <button
            type="button"
            className="bouton-principal"
            onClick={onFermer}
          >
            Fermer
          </button>
        </footer>
      </article>
    </div>
  );
}

export default DetailTache;