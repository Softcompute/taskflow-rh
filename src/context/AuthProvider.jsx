import { useState } from "react";

import {
  AuthContext,
} from "./AuthContext";

function obtenirUtilisateurSauvegarde() {
  const utilisateurSauvegarde =
    localStorage.getItem(
      "taskflow_utilisateur"
    );

  if (!utilisateurSauvegarde) {
    return null;
  }

  try {
    return JSON.parse(utilisateurSauvegarde);
  } catch {
    localStorage.removeItem(
      "taskflow_utilisateur"
    );

    return null;
  }
}

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] =
    useState(obtenirUtilisateurSauvegarde);

  const chargementAuth = false;

  const connecter = (utilisateurConnecte) => {
    const utilisateurSansMotDePasse = {
      id: utilisateurConnecte.id,
      nom: utilisateurConnecte.nom,
      email: utilisateurConnecte.email,
      role: utilisateurConnecte.role,
    };

    setUtilisateur(
      utilisateurSansMotDePasse
    );

    localStorage.setItem(
      "taskflow_utilisateur",
      JSON.stringify(
        utilisateurSansMotDePasse
      )
    );
  };

  const deconnecter = () => {
    setUtilisateur(null);

    localStorage.removeItem(
      "taskflow_utilisateur"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        chargementAuth,
        connecter,
        deconnecter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;