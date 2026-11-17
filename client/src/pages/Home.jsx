
import { useState } from "react";
import {
  Swords,
  Trophy,
  UserRound,
  Volume2,
  VolumeX,
  Settings,
  Zap,
  Shield,
  Target,
  ChevronRight,
  X,
  Play,
  Crown,
  Flame,
} from "lucide-react";

const modes = [
  {
    id: "classic",
    name: "CLASSIC",
    subtitle: "Slice. Survive. Dominate.",
    icon: Swords,
    color: "orange",
  },
  {
    id: "arcade",
    name: "ARCADE",
    subtitle: "60 seconds. Maximum chaos.",
    icon: Zap,
    color: "cyan",
  },
  {
    id: "zen",
    name: "ZEN",
    subtitle: "Find your perfect rhythm.",
    icon: Target,
    color: "purple",
  },
];

export default function Home({ onStart }) {
  const [sound, setSound] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState("classic");
  const [showInfo, setShowInfo] = useState(false);

  const startGame = () => {
    setSelectedMode("classic");
    setModal(true);
  };

  const beginGame = () => {
    setModal(false);
    onStart?.(selectedMode);
  };

  return (
    <main className="home" id="home">

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      {/* NAVIGATION */}

      <header className="navbar">

        <a className="brand" href="#home">
          <div className="brand-icon">
            <Swords size={23} strokeWidth={2.5} />
          </div>

          <div>
            <div className="brand-name">
              SLICE<span>STORM</span>
            </div>
            <div className="brand-caption">
              THE ULTIMATE ARCADE
            </div>
          </div>
        </a>

        <nav className="nav-links">
          <a href="#home" className="active">HOME</a>
          <a href="#modes">GAME MODES</a>
          <a href="#features">FEATURES</a>
        </nav>

        <div className="nav-actions">

          <button
            className="icon-button"
            onClick={() => setSound(!sound)}
            aria-label="Toggle sound"
            title="Sound settings"
          >
            {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>

          <button
            className="icon-button"
            onClick={() => setShowInfo(true)}
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={19} />
          </button>

          <button
            className="profile-button"
            onClick={() => setShowInfo(true)}
          >
            <UserRound size={17} />
            <span>GUEST</span>
          </button>

        </div>
      </header>

      {/* HERO SECTION */}

      <section className="hero">

        <div className="hero-copy">

          <div className="eyebrow">
            <span className="live-dot" />
            <span>ENTER THE ARENA</span>
            <span className="eyebrow-line" />
            <span className="eyebrow-number">001</span>
          </div>

          <h1>
            SLICE
            <span className="storm-word">STORM</span>
        </h1>

          <div className="hero-subtitle">
            <span>PRECISION.</span>
            <span className="separator">/</span>
            <span>REFLEX.</span>
            <span className="separator">/</span>
            <span>CHAOS.</span>
          </div>

          <p className="hero-description">
            Enter the ultimate slicing arena.
            Sharpen your reflexes, master the blade,
            and carve your name into the leaderboard.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={startGame}
            >
              <Play size={19} fill="currentColor" />
              <span>ENTER THE ARENA</span>
              <ChevronRight size={19} />
            </button>

            <a
              href="#modes"
              className="secondary-button"
            >
              EXPLORE MODES
            </a>

          </div>

          <div className="hero-stats">

            <div className="stat">
              <Trophy size={19} />
              <div>
                <strong>3</strong>
                <span>GAME MODES</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat">
              <Flame size={19} />
              <div>
                <strong>∞</strong>
                <span>ENDLESS ACTION</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat">
              <Shield size={19} />
              <div>
                <strong>100%</strong>
                <span>ARCADE ENERGY</span>
              </div>
            </div>

          </div>

        </div>

        {/* PREMIUM STYLIZED 3D FRUIT VISUAL */}

        <div className="hero-visual">

          <div className="visual-glow" />

          <div className="arena-ring ring-one" />
          <div className="arena-ring ring-two" />
          <div className="arena-ring ring-three" />

          <img
            src="/assets/images/hero-fruit-storm.png"
            alt="Slice Storm premium stylized 3D fruit slicing artwork"
            className="hero-artwork"
            fetchPriority="high"
            draggable="false"
            style={{
              display: "block",
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: "680px",
              height: "auto",
              objectFit: "contain",
              margin: "0 auto",
              filter: "drop-shadow(0 20px 35px rgba(255, 115, 35, 0.16))",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          <div className="floating-label label-top">
            <span className="label-dot" />
            BLADE READY
          </div>

          <div className="floating-label label-bottom">
            <Zap size={14} />
            COMBO POTENTIAL: MAX
          </div>

          <div className="visual-coordinate">
            ARENA / 01
          </div>

        </div>

      </section>

      {/* GAME MODES */}

      <section className="modes-section" id="modes">

        <div className="section-heading">

          <div>
            <div className="section-kicker">
              CHOOSE YOUR CHALLENGE
            </div>

            <h2>
              ENTER YOUR <span>MODE.</span>
            </h2>
          </div>

          <div className="section-side-text">
            THREE PATHS. ONE BLADE.
          </div>

        </div>

        <div className="mode-grid">

          {modes.map((mode, index) => {
            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                className={`mode-card ${mode.color}`}
                onClick={() => {
                  setSelectedMode(mode.id);
                  setModal(true);
                }}
              >

                <div className="mode-top">
                  <span>0{index + 1} / MODE</span>
                  <Icon size={22} />
                </div>

                <div className="mode-content">
                  <h3>{mode.name}</h3>
                  <p>{mode.subtitle}</p>
                </div>

                <div className="mode-bottom">
                  <span>SELECT MODE</span>
                  <ChevronRight size={18} />
                </div>

              </button>
            );
          })}

        </div>

      </section>

      {/* FEATURES */}

      <section className="features-section" id="features">

        <div className="features-intro">

          <div className="section-kicker">
            BUILT FOR THE BOLD
          </div>

          <h2>
            FEEL EVERY
            <br />
            <span>SINGLE SLICE.</span>
          </h2>

        </div>

        <div className="feature-list">

          <div className="feature-item">
            <Zap size={21} />
            <div>
              <strong>LIGHTNING REFLEXES</strong>
              <span>Fast-paced, responsive slicing action.</span>
            </div>
          </div>

          <div className="feature-item">
            <Target size={21} />
            <div>
              <strong>PRECISION COMBOS</strong>
              <span>Chain your slices and chase bigger scores.</span>
            </div>
          </div>

          <div className="feature-item">
            <Crown size={21} />
            <div>
              <strong>CLAIM YOUR GLORY</strong>
              <span>Rise through the ranks and own the arena.</span>
            </div>
          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-brand">
          SLICE<span>STORM</span>
        </div>

        <p>AN ORIGINAL ARCADE EXPERIENCE.</p>

        <span>
          © 2026 SLICE STORM. ALL RIGHTS RESERVED.
        </span>

      </footer>

      {/* GAME MODE MODAL */}

      {modal && (
        <div
          className="modal-backdrop"
          onClick={() => setModal(false)}
        >

          <div
            className="mode-modal"
            onClick={event => event.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setModal(false)}
              aria-label="Close mode selection"
            >
              <X size={20} />
            </button>

            <div className="section-kicker">
              PREPARE YOURSELF
            </div>

            <h2>
              CHOOSE YOUR <span>ARENA.</span>
            </h2>

            <div className="modal-modes">

              {modes.map(mode => (
                <button
                  key={mode.id}
                  className={`modal-mode ${
                    selectedMode === mode.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <span>{mode.name}</span>

                  {selectedMode === mode.id && (
                    <Zap size={17} />
                  )}
                </button>
              ))}

            </div>

            <button
              className="primary-button modal-start"
              onClick={beginGame}
            >
              <Play size={18} fill="currentColor" />
              BEGIN YOUR JOURNEY
            </button>

            <p className="modal-note">
              GUEST PLAY • NO ACCOUNT REQUIRED
            </p>

          </div>

        </div>
      )}

      {/* GUEST / SETTINGS INFORMATION */}

      {showInfo && (
        <div
          className="modal-backdrop"
          onClick={() => setShowInfo(false)}
        >

          <div
            className="mode-modal info-modal"
            onClick={event => event.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setShowInfo(false)}
              aria-label="Close information"
            >
              <X size={20} />
            </button>

            <div className="section-kicker">
              PLAYER ACCESS
            </div>

            <h2>
              WELCOME, <span>PLAYER.</span>
            </h2>

            <p className="hero-description">
              Guest gameplay is available. Player accounts,
              saved scores and leaderboards will be introduced
              in a future update.
            </p>

            <button
              className="secondary-button"
              onClick={() => setShowInfo(false)}
            >
              CONTINUE AS GUEST
            </button>

          </div>

        </div>
      )}

    </main>
  );
}
