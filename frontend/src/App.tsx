import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import TradeWindowComponent from "./components/TradeWindow";
import { NavbarComponent } from "./components/NavbarComponent";
import { DepositComponent } from "./components/DepositComponent";
import { HomeComponent as Home } from "./components/Home";
import { LPComponent } from "./components/LPComponent";
import { RisksComponent } from "./components/RisksComponent";
import { StrategiesComponent } from "./components/StrategiesComponent";
import { WhitepaperComponent } from "./components/WhitepaperComponent";
import { TeamComponent } from "./components/TeamComponent";
import { AdminComponent } from "./components/AdminComponent";
import { Container } from "react-bootstrap";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavbarComponent />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deposit" element={<DepositComponent />} />
            <Route path="/trade" element={<TradeWindowComponent />} />
            <Route path="/lp" element={<LPComponent />} />
            <Route path="/risks" element={<RisksComponent />} />
            <Route path="/strategies" element={<StrategiesComponent />} />
            <Route path="/whitepaper" element={<WhitepaperComponent />} />
            <Route path="/team" element={<TeamComponent />} />
            <Route path="/admin" element={<AdminComponent />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
