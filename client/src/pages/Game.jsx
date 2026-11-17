
import { useCallback, useState } from "react";
import {
  Play,
  RotateCcw,
  Home,
  Trophy,
  Flame,
  Clock3,
  Swords
} from "lucide-react";

import GameCanvas from "../components/game/GameCanvas";
import GameHUD from "../components/game/GameHUD";
import "../styles/game.css";

const initialState = {
  score: 0,
  lives: 3,
  combo: 0,
  bestCombo: 0,
  level: 1,
  timeLeft: 60,
  fruitsSliced: 0,
  bombsHit: 0,
  mode: "classic",
  paused: false,
  gameOver: false
};

export default function Game({ mode = "classic", onHome }) {
  const [state, setState] = useState(initialState);
  const [engine, setEngine] = useState(null);

  const updateState = useCallback((nextState) => {
    setState(nextState);
  }, []);

  const handleReady = useCallback((gameEngine) => {
    setEngine(gameEngine);
  }, []);

  const restart = () => {
    if (!engine) return;

    engine.start();
  };

  const pause = () => {
    engine?.pause();
  };

  const resume = () => {
    engine?.resume();
  };

  const goHome = () => {
    engine?.destroy();
    onHome?.();
  };

  return (
    <main className="game-page">

      <GameCanvas
        mode={mode}
        onUpdate={updateState}
        onReady={handleReady}
      />

      <GameHUD
        state={state}
        onPause={pause}
        onRestart={restart}
        onHome={goHome}
      />

      <div className="game-instruction">
        <Swords size={15} />
        SWIPE TO SLICE
        <span>AVOID BOMBS</span>
      </div>

      {state.combo >= 3 && !state.gameOver && (
        <div className="combo-indicator">
          <Flame size={20} />
          COMBO x{state.combo}
        </div>
      )}

      {state.paused && (
        <div className="game-overlay">
          <div className="game-dialog">
            <div className="dialog-icon">
              <Play size={26} />
            </div>

            <span className="dialog-kicker">TAKE A BREATHER</span>
            <h1>GAME <span>PAUSED</span></h1>

            <p>Your arena is waiting. Ready to continue?</p>

            <button className="arena-primary" onClick={resume}>
              <Play size={17} fill="currentColor" />
              RESUME GAME
            </button>

            <button className="arena-secondary" onClick={restart}>
              <RotateCcw size={16} />
              RESTART
            </button>
          </div>
        </div>
      )}

      {state.gameOver && (
        <div className="game-overlay">
          <div className="game-dialog game-result">

            <div className="dialog-icon">
              <Trophy size={27} />
            </div>

            <span className="dialog-kicker">THE ARENA HAS SPOKEN</span>
            <h1>GAME <span>OVER</span></h1>

            <div className="final-score">
              <span>YOUR SCORE</span>
              <strong>{String(state.score).padStart(6, "0")}</strong>
            </div>

            <div className="result-stats">

              <div>
                <Flame size={18} />
                <strong>{state.bestCombo}</strong>
                <span>BEST COMBO</span>
              </div>

              <div>
                <Swords size={18} />
                <strong>{state.fruitsSliced}</strong>
                <span>FRUITS</span>
              </div>

              <div>
                <Clock3 size={18} />
                <strong>{state.level}</strong>
                <span>LEVEL</span>
              </div>

            </div>

            <button className="arena-primary" onClick={restart}>
              <RotateCcw size={17} />
              PLAY AGAIN
            </button>

            <button className="arena-secondary" onClick={goHome}>
              <Home size={16} />
              BACK TO HOME
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
