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
        element={<Navigate to="/dashboard" replace />}
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
        path="/dashboard"
        element={
          <RoutePrivee>
            <Dashboard />
          </RoutePrivee>
        }
      />

      <Route
        path="/projets"
        element={
          <RoutePrivee>
            <Projets />
          </RoutePrivee>
        }
      />

      <Route
        path="/projets/:id"
        element={
          <RoutePrivee>
            <DetailProjet />
          </RoutePrivee>
        }
      />

      <Route path="*" element={<NonTrouve />} />
    </Routes>
  );
}

export default App;