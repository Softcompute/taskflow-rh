import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoutePrivee({ children }) {
  const { utilisateur, chargementAuth } = useAuth();
  const localisation = useLocation();

  if (chargementAuth) {
    return <p>Vérification de la connexion...</p>;
  }

  if (!utilisateur) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ depuis: localisation }}
      />
    );
  }

  return children;
}

export default RoutePrivee;