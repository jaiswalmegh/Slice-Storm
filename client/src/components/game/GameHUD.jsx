
import {
  Heart,
  Trophy,
  Flame,
  Pause,
  RotateCcw,
  Home,
  Clock3,
  ShieldCheck
} from "lucide-react";

const MODE_LABELS = {
  classic: "CLASSIC ARENA",
  arcade: "ARCADE CHALLENGE",
  zen: "ZEN SESSION"
};

export default function GameHUD({
  state,
  onPause,
  onRestart,
  onHome
}) {
  const isZen = state.mode === "zen";

  return (
    <div className={`game-hud mode-${state.mode || "classic"}`}>
      <div className="hud-top">

        <div className="hud-brand">
          <span className="hud-brand-icon">⚔</span>

          <div>
            <strong>SLICE STORM</strong>
            <span>
              {MODE_LABELS[state.mode] || MODE_LABELS.classic}
            </span>
          </div>
        </div>

        <div className="hud-score">
          <span>SCORE</span>
          <strong>
            {String(state.score).padStart(6, "0")}
          </strong>
        </div>

        <div className="hud-controls">
          <button
            onClick={onRestart}
            title="Restart"
            aria-label="Restart game"
          >
            <RotateCcw size={17} />
          </button>

          <button
            onClick={onPause}
            title="Pause"
            aria-label="Pause game"
          >
            <Pause size={19} />
          </button>

          <button
            onClick={onHome}
            title="Home"
            aria-label="Return home"
          >
            <Home size={18} />
          </button>
        </div>

      </div>

      <div className="hud-bottom">

        <div className="hud-stat">
          {isZen ? (
            <Clock3 size={19} color="#55d9e9" />
          ) : (
            <Heart
              size={19}
              fill="#fa515b"
              color="#fa515b"
            />
          )}

          <strong>
            {isZen ? `${state.timeLeft}s` : state.lives}
          </strong>

          <span>
            {isZen ? "TIME LEFT" : "LIVES"}
          </span>
        </div>

        <div className="hud-stat">
          <Flame size={19} color="#ff9847" />
          <strong>{state.bestCombo}</strong>
          <span>BEST COMBO</span>
        </div>

        <div className="hud-stat">
          <Trophy size={19} color="#ffbd58" />
          <strong>{state.level}</strong>
          <span>LEVEL</span>
        </div>

        <div className="hud-stat fruits-stat">
          <ShieldCheck size={19} color="#67d9a1" />
          <strong>{state.fruitsSliced}</strong>
          <span>SLICED</span>
        </div>

      </div>
    </div>
  );
}
