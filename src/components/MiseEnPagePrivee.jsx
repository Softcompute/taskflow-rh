// Importe Outlet depuis React Router.
// Outlet indique l’endroit où la page enfant
// correspondant à l’adresse actuelle sera affichée.
import { Outlet } from "react-router-dom";

// Importe le composant qui affiche la barre latérale.
import BarreLaterale from "./BarreLaterale";

/*
 * Ce composant définit la mise en page commune
 * à toutes les pages privées de l’application.
 */
function MiseEnPagePrivee() {
  // Retourne la structure visuelle des pages privées.
  return (
    // Conteneur principal de la mise en page.
    <div className="mise-en-page">
      {/*
       * Affiche la barre latérale.
       * Elle contient le logo, les liens de navigation,
       * le profil et le bouton de déconnexion.
       */}
      <BarreLaterale />

      {/*
       * Conteneur principal dans lequel la page
       * sélectionnée sera affichée.
       */}
      <main className="contenu-principal">
        {/*
         * Outlet sera automatiquement remplacé
         * par le composant correspondant à la route enfant.
         *
         * Par exemple :
         * /dashboard affiche Dashboard ;
         * /projets affiche Projets ;
         * /projets/:id affiche DetailProjet.
         */}
        <Outlet />
      </main>
    </div>
  );
}

// Rend MiseEnPagePrivee disponible
// dans les autres fichiers de l’application.
export default MiseEnPagePrivee;