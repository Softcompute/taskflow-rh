import { Link } from "react-router-dom";

function NonTrouve() {
  return (
    <main className="page-simple">
      <section className="carte-simple">
        <h1>Erreur 404</h1>
        <p>La page demandée n’existe pas.</p>
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </section>
    </main>
  );
}

export default NonTrouve;