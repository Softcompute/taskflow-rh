import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { obtenirTachesProjet } from "../api/taches";

function useTaches(projetId) {
  const [taches, setTaches] = useState([]);
  const [chargementTaches, setChargementTaches] =
    useState(true);
  const [erreurTaches, setErreurTaches] =
    useState("");

  const chargerTaches = useCallback(async () => {
    if (!projetId) {
      return;
    }

    try {
      setChargementTaches(true);
      setErreurTaches("");

      const donnees =
        await obtenirTachesProjet(projetId);

      setTaches(donnees);
    } catch (erreur) {
      setErreurTaches(erreur.message);
    } finally {
      setChargementTaches(false);
    }
  }, [projetId]);

  useEffect(() => {
    chargerTaches();
  }, [chargerTaches]);

  return {
    taches,
    setTaches,
    chargementTaches,
    erreurTaches,
    setErreurTaches,
    chargerTaches,
  };
}

export default useTaches;