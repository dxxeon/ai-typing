import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Scoreboard from "./pages/Scoreboard";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
    
  );
}

export default App;