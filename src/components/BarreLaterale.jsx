import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function BarreLaterale() {
  const { utilisateur, deconnecter } = useAuth();
  const naviguer = useNavigate();

  const gererDeconnexion = () => {
    deconnecter();

    naviguer("/connexion", {
      replace: true,
    });
  };

  return (
    <aside className="barre-laterale">
      <div className="marque">
        <div className="logo-barre">
          TF
        </div>

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

        {utilisateur?.role ===
        "Responsable RH" ? (
          <NavLink
            to="/projets"
            className={({ isActive }) =>
              isActive
                ? "lien actif"
                : "lien"
            }
          >
            Tous les projets RH
          </NavLink>
        ) : (
          <NavLink
            to="/projets"
            className={({ isActive }) =>
              isActive
                ? "lien actif"
                : "lien"
            }
          >
            Mes projets RH
          </NavLink>
        )}
      </nav>

      <div className="profil-barre">
        <div className="avatar">
          {utilisateur?.nom
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div className="information-profil">
          <strong>
            {utilisateur?.nom}
          </strong>

          <span>
            {utilisateur?.role}
          </span>
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