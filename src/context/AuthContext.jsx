import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargementAuth, setChargementAuth] = useState(true);

  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem(
      "taskflow_utilisateur"
    );

    if (utilisateurSauvegarde) {
      try {
        setUtilisateur(JSON.parse(utilisateurSauvegarde));
      } catch {
        localStorage.removeItem("taskflow_utilisateur");
      }
    }

    setChargementAuth(false);
  }, []);

  const connecter = (utilisateurConnecte) => {
    const utilisateurSansMotDePasse = {
      id: utilisateurConnecte.id,
      nom: utilisateurConnecte.nom,
      email: utilisateurConnecte.email,
      role: utilisateurConnecte.role,
    };

    setUtilisateur(utilisateurSansMotDePasse);

    localStorage.setItem(
      "taskflow_utilisateur",
      JSON.stringify(utilisateurSansMotDePasse)
    );
  };

  const deconnecter = () => {
    setUtilisateur(null);
    localStorage.removeItem("taskflow_utilisateur");
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

export function useAuth() {
  const contexte = useContext(AuthContext);

  if (!contexte) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider."
    );
  }

  return contexte;
}