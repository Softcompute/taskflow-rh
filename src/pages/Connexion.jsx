import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Connexion() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const { utilisateur, connecter } = useAuth();
  const naviguer = useNavigate();
  const localisation = useLocation();

  const destination =
    localisation.state?.depuis?.pathname || "/dashboard";

  const gererConnexion = async (evenement) => {
    evenement.preventDefault();
    setErreur("");

    if (!email.trim() || !motDePasse.trim()) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setChargement(true);

      const adresse =
        "http://localhost:3000/utilisateurs" +
        `?email=${encodeURIComponent(email.trim())}`;

      const reponse = await fetch(adresse);

      if (!reponse.ok) {
        throw new Error("Impossible de contacter le serveur.");
      }

      const utilisateurs = await reponse.json();

      const utilisateurTrouve = utilisateurs.find(
        (element) =>
          element.email.toLowerCase() ===
            email.trim().toLowerCase() &&
          element.motDePasse === motDePasse
      );

      if (!utilisateurTrouve) {
        setErreur("E-mail ou mot de passe incorrect.");
        return;
      }

      connecter(utilisateurTrouve);
      naviguer(destination, { replace: true });
    } catch (erreurRequete) {
      setErreur(erreurRequete.message);
    } finally {
      setChargement(false);
    }
  };

  if (utilisateur) {
    return (
      <main>
        <h1>Vous êtes déjà connecté</h1>

        <button
          type="button"
          onClick={() => naviguer("/dashboard")}
        >
          Aller au tableau de bord
        </button>
      </main>
    );
  }

  return (
    <main className="page-connexion">
      <section className="carte-connexion">
        <h1>Connexion</h1>

        <p>Connectez-vous à TaskFlow RH.</p>

        {erreur && (
          <p className="message-erreur">{erreur}</p>
        )}

        <form onSubmit={gererConnexion}>
          <div className="groupe-champ">
            <label htmlFor="email">Adresse e-mail</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(evenement) =>
                setEmail(evenement.target.value)
              }
              placeholder="gael@taskflow-rh.cd"
              autoComplete="email"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="motDePasse">
              Mot de passe
            </label>

            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(evenement) =>
                setMotDePasse(evenement.target.value)
              }
              placeholder="Votre mot de passe"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p>
          Vous n’avez pas de compte ?{" "}
          <Link to="/inscription">
            Créer un compte
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Connexion;