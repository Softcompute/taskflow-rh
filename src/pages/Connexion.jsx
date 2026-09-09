import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Connexion() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const { connecter } = useAuth();
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

      const reponse = await fetch(
        `http://localhost:3000/utilisateurs?email=${encodeURIComponent(email)}`
      );

      if (!reponse.ok) {
        throw new Error("Impossible de contacter le serveur.");
      }

      const utilisateurs = await reponse.json();

      const utilisateurTrouve = utilisateurs.find(
        (utilisateur) =>
          utilisateur.email.toLowerCase() === email.trim().toLowerCase() &&
          utilisateur.motDePasse === motDePasse
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

  return (
    <main className="page-auth">
      <section className="carte-auth">
        <div className="logo">TF</div>

        <h1>TaskFlow RH</h1>
        <p className="sous-titre">
          Connectez-vous pour gérer vos projets RH.
        </p>

        {erreur && <div className="message-erreur">{erreur}</div>}

        <form onSubmit={gererConnexion}>
          <div className="groupe-champ">
            <label htmlFor="email">Adresse e-mail</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(evenement) => setEmail(evenement.target.value)}
              placeholder="exemple@entreprise.com"
              autoComplete="email"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="motDePasse">Mot de passe</label>

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

          <button
            type="submit"
            className="bouton-principal"
            disabled={chargement}
          >
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="lien-auth">
          Vous n’avez pas de compte ?{" "}
          <Link to="/inscription">Créer un compte</Link>
        </p>
      </section>
    </main>
  );
}

export default Connexion;