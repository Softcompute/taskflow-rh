// Importe useState pour gérer les valeurs du formulaire.
import { useState } from "react";

// Importe les outils de navigation de React Router.
import {
  // Link crée un lien sans recharger l’application.
  Link,

  // useNavigate permet de rediriger avec JavaScript.
  useNavigate,
} from "react-router-dom";

/*
 * Composant représentant la page d’inscription.
 */
function Inscription() {
  /*
   * État qui regroupe tous les champs
   * du formulaire d’inscription.
   */
  const [
    // Objet contenant les valeurs actuelles.
    formulaire,

    // Fonction permettant de modifier ces valeurs.
    setFormulaire,
  ] = useState({
    // Nom complet de l’utilisateur.
    nom: "",

    // Adresse électronique de l’utilisateur.
    email: "",

    // Mot de passe choisi.
    motDePasse: "",

    // Confirmation du mot de passe.
    confirmation: "",

    // Fonction sélectionnée par défaut.
    role: "Agent RH",
  });

  // État indiquant si l’inscription est en cours.
  const [
    chargement,
    setChargement,
  ] = useState(false);

  // État contenant un éventuel message d’erreur.
  const [
    erreur,
    setErreur,
  ] = useState("");

  // État contenant le message de réussite.
  const [
    succes,
    setSucces,
  ] = useState("");

  // Crée la fonction utilisée pour changer de page.
  const naviguer = useNavigate();

  /*
   * Fonction commune qui met à jour
   * les différents champs du formulaire.
   */
  const modifierChamp = (
    // Reçoit l’événement produit par le champ.
    evenement
  ) => {
    /*
     * Récupère le nom et la valeur
     * du champ actuellement modifié.
     */
    const {
      name,
      value,
    } = evenement.target;

    // Met à jour l’objet formulaire.
    setFormulaire(
      // Reçoit l’ancienne version du formulaire.
      (ancienFormulaire) => ({
        // Conserve les anciennes valeurs.
        ...ancienFormulaire,

        /*
         * Modifie uniquement la propriété correspondant
         * au nom du champ.
         */
        [name]: value,
      })
    );
  };

  /*
   * Fonction exécutée lors de l’envoi
   * du formulaire d’inscription.
   */
  const gererInscription = async (
    // Reçoit l’événement d’envoi.
    evenement
  ) => {
    // Empêche le rechargement automatique de la page.
    evenement.preventDefault();

    // Efface l’ancien message d’erreur.
    setErreur("");

    // Efface l’ancien message de réussite.
    setSucces("");

    /*
     * Retire les espaces inutiles
     * placés autour du nom.
     */
    const nomNettoye =
      formulaire.nom.trim();

    /*
     * Nettoie l’adresse électronique
     * et la transforme en minuscules.
     */
    const emailNettoye =
      formulaire.email
        .trim()
        .toLowerCase();

    /*
     * Vérifie si un champ obligatoire est vide.
     */
    if (
      // Vérifie le nom complet.
      !nomNettoye ||

      // Vérifie l’adresse électronique.
      !emailNettoye ||

      // Vérifie le mot de passe.
      !formulaire.motDePasse ||

      // Vérifie sa confirmation.
      !formulaire.confirmation
    ) {
      // Enregistre un message d’erreur.
      setErreur(
        "Veuillez remplir tous les champs."
      );

      // Arrête immédiatement l’inscription.
      return;
    }

    /*
     * Vérifie si le mot de passe contient
     * au moins quatre caractères.
     */
    if (formulaire.motDePasse.length < 4) {
      // Affiche la règle concernant la longueur.
      setErreur(
        "Le mot de passe doit contenir au moins 4 caractères."
      );

      // Arrête la fonction.
      return;
    }

    /*
     * Compare le mot de passe
     * avec sa confirmation.
     */
    if (
      formulaire.motDePasse !==
      formulaire.confirmation
    ) {
      // Affiche un message si les valeurs sont différentes.
      setErreur(
        "Les deux mots de passe ne correspondent pas."
      );

      // Arrête l’inscription.
      return;
    }

    /*
     * Essaie de vérifier l’adresse électronique
     * puis de créer le compte.
     */
    try {
      // Indique que l’inscription commence.
      setChargement(true);

      /*
       * Recherche dans JSON Server si cette adresse
       * est déjà utilisée.
       */
      const verification = await fetch(
        // Construit l’adresse de recherche.
        `http://localhost:3000/utilisateurs?email=${encodeURIComponent(
          // Sécurise l’adresse avant son insertion dans l’URL.
          emailNettoye
        )}`
      );

      // Vérifie si la requête a échoué.
      if (!verification.ok) {
        // Interrompt l’inscription avec une erreur.
        throw new Error(
          "Impossible de vérifier l'adresse e-mail."
        );
      }

      /*
       * Transforme la réponse JSON
       * en tableau JavaScript.
       */
      const utilisateursExistants =
        await verification.json();

      /*
       * Vérifie si le tableau contient
       * déjà au moins un utilisateur.
       */
      if (utilisateursExistants.length > 0) {
        // Informe que l’adresse est déjà utilisée.
        setErreur(
          "Un compte utilise déjà cette adresse e-mail."
        );

        // Arrête la fonction avant la création.
        return;
      }

      /*
       * Prépare l’objet qui sera envoyé
       * à JSON Server.
       *
       * La confirmation n’est pas enregistrée.
       */
      const nouvelUtilisateur = {
        // Nom nettoyé.
        nom: nomNettoye,

        // Adresse nettoyée.
        email: emailNettoye,

        // Mot de passe saisi.
        motDePasse:
          formulaire.motDePasse,

        // Fonction sélectionnée.
        role: formulaire.role,
      };

      // Envoie le nouvel utilisateur à JSON Server.
      const reponse = await fetch(
        // Adresse de la collection des utilisateurs.
        "http://localhost:3000/utilisateurs",
        {
          // POST signifie que nous créons une donnée.
          method: "POST",

          // Définit le type du contenu envoyé.
          headers: {
            // Indique que le contenu est du JSON.
            "Content-Type": "application/json",
          },

          // Convertit l’objet JavaScript en texte JSON.
          body: JSON.stringify(
            nouvelUtilisateur
          ),
        }
      );

      // Vérifie si la création du compte a échoué.
      if (!reponse.ok) {
        // Interrompt l’opération avec une erreur.
        throw new Error(
          "Impossible de créer votre compte."
        );
      }

      // Affiche un message de confirmation.
      setSucces(
        "Compte créé avec succès."
      );

      /*
       * Attend une seconde avant de rediriger
       * vers la page de connexion.
       */
      setTimeout(() => {
        // Redirige vers la connexion.
        naviguer("/connexion");
      }, 1000);
    } catch (erreurRequete) {
      /*
       * Ce bloc est exécuté si une requête échoue.
       */

      // Affiche le message de l’erreur reçue.
      setErreur(
        erreurRequete.message
      );
    } finally {
      /*
       * Ce bloc est exécuté après le succès
       * ou après l’échec de l’opération.
       */

      // Indique que l’inscription est terminée.
      setChargement(false);
    }
  };

  // Retourne l’interface de la page d’inscription.
  return (
    // Conteneur principal de la page.
    <main className="page-auth">
      {/* Carte contenant le formulaire. */}
      <section className="carte-auth">
        {/* Logo de l’application. */}
        <div className="logo-auth">
          TF
        </div>

        {/* Titre principal. */}
        <h1>Créer un compte</h1>

        {/* Courte instruction. */}
        <p className="sous-titre">
          Inscrivez-vous pour utiliser TaskFlow RH.
        </p>

        {/* Affiche l’erreur seulement si elle existe. */}
        {erreur && (
          <div
            className="message-erreur"
            role="alert"
          >
            {/* Texte de l’erreur. */}
            {erreur}
          </div>
        )}

        {/* Affiche la réussite seulement si elle existe. */}
        {succes && (
          <div
            className="message-succes"
            role="status"
          >
            {/* Texte de confirmation. */}
            {succes}
          </div>
        )}

        {/* Formulaire d’inscription. */}
        <form onSubmit={gererInscription}>
          {/* Groupe du nom complet. */}
          <div className="groupe-champ">
            {/* Label relié au champ nom. */}
            <label htmlFor="nom">
              Nom complet
            </label>

            {/* Champ contrôlé du nom. */}
            <input
              id="nom"
              name="nom"
              type="text"
              value={formulaire.nom}
              onChange={modifierChamp}
              placeholder="Exemple : Gael Ekofo"
              autoComplete="name"
              disabled={chargement}
              required
            />
          </div>

          {/* Groupe de l’adresse électronique. */}
          <div className="groupe-champ">
            {/* Label relié au champ email. */}
            <label htmlFor="email">
              Adresse e-mail
            </label>

            {/* Champ contrôlé de l’adresse électronique. */}
            <input
              id="email"
              name="email"
              type="email"
              value={formulaire.email}
              onChange={modifierChamp}
              placeholder="exemple@entreprise.com"
              autoComplete="email"
              disabled={chargement}
              required
            />
          </div>

          {/* Groupe de sélection de la fonction RH. */}
          <div className="groupe-champ">
            {/* Label relié à la liste role. */}
            <label htmlFor="role">
              Fonction dans le département
            </label>

            {/* Liste contrôlée des rôles disponibles. */}
            <select
              id="role"
              name="role"
              value={formulaire.role}
              onChange={modifierChamp}
              disabled={chargement}
            >
              {/* Premier rôle disponible. */}
              <option value="Agent RH">
                Agent RH
              </option>

              {/* Deuxième rôle disponible. */}
              <option value="Gestionnaire RH">
                Gestionnaire RH
              </option>

              {/* Troisième rôle disponible. */}
              <option value="Responsable RH">
                Responsable RH
              </option>
            </select>
          </div>

          {/* Groupe du mot de passe. */}
          <div className="groupe-champ">
            {/* Label relié au champ motDePasse. */}
            <label htmlFor="motDePasse">
              Mot de passe
            </label>

            {/* Champ contrôlé et masqué du mot de passe. */}
            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              value={formulaire.motDePasse}
              onChange={modifierChamp}
              placeholder="Minimum 4 caractères"
              autoComplete="new-password"
              disabled={chargement}
              minLength="4"
              required
            />
          </div>

          {/* Groupe de confirmation du mot de passe. */}
          <div className="groupe-champ">
            {/* Label relié au champ confirmation. */}
            <label htmlFor="confirmation">
              Confirmer le mot de passe
            </label>

            {/* Champ contrôlé de confirmation. */}
            <input
              id="confirmation"
              name="confirmation"
              type="password"
              value={formulaire.confirmation}
              onChange={modifierChamp}
              placeholder="Retapez le mot de passe"
              autoComplete="new-password"
              disabled={chargement}
              minLength="4"
              required
            />
          </div>

          {/* Bouton d’envoi du formulaire. */}
          <button
            type="submit"
            className="bouton-principal"
            disabled={chargement}
          >
            {
              // Change le texte pendant la création.
              chargement
                ? "Création en cours..."
                : "Créer mon compte"
            }
          </button>
        </form>

        {/* Proposition de connexion. */}
        <p className="lien-auth">
          {/* Texte placé avant le lien. */}
          Vous avez déjà un compte ?{" "}

          {/* Lien vers la page de connexion. */}
          <Link to="/connexion">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}

// Rend Inscription disponible dans App.jsx.
export default Inscription;