import { Link } from "react-router-dom";

function NonTrouve() {
  return (
    <main className="page-non-trouve">
      <section className="carte-non-trouve">
        <span className="numero-erreur">
          404
        </span>

        <h1>Page introuvable</h1>

        <p>
          La page que vous recherchez n’existe pas
          ou a été déplacée.
        </p>

        <Link
          to="/dashboard"
          className="bouton-lien-principal"
        >
          Retour au tableau de bord
        </Link>
      </section>
    </main>
  );
}

export default NonTrouve;