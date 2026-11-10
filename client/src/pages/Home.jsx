
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Flame,
  Gamepad2,
  Trophy,
  Zap,
  Shield,
  Target,
  Swords,
  Crown,
  Play,
  UserRound,
  UserCircle,
  ChartNoAxesColumnIncreasing,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

/* =========================================
   GAME MODES
========================================= */

const modes = [
  {
    number: "01",
    title: "CLASSIC",
    subtitle: "The original slicing experience.",
    description: "Slice fruit. Build combos. Avoid the bombs.",
    color: "orange",
    status: "CORE MODE",
    image: "/images/modes/classic.png",
  },
  {
    number: "02",
    title: "ARCADE",
    subtitle: "Speed meets pure chaos.",
    description: "Race against time and chase massive scores.",
    color: "purple",
    status: "CORE MODE",
    image: "/images/modes/arcade.png",
  },
  {
    number: "03",
    title: "ZEN",
    subtitle: "Find your slicing rhythm.",
    description: "Relax, focus and master every single slice.",
    color: "cyan",
    status: "CORE MODE",
    image: "/images/modes/zen.png",
  },
  {
    number: "04",
    title: "STORM ARENA",
    subtitle: "The competition starts here.",
    description: "A future global weekly contest experience.",
    color: "gold",
    status: "COMING SOON",
    image: "/images/modes/storm-arena.png",
  },
];

/* =========================================
   FEATURES
========================================= */

const features = [
  {
    number: "01",
    title: "PRECISION SLICING",
    text: "Fluid mouse and touch controls built for satisfying slices.",
    label: "BUILT FOR ACCURACY",
    color: "orange",
    image: "/images/features/precision-slicing.jpg",
    alt: "Precision fruit slicing gameplay",
    icon: <Swords size={20} />,
  },
  {
    number: "02",
    title: "RISING INTENSITY",
    text: "The longer you survive, the more intense the arena becomes.",
    label: "NO ROOM FOR ERRORS",
    color: "purple",
    image: "/images/features/rising-intensity.jpg",
    alt: "Increasing game intensity",
    icon: <Flame size={20} />,
  },
  {
    number: "03",
    title: "PLAYER PROGRESSION",
    text: "Earn XP, level up and unlock a tougher starting challenge.",
    label: "LEVEL UP YOUR GAME",
    color: "green",
    image: "/images/features/player-progression.jpg",
    alt: "Player progression and achievements",
    icon: <Crown size={20} />,
  },
  {
    number: "04",
    title: "GLOBAL COMPETITION",
    text: "A competitive arena designed for players chasing the top spot.",
    label: "CHASE THE TOP SPOT",
    color: "gold",
    image: "/images/features/global-competition.jpg",
    alt: "Competitive gaming leaderboard",
    icon: <Trophy size={20} />,
  },
];

/* =========================================
   NAVBAR + PLAYER PROFILE
========================================= */

function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const scrollToModes = () => {
    document.getElementById("modes")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  const username = user?.username || "Player";
  const email = user?.email || "Welcome to Slice Storm";

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-symbol">S</span>
        <span>
          SLICE<span className="brand-accent"> STORM</span>
        </span>
      </Link>

      <nav className="nav-links">
        <a href="#modes">Game Modes</a>
        <a href="#features">Features</a>
        <a href="#arena">The Arena</a>
      </nav>

      <div className="nav-profile-area">
        <button
          className="profile-trigger"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          aria-label="Open player profile menu"
        >
          <span className="profile-avatar">
            <UserRound size={19} />
          </span>

          <span className="profile-trigger-name">
            {username}
          </span>

          <ChevronDown
            size={16}
            className={`profile-chevron ${
              profileOpen ? "profile-chevron-open" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div className="profile-dropdown">
            <div className="profile-dropdown-header">
              <div className="profile-avatar profile-avatar-large">
                <UserRound size={24} />
              </div>

              <div className="profile-user-info">
                <strong>{username}</strong>
                <span>{email}</span>
              </div>
            </div>

            <div className="profile-dropdown-divider" />

            <Link
              to="/profile"
              className="profile-dropdown-item"
              onClick={() => setProfileOpen(false)}
            >
              <UserCircle size={18} />
              <span>View Profile</span>
              <ChevronRight size={15} />
            </Link>

            <Link
              to="/dashboard"
              className="profile-dropdown-item"
              onClick={() => setProfileOpen(false)}
            >
              <ChartNoAxesColumnIncreasing size={18} />
              <span>My Stats</span>
              <ChevronRight size={15} />
            </Link>

            <div className="profile-dropdown-divider" />

            <button
              className="profile-dropdown-item profile-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
              <ChevronRight size={15} />
            </button>

            <div className="profile-dropdown-footer">
              SLICE STORM PLAYER ACCOUNT
            </div>
          </div>
        )}
      </div>

      <button
        className="mobile-nav-cta"
        onClick={scrollToModes}
        aria-label="Explore game modes"
      >
        <Gamepad2 size={21} />
      </button>
    </header>
  );
}

/* =========================================
   HERO SECTION
========================================= */

function Hero() {
  return (
    <section className="hero" id="arena">
      <div className="hero-grid"></div>
      <div className="hero-glow"></div>

      <div className="hero-content">
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="live-dot"></span>
          THE NEXT GENERATION ARCADE EXPERIENCE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          SHARPEN
          <br />
          YOUR <span className="gradient-text">REFLEXES.</span>
          <br />
          UNLEASH THE
          <br />
          <span className="storm-text">STORM.</span>
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          One blade. Endless fruit. Zero room for mistakes.
          <br />
          Slice your way to the top.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <a href="#modes" className="primary-button">
            <Play size={17} fill="currentColor" />
            ENTER THE ARENA
            <ArrowRight size={17} />
          </a>

          <a href="#features" className="secondary-button">
            DISCOVER THE GAME
            <ChevronRight size={17} />
          </a>
        </motion.div>

        <motion.div
          className="hero-mini-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div>
            <strong>04</strong>
            <span>GAME MODES</span>
          </div>

          <div className="stat-divider"></div>

          <div>
            <strong>∞</strong>
            <span>COMBO POTENTIAL</span>
          </div>

          <div className="stat-divider"></div>

          <div>
            <strong>01</strong>
            <span>ULTIMATE GOAL</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.25 }}
      >
        <img
          src="/images/hero-fruit-storm.png"
          alt="Slice Storm fruit slicing artwork"
          className="hero-artwork"
          fetchPriority="high"
        />
      </motion.div>

      <div className="hero-bottom-label">
        <span>01 / THE BEGINNING</span>
        <span>SCROLL TO EXPLORE ↓</span>
      </div>
    </section>
  );
}

/* =========================================
   GAME MODES SECTION
========================================= */


function GameModes() {
  const navigate = useNavigate();

  const handleModeClick = (mode) => {
    if (mode.title === "STORM ARENA") return;

    navigate(`/game/${mode.title.toLowerCase()}`);
  };

  return (
    <section className="modes-section section-padding" id="modes">
      <div className="section-heading">
        <div>
          <span className="section-kicker">CHOOSE YOUR BATTLE</span>

          <h2>
            FOUR WAYS TO
            <br />
            <span className="gradient-text">UNLEASH CHAOS.</span>
          </h2>
        </div>

        <p>
          Every mode has its own rhythm.
          <br />
          Every slice brings you closer to mastery.
        </p>
      </div>

      <div className="mode-grid">
        {modes.map((mode, index) => {
          const isComingSoon = mode.title === "STORM ARENA";

          return (
            <motion.article
              className={`mode-card mode-${mode.color}`}
              key={mode.number}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.1,
              }}
              onClick={() => handleModeClick(mode)}
              onKeyDown={(event) => {
                if (
                  !isComingSoon &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  handleModeClick(mode);
                }
              }}
              role="button"
              tabIndex={isComingSoon ? -1 : 0}
              aria-disabled={isComingSoon}
              style={{
                cursor: isComingSoon ? "not-allowed" : "pointer",
              }}
            >
              <div className="mode-art">
                <img
                  src={mode.image}
                  alt={`${mode.title} game artwork`}
                  loading="lazy"
                />
              </div>

              <div className="mode-card-content">
                <div className="mode-card-top">
                  <span className="mode-number">{mode.number}</span>
                  <span className="mode-status">{mode.status}</span>
                </div>

                <h3>{mode.title}</h3>
                <h4>{mode.subtitle}</h4>
                <p>{mode.description}</p>

                <div className="mode-card-bottom">
                  <span>
                    {isComingSoon ? "COMING SOON" : "PLAY NOW"}
                  </span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================
   FEATURES SECTION
========================================= */

function Features() {
  return (
    <section className="features-section section-padding" id="features">
      <div className="section-heading">
        <div>
          <span className="section-kicker">BUILT FOR THE HUNGRY</span>

          <h2>
            NOT JUST A GAME.
            <br />
            <span className="gradient-text">A SKILL TEST.</span>
          </h2>
        </div>

        <p>
          Reflexes get you started.
          <br />
          Precision keeps you alive.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.article
            className={`feature-card feature-${feature.color}`}
            key={feature.number}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="feature-image">
              <img
                src={feature.image}
                alt={feature.alt}
                loading="lazy"
              />
            </div>

            <div className="feature-content">
              <div className="feature-topline">
                <span className="feature-number">
                  {feature.number}
                </span>

                <span className="feature-label">
                  {feature.label}
                </span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.text}</p>

              <div className="feature-bottom-line">
                <span>SLICE STORM EXPERIENCE</span>
                <span className="feature-indicator"></span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* =========================================
   FOOTER
========================================= */

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="brand">
        <span className="brand-symbol">S</span>
        <span>
          SLICE<span className="brand-accent"> STORM</span>
        </span>
      </Link>

      <p>THE STORM IS COMING. ARE YOU READY?</p>

      <span className="footer-copy">
        © 2026 SLICE STORM. ALL RIGHTS RESERVED.
      </span>
    </footer>
  );
}

/* =========================================
   HOME PAGE
========================================= */

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <GameModes />
      <Features />
      <Footer />
    </main>
  );
}
