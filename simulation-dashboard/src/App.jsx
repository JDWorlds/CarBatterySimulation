import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SimulationDashboard from "./comp/SimulationDash/simulationDashboard";

export default function App() {
  return (
    <Router>
        <Routes>
          <Route path="/dash" element={<SimulationDashboard />} />
        </Routes>
    </Router>
  );
}
