
import { useState } from "react";
import Home from "./pages/Home";
import Game from "./pages/Game";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("classic");

  const startGame = (selectedMode) => {
    setMode(selectedMode || "classic");
    setScreen("game");
  };

  const goHome = () => {
    setScreen("home");
  };

  return (
    <>
      {screen === "home" ? (
        <Home onStart={startGame} />
      ) : (
        <Game mode={mode} onHome={goHome} />
      )}
    </>
  );
}
