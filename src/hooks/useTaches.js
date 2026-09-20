import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { obtenirTachesProjet } from "../api/taches";

function useTaches(projetId) {
  const [taches, setTaches] = useState([]);

  const [
    chargementTaches,
    setChargementTaches,
  ] = useState(true);

  const [erreurTaches, setErreurTaches] =
    useState("");

  /*
   * Cette fonction permet de recharger les tâches
   * après une création, modification ou suppression.
   */
  const chargerTaches = useCallback(async () => {
    if (!projetId) {
      setTaches([]);
      setChargementTaches(false);
      return;
    }

    try {
      setChargementTaches(true);
      setErreurTaches("");

      const donnees =
        await obtenirTachesProjet(projetId);

      setTaches(donnees);
    } catch (erreur) {
      setErreurTaches(
        erreur.message ||
          "Impossible de charger les tâches."
      );
    } finally {
      setChargementTaches(false);
    }
  }, [projetId]);

  /*
   * Chargement initial et changement de projet.
   */
  useEffect(() => {
    if (!projetId) {
      return undefined;
    }

    let composantActif = true;

    obtenirTachesProjet(projetId)
      .then((donnees) => {
        if (!composantActif) {
          return;
        }

        setTaches(donnees);
        setErreurTaches("");
      })
      .catch((erreur) => {
        if (!composantActif) {
          return;
        }

        setErreurTaches(
          erreur.message ||
            "Impossible de charger les tâches."
        );
      })
      .finally(() => {
        if (composantActif) {
          setChargementTaches(false);
        }
      });

    return () => {
      composantActif = false;
    };
  }, [projetId]);

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