import { Outlet } from "react-router-dom";
import BarreLaterale from "./BarreLaterale";

function MiseEnPagePrivee() {
  return (
    <div className="mise-en-page">
      <BarreLaterale />

      <main className="contenu-principal">
        <Outlet />
      </main>
    </div>
  );
}

export default MiseEnPagePrivee;