// Importe les outils nécessaires depuis React Router.
import {
  // Navigate permet d’effectuer une redirection.
  Navigate,

  // useLocation permet de connaître la page actuelle.
  useLocation,
} from "react-router-dom";

// Importe le hook personnalisé d’authentification.
import { useAuth } from "../hooks/useAuth";

/*
 * Ce composant protège les pages privées.
 *
 * Il vérifie si un utilisateur est connecté
 * avant d’autoriser l’affichage de la page.
 */
function RoutePrivee({
  // children représente la page privée à afficher.
  children,
}) {
  /*
   * Récupère les informations d’authentification :
   *
   * utilisateur contient l’utilisateur connecté ;
   * chargementAuth indique si la vérification
   * de la connexion est toujours en cours.
   */
  const {
    utilisateur,
    chargementAuth,
  } = useAuth();

  // Récupère l’adresse actuellement demandée.
  const localisation = useLocation();

  /*
   * Vérifie si AuthContext est encore en train
   * de lire la session enregistrée dans localStorage.
   */
  if (chargementAuth) {
    // Affiche un message pendant la vérification.
    return (
      <p>
        Vérification de la connexion...
      </p>
    );
  }

  /*
   * Vérifie si aucun utilisateur n’est connecté.
   */
  if (!utilisateur) {
    // Redirige l’utilisateur vers la connexion.
    return (
      <Navigate
        // Adresse de destination.
        to="/connexion"

        // Remplace la page privée dans l’historique.
        // Cela évite de revenir immédiatement
        // sur la page protégée avec le bouton Retour.
        replace

        // Mémorise la page que l’utilisateur
        // voulait consulter avant la redirection.
        state={{
          // Enregistre l’adresse actuelle.
          depuis: localisation,
        }}
      />
    );
  }

  /*
   * Si l’utilisateur est connecté,
   * affiche normalement la page privée.
   */
  return children;
}

// Rend RoutePrivee importable dans App.jsx.
export default RoutePrivee;