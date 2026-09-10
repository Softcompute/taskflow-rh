import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import RoutePrivee from "./components/RoutePrivee";
import MiseEnPagePrivee from "./components/MiseEnPagePrivee";

import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import Dashboard from "./pages/Dashboard";
import Projets from "./pages/Projets";
import DetailProjet from "./pages/DetailProjet";
import NonTrouve from "./pages/NonTrouve";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="/connexion"
        element={<Connexion />}
      />

      <Route
        path="/inscription"
        element={<Inscription />}
      />

      <Route
        element={
          <RoutePrivee>
            <MiseEnPagePrivee />
          </RoutePrivee>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/projets"
          element={<Projets />}
        />

        <Route
          path="/projets/:id"
          element={<DetailProjet />}
        />
      </Route>

      <Route path="*" element={<NonTrouve />} />
    </Routes>
  );
}

export default App;