import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function BarreLaterale() {
  const { utilisateur, deconnecter } = useAuth();
  const naviguer = useNavigate();

  const gererDeconnexion = () => {
    deconnecter();
    naviguer("/connexion", { replace: true });
  };

  return (
    <aside className="barre-laterale">
      <div className="marque">
        <div className="logo-barre">TF</div>

        <div>
          <h2>TaskFlow</h2>
          <span>Gestion RH</span>
        </div>
      </div>

      <nav className="navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "lien actif" : "lien"
          }
        >
          Tableau de bord
        </NavLink>

        <NavLink
          to="/projets"
          className={({ isActive }) =>
            isActive ? "lien actif" : "lien"
          }
        >
          Projets RH
        </NavLink>
      </nav>

      <div className="profil-barre">
        <div className="avatar">
          {utilisateur?.nom
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div className="information-profil">
          <strong>{utilisateur?.nom}</strong>
          <span>{utilisateur?.role}</span>
        </div>

        <button
          type="button"
          className="bouton-deconnexion"
          onClick={gererDeconnexion}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default BarreLaterale;