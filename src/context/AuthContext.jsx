// Importe les outils nécessaires depuis React.
import {
  // createContext permet de créer un contexte global.
  createContext,

  // useContext permet de lire les données du contexte.
  useContext,

  // useState permet de gérer l’utilisateur connecté.
  useState,
} from "react";

/*
 * Crée le contexte d’authentification.
 *
 * La valeur initiale est null parce que le contexte
 * n’est pas encore relié à AuthProvider.
 */
const AuthContext = createContext(null);

/*
 * Fonction qui récupère l’utilisateur précédemment
 * sauvegardé dans localStorage.
 */
function obtenirUtilisateurSauvegarde() {
  /*
   * Cherche dans localStorage la valeur enregistrée
   * sous la clé taskflow_utilisateur.
   */
  const utilisateurSauvegarde =
    localStorage.getItem(
      // Nom de la clé utilisée pour sauvegarder la session.
      "taskflow_utilisateur"
    );

  // Vérifie si aucune donnée n’a été trouvée.
  if (!utilisateurSauvegarde) {
    // Retourne null lorsqu’aucun utilisateur n’est sauvegardé.
    return null;
  }

  /*
   * Essaie de convertir le texte JSON
   * en objet JavaScript.
   */
  try {
    // JSON.parse transforme le texte en objet utilisateur.
    return JSON.parse(
      utilisateurSauvegarde
    );
  } catch {
    /*
     * Ce bloc est exécuté si les données enregistrées
     * ne sont pas un JSON valide.
     */

    // Supprime les données incorrectes de localStorage.
    localStorage.removeItem(
      // Clé contenant les données endommagées.
      "taskflow_utilisateur"
    );

    // Indique qu’aucun utilisateur valide n’a été trouvé.
    return null;
  }
}

/*
 * AuthProvider rend les informations d’authentification
 * disponibles dans toute l’application.
 */
export function AuthProvider({
  // children représente les composants placés
  // à l’intérieur de AuthProvider.
  children,
}) {
  /*
   * Crée l’état contenant l’utilisateur connecté.
   *
   * React appelle obtenirUtilisateurSauvegarde uniquement
   * pendant l’initialisation de cet état.
   */
  const [
    // Valeur actuelle de l’utilisateur.
    utilisateur,

    // Fonction permettant de modifier l’utilisateur.
    setUtilisateur,
  ] = useState(
    // Fonction d’initialisation de l’état.
    obtenirUtilisateurSauvegarde
  );

  /*
   * localStorage est lu directement pendant
   * l’initialisation de useState.
   *
   * Il n’existe donc aucun chargement asynchrone
   * à attendre dans cette version.
   */
  const chargementAuth = false;

  /*
   * Fonction utilisée après une connexion réussie.
   */
  const connecter = (
    // Reçoit l’utilisateur trouvé dans JSON Server.
    utilisateurConnecte
  ) => {
    /*
     * Crée une nouvelle version de l’utilisateur
     * sans conserver son mot de passe.
     */
    const utilisateurSansMotDePasse = {
      // Copie l’identifiant de l’utilisateur.
      id: utilisateurConnecte.id,

      // Copie son nom.
      nom: utilisateurConnecte.nom,

      // Copie son adresse électronique.
      email: utilisateurConnecte.email,

      // Copie son rôle dans l’application.
      role: utilisateurConnecte.role,
    };

    // Enregistre l’utilisateur dans l’état React.
    setUtilisateur(
      utilisateurSansMotDePasse
    );

    /*
     * Enregistre également l’utilisateur dans localStorage
     * afin de conserver la connexion après l’actualisation.
     */
    localStorage.setItem(
      // Nom de la clé utilisée dans localStorage.
      "taskflow_utilisateur",

      // Transforme l’objet utilisateur en texte JSON.
      JSON.stringify(
        utilisateurSansMotDePasse
      )
    );
  };

  /*
   * Fonction utilisée pour déconnecter l’utilisateur.
   */
  const deconnecter = () => {
    // Supprime l’utilisateur de l’état React.
    setUtilisateur(null);

    // Supprime également sa session de localStorage.
    localStorage.removeItem(
      // Nom de la clé à supprimer.
      "taskflow_utilisateur"
    );
  };

  /*
   * Fournit les informations d’authentification
   * à tous les composants enfants.
   */
  return (
    <>
      {/*
       * AuthContext.Provider distribue les données
       * contenues dans sa propriété value.
       */}
      <AuthContext.Provider
        value={{
          // Utilisateur actuellement connecté.
          utilisateur,

          // Indique si l’authentification est en chargement.
          chargementAuth,

          // Fonction permettant d’enregistrer une connexion.
          connecter,

          // Fonction permettant de terminer la session.
          deconnecter,
        }}
      >
        {/*
         * Affiche tous les composants placés
         * à l’intérieur de AuthProvider.
         */}
        {children}
      </AuthContext.Provider>
    </>
  );
}

/*
 * Hook personnalisé permettant d’accéder facilement
 * au contexte d’authentification.
 */
export function useAuth() {
  /*
   * Lit la valeur distribuée par AuthContext.Provider.
   */
  const contexte = useContext(
    AuthContext
  );

  /*
   * Vérifie si useAuth est appelé en dehors
   * du composant AuthProvider.
   */
  if (!contexte) {
    // Affiche une erreur destinée au développeur.
    throw new Error(
      // Explique comment utiliser correctement useAuth.
      "useAuth doit être utilisé dans AuthProvider."
    );
  }

  /*
   * Retourne utilisateur, chargementAuth,
   * connecter et deconnecter.
   */
  return contexte;
}