import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Inscription() {
  const [formulaire, setFormulaire] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    role: "Agent RH",
  });

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const naviguer = useNavigate();

  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  };

  const gererInscription = async (evenement) => {
    evenement.preventDefault();
    setErreur("");

    if (
      !formulaire.nom.trim() ||
      !formulaire.email.trim() ||
      !formulaire.motDePasse.trim()
    ) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setChargement(true);

      const verification = await fetch(
        `http://localhost:3000/utilisateurs?email=${encodeURIComponent(
          formulaire.email
        )}`
      );

      if (!verification.ok) {
        throw new Error("Impossible de vérifier l’adresse e-mail.");
      }

      const utilisateursExistants = await verification.json();

      if (utilisateursExistants.length > 0) {
        setErreur("Cette adresse e-mail est déjà utilisée.");
        return;
      }

      const reponse = await fetch(
        "http://localhost:3000/utilisateurs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formulaire,
            nom: formulaire.nom.trim(),
            email: formulaire.email.trim().toLowerCase(),
          }),
        }
      );

      if (!reponse.ok) {
        throw new Error("Impossible de créer le compte.");
      }

      naviguer("/connexion");
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

        <h1>Créer un compte</h1>
        <p className="sous-titre">
          Inscrivez-vous pour utiliser TaskFlow RH.
        </p>

        {erreur && <div className="message-erreur">{erreur}</div>}

        <form onSubmit={gererInscription}>
          <div className="groupe-champ">
            <label htmlFor="nom">Nom complet</label>

            <input
              id="nom"
              name="nom"
              type="text"
              value={formulaire.nom}
              onChange={modifierChamp}
              placeholder="Votre nom complet"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="email">Adresse e-mail</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formulaire.email}
              onChange={modifierChamp}
              placeholder="exemple@entreprise.com"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="motDePasse">Mot de passe</label>

            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              value={formulaire.motDePasse}
              onChange={modifierChamp}
              placeholder="Choisissez un mot de passe"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="role">Fonction</label>

            <select
              id="role"
              name="role"
              value={formulaire.role}
              onChange={modifierChamp}
            >
              <option value="Agent RH">Agent RH</option>
              <option value="Responsable RH">Responsable RH</option>
              <option value="Gestionnaire RH">Gestionnaire RH</option>
            </select>
          </div>

          <button
            type="submit"
            className="bouton-principal"
            disabled={chargement}
          >
            {chargement ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="lien-auth">
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}

export default Inscription;