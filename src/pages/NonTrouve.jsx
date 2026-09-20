// Importe Link depuis React Router.
// Link permet de changer de page sans recharger l’application.
import { Link } from "react-router-dom";

/*
 * Composant affiché lorsque l’adresse demandée
 * ne correspond à aucune route de l’application.
 */
function NonTrouve() {
  // Retourne l’interface de la page d’erreur 404.
  return (
    // Conteneur principal de la page.
    <main className="page-non-trouve">
      {/* Carte contenant les informations de l’erreur. */}
      <section className="carte-non-trouve">
        {/* Affiche le numéro de l’erreur HTTP. */}
        <span className="numero-erreur">
          {/* 404 signifie que la page est introuvable. */}
          404
        </span>

        {/* Titre principal de la page d’erreur. */}
        <h1>
          Page introuvable
        </h1>

        {/* Explication destinée à l’utilisateur. */}
        <p>
          La page que vous recherchez n’existe pas
          ou a été déplacée.
        </p>

        {/*
         * Lien permettant de retourner
         * vers une page valide de l’application.
         */}
        <Link
          // Adresse vers laquelle l’utilisateur sera envoyé.
          to="/dashboard"

          // Classe utilisée pour présenter le lien comme un bouton.
          className="bouton-lien-principal"
        >
          {/* Texte visible du lien. */}
          Retour au tableau de bord
        </Link>
      </section>
    </main>
  );
}

// Rend le composant disponible dans App.jsx.
export default NonTrouve;