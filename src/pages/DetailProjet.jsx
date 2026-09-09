import { useParams } from "react-router-dom";

function DetailProjet() {
  const { id } = useParams();

  return (
    <main className="page-simple">
      <section className="carte-simple">
        <h1>Détail du projet</h1>
        <p>Identifiant du projet : {id}</p>
      </section>
    </main>
  );
}

export default DetailProjet;