// Importe useState pour gérer les valeurs du formulaire.
import { useState } from "react";

// Importe les outils nécessaires depuis React Router.
import {
  // Link permet de naviguer sans recharger la page.
  Link,

  // useLocation permet de connaître la page précédente.
  useLocation,

  // useNavigate permet de rediriger avec JavaScript.
  useNavigate,
} from "react-router-dom";

// Importe le hook qui donne accès à l’authentification.
import { useAuth } from "../hooks/useAuth";

/*
 * Composant représentant la page de connexion.
 */
function Connexion() {
  // État contenant l’adresse électronique saisie.
  const [
    email,
    setEmail,
  ] = useState("");

  // État contenant le mot de passe saisi.
  const [
    motDePasse,
    setMotDePasse,
  ] = useState("");

  // État indiquant si la connexion est en cours.
  const [
    chargement,
    setChargement,
  ] = useState(false);

  // État contenant un éventuel message d’erreur.
  const [
    erreur,
    setErreur,
  ] = useState("");

  /*
   * Récupère depuis AuthContext :
   *
   * utilisateur : l’utilisateur actuellement connecté ;
   * connecter : la fonction qui enregistre la connexion.
   */
  const {
    utilisateur,
    connecter,
  } = useAuth();

  // Crée la fonction utilisée pour changer de page.
  const naviguer = useNavigate();

  // Récupère les informations de l’adresse actuelle.
  const localisation = useLocation();

  /*
   * Détermine la page vers laquelle l’utilisateur
   * sera envoyé après sa connexion.
   */
  const destination =
    // Utilise la page demandée avant la connexion si elle existe.
    localisation.state?.depuis?.pathname ||
    // Sinon, redirige vers le tableau de bord.
    "/dashboard";

  /*
   * Fonction exécutée lors de l’envoi
   * du formulaire de connexion.
   */
  const gererConnexion = async (
    // Reçoit l’événement d’envoi du formulaire.
    evenement
  ) => {
    // Empêche le rechargement automatique de la page.
    evenement.preventDefault();

    // Efface un éventuel ancien message d’erreur.
    setErreur("");

    /*
     * Vérifie si l’adresse électronique
     * ou le mot de passe est vide.
     */
    if (
      // trim() supprime les espaces inutiles.
      !email.trim() ||
      !motDePasse.trim()
    ) {
      // Affiche un message demandant de compléter le formulaire.
      setErreur(
        "Veuillez remplir tous les champs."
      );

      // Arrête immédiatement la fonction.
      return;
    }

    /*
     * Essaie de rechercher l’utilisateur
     * dans JSON Server.
     */
    try {
      // Indique que la connexion commence.
      setChargement(true);

      /*
       * Construit l’adresse utilisée pour rechercher
       * un utilisateur avec son adresse électronique.
       */
      const adresse =
        // Adresse de la collection des utilisateurs.
        "http://localhost:3000/utilisateurs" +

        // Ajoute l’adresse saisie comme paramètre de recherche.
        `?email=${encodeURIComponent(
          // Retire les espaces avant de sécuriser l’adresse.
          email.trim()
        )}`;

      // Envoie la requête GET à JSON Server.
      const reponse = await fetch(adresse);

      // Vérifie si la communication avec le serveur a échoué.
      if (!reponse.ok) {
        // Interrompt la connexion avec une erreur.
        throw new Error(
          "Impossible de contacter le serveur."
        );
      }

      // Transforme la réponse JSON en tableau JavaScript.
      const utilisateurs =
        await reponse.json();

      /*
       * Cherche l’utilisateur qui possède
       * la bonne adresse et le bon mot de passe.
       */
      const utilisateurTrouve =
        utilisateurs.find(
          // Examine chaque utilisateur reçu.
          (element) =>
            // Compare les adresses sans tenir compte des majuscules.
            element.email.toLowerCase() ===
              email.trim().toLowerCase() &&

            // Vérifie ensuite le mot de passe.
            element.motDePasse ===
              motDePasse
        );

      // Vérifie si aucun utilisateur ne correspond.
      if (!utilisateurTrouve) {
        // Affiche un message d’erreur.
        setErreur(
          "E-mail ou mot de passe incorrect."
        );

        // Arrête la fonction sans connecter l’utilisateur.
        return;
      }

      /*
       * Enregistre l’utilisateur trouvé
       * dans AuthContext et localStorage.
       */
      connecter(utilisateurTrouve);

      /*
       * Redirige vers la destination prévue.
       *
       * replace empêche de revenir sur la page
       * de connexion avec le bouton Retour.
       */
      naviguer(
        destination,
        { replace: true }
      );
    } catch (erreurRequete) {
      /*
       * Ce bloc est exécuté si la requête échoue.
       */

      // Enregistre le message de l’erreur.
      setErreur(
        erreurRequete.message
      );
    } finally {
      /*
       * Ce bloc est toujours exécuté,
       * que la connexion réussisse ou échoue.
       */

      // Indique que le chargement est terminé.
      setChargement(false);
    }
  };

  /*
   * Vérifie si un utilisateur est déjà connecté.
   */
  if (utilisateur) {
    // Affiche une page simplifiée dans ce cas.
    return (
      // Contenu principal de la page.
      <main>
        {/* Informe que la session existe déjà. */}
        <h1>
          Vous êtes déjà connecté
        </h1>

        {/*
         * Bouton permettant d’aller directement
         * vers le tableau de bord.
         */}
        <button
          type="button"
          onClick={() =>
            naviguer("/dashboard")
          }
        >
          Aller au tableau de bord
        </button>
      </main>
    );
  }

  // Affiche le formulaire si personne n’est connecté.
  return (
    // Conteneur principal de la page de connexion.
    <main className="page-connexion">
      {/* Carte contenant le formulaire. */}
      <section className="carte-connexion">
        {/* Titre principal. */}
        <h1>Connexion</h1>

        {/* Courte instruction destinée à l’utilisateur. */}
        <p>
          Connectez-vous à TaskFlow RH.
        </p>

        {/*
         * Affiche le message seulement
         * lorsque erreur contient du texte.
         */}
        {erreur && (
          // Message visible en cas d’échec.
          <p
            className="message-erreur"
            role="alert"
          >
            {erreur}
          </p>
        )}

        {/*
         * Formulaire de connexion.
         * gererConnexion sera exécutée à l’envoi.
         */}
        <form onSubmit={gererConnexion}>
          {/* Groupe du champ de l’adresse électronique. */}
          <div className="groupe-champ">
            {/* Label relié au champ grâce à htmlFor. */}
            <label htmlFor="email">
              Adresse e-mail
            </label>

            {/*
             * Champ contrôlé de l’adresse électronique.
             *
             * value utilise la valeur de l’état email.
             * onChange met l’état à jour après chaque saisie.
             */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(evenement) =>
                setEmail(
                  evenement.target.value
                )
              }
              placeholder="gael@taskflow-rh.cd"
              autoComplete="email"
              disabled={chargement}
              required
            />
          </div>

          {/* Groupe du champ du mot de passe. */}
          <div className="groupe-champ">
            {/* Label relié au champ motDePasse. */}
            <label htmlFor="motDePasse">
              Mot de passe
            </label>

            {/*
             * Champ contrôlé du mot de passe.
             *
             * type="password" masque les caractères.
             * autoComplete aide le gestionnaire de mots de passe.
             */}
            <input
              id="motDePasse"
              type="password"
              value={motDePasse}
              onChange={(evenement) =>
                setMotDePasse(
                  evenement.target.value
                )
              }
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              disabled={chargement}
              required
            />
          </div>

          {/* Bouton d’envoi du formulaire. */}
          <button
            type="submit"
            disabled={chargement}
          >
            {
              // Affiche un texte différent pendant la requête.
              chargement
                ? "Connexion..."
                : "Se connecter"
            }
          </button>
        </form>

        {/* Proposition d’inscription. */}
        <p>
          {/* Texte affiché avant le lien. */}
          Vous n’avez pas de compte ?{" "}

          {/* Lien vers la page d’inscription. */}
          <Link to="/inscription">
            Créer un compte
          </Link>
        </p>
      </section>
    </main>
  );
}

// Rend Connexion disponible dans App.jsx.
export default Connexion;