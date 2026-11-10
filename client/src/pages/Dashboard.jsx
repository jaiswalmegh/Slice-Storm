
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Trophy,
  Target,
  Gamepad2,
  Zap,
  Clock3,
  BarChart3,
  Flame,
  LockKeyhole,
  LogOut,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

const summaryCards = [
  {
    label: "GAMES PLAYED",
    value: "—",
    detail: "Your match count",
    icon: <Gamepad2 />,
  },
  {
    label: "HIGHEST SCORE",
    value: "—",
    detail: "Personal best",
    icon: <Trophy />,
  },
  {
    label: "AVERAGE SCORE",
    value: "—",
    detail: "Across all matches",
    icon: <Target />,
  },
  {
    label: "TOTAL XP",
    value: null,
    detail: "Lifetime experience",
    icon: <Zap />,
  },
];

function EmptyState({ icon, title, description }) {
  return (
    <div className="dashboard-empty">
      <div className="dashboard-empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const username = user?.username || "Player";
  const level = user?.level ?? 1;
  const totalXP = user?.totalXP ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-glow dashboard-glow-one" />
      <div className="dashboard-glow dashboard-glow-two" />

      <header className="dashboard-nav">
        <Link to="/" className="dashboard-back">
          <ArrowLeft size={17} />
          <span>BACK TO ARENA</span>
        </Link>

        <Link to="/" className="dashboard-brand">
          <span className="dashboard-brand-mark">S</span>
          <span>
            SLICE<span> STORM</span>
          </span>
        </Link>

        <div className="dashboard-nav-user">
          <span className="dashboard-nav-avatar">
            <UserRound size={17} />
          </span>
          <span>{username}</span>
        </div>
      </header>

      <div className="dashboard-container">
        <motion.section
          className="dashboard-heading"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="dashboard-kicker">
              <span className="dashboard-kicker-dot" />
              PLAYER ANALYTICS
            </span>
            <h1>MY <span>STATS.</span></h1>
            <p>
              Every match tells a story. This is where yours takes shape.
            </p>
          </div>

          <Link to="/profile" className="dashboard-profile-link">
            VIEW PROFILE <ArrowUpRight size={16} />
          </Link>
        </motion.section>

        <section className="dashboard-player-banner">
          <div className="dashboard-player-info">
            <div className="dashboard-player-icon">
              <Trophy size={25} />
            </div>

            <div>
              <span className="dashboard-muted-label">CURRENT PLAYER</span>
              <h2>{username}</h2>
              <span className="dashboard-player-subtitle">
                Keep slicing. Keep progressing.
              </span>
            </div>
          </div>

          <div className="dashboard-level">
            <span className="dashboard-muted-label">CURRENT LEVEL</span>
            <strong>{level}</strong>
            <span>LEVEL {level} PLAYER</span>
          </div>

          <div className="dashboard-xp">
            <div className="dashboard-xp-heading">
              <span className="dashboard-muted-label">TOTAL EXPERIENCE</span>
              <Zap size={17} />
            </div>
            <strong>{totalXP.toLocaleString("en-IN")} XP</strong>
            <span className="dashboard-xp-note">
              Lifetime XP earned
            </span>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">THE BIG PICTURE</span>
              <h2>PERFORMANCE OVERVIEW</h2>
            </div>
            <span className="dashboard-live-label">
              <span /> MATCH DATA
            </span>
          </div>

          <div className="dashboard-summary-grid">
            {summaryCards.map((card, index) => (
              <motion.article
                className="dashboard-summary-card"
                key={card.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <div className="dashboard-summary-top">
                  <span className="dashboard-summary-icon">
                    {card.icon}
                  </span>
                  <span className="dashboard-summary-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <span className="dashboard-summary-label">
                  {card.label}
                </span>

                <strong>
                  {card.value ?? `${totalXP.toLocaleString("en-IN")}`}
                </strong>

                <span className="dashboard-summary-detail">
                  {card.detail}
                </span>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="dashboard-main-grid">
          <article className="dashboard-panel dashboard-performance">
            <div className="dashboard-panel-heading">
              <div>
                <span className="dashboard-section-kicker">YOUR JOURNEY</span>
                <h2>PERFORMANCE HISTORY</h2>
              </div>
              <BarChart3 size={21} />
            </div>

            <EmptyState
              icon={<BarChart3 size={25} />}
              title="Your story starts here"
              description="Once you complete and save your first match, your score history and performance graph will appear here."
            />
          </article>

          <article className="dashboard-panel dashboard-modes">
            <div className="dashboard-panel-heading">
              <div>
                <span className="dashboard-section-kicker">CHOOSE YOUR BATTLE</span>
                <h2>MODE BREAKDOWN</h2>
              </div>
              <Flame size={21} />
            </div>

            <EmptyState
              icon={<Gamepad2 size={25} />}
              title="No mode data yet"
              description="Your Classic, Arcade and Zen performance will be tracked here."
            />
          </article>
        </section>

        <section className="dashboard-panel dashboard-history">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-section-kicker">RECENT ACTIVITY</span>
              <h2>MATCH HISTORY</h2>
            </div>
            <Clock3 size={21} />
          </div>

          <div className="dashboard-history-empty">
            <div className="dashboard-history-icon">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h3>Your match history is waiting</h3>
              <p>
                Complete your first game to start building your match record.
                Your scores, modes and results will show up here.
              </p>
            </div>
            <Link to="/" className="dashboard-play-link">
              ENTER ARENA <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        <section className="dashboard-bottom-cta">
          <div>
            <span className="dashboard-section-kicker">READY FOR ANOTHER ROUND?</span>
            <h2>THE NEXT HIGH SCORE IS YOURS.</h2>
            <p>Head back to the arena and make every slice count.</p>
          </div>

          <Link to="/" className="dashboard-cta-button">
            <Gamepad2 size={18} />
            PLAY NOW
            <ArrowUpRight size={17} />
          </Link>
        </section>

        <div className="dashboard-account-actions">
          <Link to="/profile">MY PROFILE</Link>
          <button onClick={handleLogout}>
            <LogOut size={15} /> LOG OUT
          </button>
        </div>
      </div>

      <footer className="dashboard-footer">
        SLICE STORM PLAYER ANALYTICS · 2026
      </footer>
    </main>
  );
}
