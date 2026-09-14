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

function LigneTache({
  tache,
  onModifier,
  onSupprimer,
  onChangerStatut,
}) {
  const obtenirStatutSuivant = () => {
    if (tache.statut === "a_faire") {
      return "en_cours";
    }

    if (tache.statut === "en_cours") {
      return "terminee";
    }

    return "a_faire";
  };

  const statutSuivant = obtenirStatutSuivant();

  return (
    <article className="ligne-tache">
      <div className="contenu-tache">
        <div className="badges-tache">
          <span
            className={`badge-statut statut-${tache.statut}`}
          >
            {nomsStatuts[tache.statut]}
          </span>

          <span
            className={`badge-priorite priorite-${tache.priorite}`}
          >
            {nomsPriorites[tache.priorite]}
          </span>
        </div>

        <h3>{tache.titre}</h3>

        <p>
          {tache.description ||
            "Aucune description disponible."}
        </p>

        <div className="dates-tache">
          <span>
            Échéance :{" "}
            <strong>{tache.echeance}</strong>
          </span>

          <span>
            Modifiée le :{" "}
            <strong>{tache.modifieLe}</strong>
          </span>
        </div>
      </div>

      <div className="actions-tache">
        <button
          type="button"
          className="bouton-statut"
          onClick={() =>
            onChangerStatut(tache, statutSuivant)
          }
        >
          Passer à : {nomsStatuts[statutSuivant]}
        </button>

        <button
          type="button"
          className="bouton-modifier"
          onClick={() => onModifier(tache)}
        >
          Modifier
        </button>

        <button
          type="button"
          className="bouton-supprimer"
          onClick={() => onSupprimer(tache)}
        >
          Supprimer
        </button>
      </div>
    </article>
  );
}

export default LigneTache;