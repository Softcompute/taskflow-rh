// Importe les outils nécessaires depuis React Router.
import {
  // NavLink crée un lien et détecte s’il est actif.
  NavLink,

  // useNavigate permet de changer de page avec JavaScript.
  useNavigate,
} from "react-router-dom";

// Importe le hook personnalisé d’authentification.
import { useAuth } from "../context/AuthContext";

/*
 * Composant qui affiche la barre latérale
 * des pages privées de TaskFlow RH.
 */
function BarreLaterale() {
  // Récupère l’utilisateur connecté et la fonction
  // de déconnexion depuis AuthContext.
  const { utilisateur, deconnecter } = useAuth();

  // Crée une fonction permettant de naviguer
  // vers une autre page avec React Router.
  const naviguer = useNavigate();

  /*
   * Fonction exécutée lorsque l’utilisateur
   * clique sur le bouton Déconnexion.
   */
  const gererDeconnexion = () => {
    // Supprime l’utilisateur du contexte et de localStorage.
    deconnecter();

    // Redirige l’utilisateur vers la page de connexion.
    naviguer(
      // Adresse de la page de connexion.
      "/connexion",

      // Remplace la page actuelle dans l’historique.
      // L’utilisateur ne pourra pas revenir à la page
      // privée avec le bouton Retour du navigateur.
      { replace: true }
    );
  };

  // Retourne l’interface de la barre latérale.
  return (
    // aside représente une zone secondaire de la page.
    <aside className="barre-laterale">
      {/* Zone contenant le logo et le nom de l’application. */}
      <div className="marque">
        {/* Petit logo contenant les initiales de TaskFlow. */}
        <div className="logo-barre">
          {/* Initiales affichées dans le logo. */}
          TF
        </div>

        {/* Conteneur du nom et du sous-titre. */}
        <div>
          {/* Nom principal de l’application. */}
          <h2>TaskFlow</h2>

          {/* Domaine d’utilisation de l’application. */}
          <span>Gestion RH</span>
        </div>
      </div>

      {/* Zone contenant les liens de navigation. */}
      <nav className="navigation">
        {/* Lien permettant d’accéder au tableau de bord. */}
        <NavLink
          // Adresse vers laquelle le lien doit naviguer.
          to="/dashboard"

          // Définit automatiquement la classe CSS du lien.
          className={({
            // isActive indique si cette route est actuellement ouverte.
            isActive,
          }) =>
            // Utilise deux classes si le lien est actif.
            isActive
              ? "lien actif"
              : "lien"
          }
        >
          {/* Texte visible du premier lien. */}
          Tableau de bord
        </NavLink>

        {/* Lien permettant d’accéder aux projets RH. */}
        <NavLink
          // Adresse de la page des projets.
          to="/projets"

          // Définit la classe selon l’état du lien.
          className={({
            // Indique si la page Projets est ouverte.
            isActive,
          }) =>
            // Ajoute la classe actif lorsque la route correspond.
            isActive
              ? "lien actif"
              : "lien"
          }
        >
          {/* Texte visible du deuxième lien. */}
          Projets RH
        </NavLink>
      </nav>

      {/* Zone affichant le profil de l’utilisateur connecté. */}
      <div className="profil-barre">
        {/* Cercle utilisé comme avatar de l’utilisateur. */}
        <div className="avatar">
          {
            // Vérifie que l’utilisateur et son nom existent.
            utilisateur?.nom
              // Récupère la première lettre du nom.
              ?.charAt(0)
              // Transforme cette première lettre en majuscule.
              .toUpperCase()
          }
        </div>

        {/* Conteneur du nom et du rôle de l’utilisateur. */}
        <div className="information-profil">
          {/* Affiche le nom de l’utilisateur connecté. */}
          <strong>
            {utilisateur?.nom}
          </strong>

          {/* Affiche son rôle dans l’application. */}
          <span>
            {utilisateur?.role}
          </span>
        </div>

        {/* Bouton utilisé pour quitter la session. */}
        <button
          // Empêche le bouton de se comporter comme
          // un bouton d’envoi de formulaire.
          type="button"

          // Classe utilisée pour appliquer le style CSS.
          className="bouton-deconnexion"

          // Exécute la fonction de déconnexion au clic.
          onClick={gererDeconnexion}
        >
          {/* Texte visible dans le bouton. */}
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

// Rend le composant disponible dans les autres fichiers.
export default BarreLaterale;