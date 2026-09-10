import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Inscription() {
  const [formulaire, setFormulaire] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    confirmation: "",
    role: "Agent RH",
  });

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

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
    setSucces("");

    const nomNettoye = formulaire.nom.trim();
    const emailNettoye = formulaire.email
      .trim()
      .toLowerCase();

    if (
      !nomNettoye ||
      !emailNettoye ||
      !formulaire.motDePasse ||
      !formulaire.confirmation
    ) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    if (formulaire.motDePasse.length < 4) {
      setErreur(
        "Le mot de passe doit contenir au moins 4 caractères."
      );
      return;
    }

    if (
      formulaire.motDePasse !== formulaire.confirmation
    ) {
      setErreur(
        "Les deux mots de passe ne correspondent pas."
      );
      return;
    }

    try {
      setChargement(true);

      const verification = await fetch(
        `http://localhost:3000/utilisateurs?email=${encodeURIComponent(
          emailNettoye
        )}`
      );

      if (!verification.ok) {
        throw new Error(
          "Impossible de vérifier l'adresse e-mail."
        );
      }

      const utilisateursExistants =
        await verification.json();

      if (utilisateursExistants.length > 0) {
        setErreur(
          "Un compte utilise déjà cette adresse e-mail."
        );
        return;
      }

      const nouvelUtilisateur = {
        nom: nomNettoye,
        email: emailNettoye,
        motDePasse: formulaire.motDePasse,
        role: formulaire.role,
      };

      const reponse = await fetch(
        "http://localhost:3000/utilisateurs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nouvelUtilisateur),
        }
      );

      if (!reponse.ok) {
        throw new Error(
          "Impossible de créer votre compte."
        );
      }

      setSucces("Compte créé avec succès.");

      setTimeout(() => {
        naviguer("/connexion");
      }, 1000);
    } catch (erreurRequete) {
      setErreur(erreurRequete.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className="page-auth">
      <section className="carte-auth">
        <div className="logo-auth">TF</div>

        <h1>Créer un compte</h1>

        <p className="sous-titre">
          Inscrivez-vous pour utiliser TaskFlow RH.
        </p>

        {erreur && (
          <div className="message-erreur">
            {erreur}
          </div>
        )}

        {succes && (
          <div className="message-succes">
            {succes}
          </div>
        )}

        <form onSubmit={gererInscription}>
          <div className="groupe-champ">
            <label htmlFor="nom">Nom complet</label>

            <input
              id="nom"
              name="nom"
              type="text"
              value={formulaire.nom}
              onChange={modifierChamp}
              placeholder="Exemple : Gael Ekofo"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="email">
              Adresse e-mail
            </label>

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
            <label htmlFor="role">
              Fonction dans le département
            </label>

            <select
              id="role"
              name="role"
              value={formulaire.role}
              onChange={modifierChamp}
            >
              <option value="Agent RH">
                Agent RH
              </option>

              <option value="Gestionnaire RH">
                Gestionnaire RH
              </option>

              <option value="Responsable RH">
                Responsable RH
              </option>
            </select>
          </div>

          <div className="groupe-champ">
            <label htmlFor="motDePasse">
              Mot de passe
            </label>

            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              value={formulaire.motDePasse}
              onChange={modifierChamp}
              placeholder="Minimum 4 caractères"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="confirmation">
              Confirmer le mot de passe
            </label>

            <input
              id="confirmation"
              name="confirmation"
              type="password"
              value={formulaire.confirmation}
              onChange={modifierChamp}
              placeholder="Retapez le mot de passe"
            />
          </div>

          <button
            type="submit"
            className="bouton-principal"
            disabled={chargement}
          >
            {chargement
              ? "Création en cours..."
              : "Créer mon compte"}
          </button>
        </form>

        <p className="lien-auth">
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Inscription;