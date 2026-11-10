
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, ArrowUpRight, Play, Sparkles } from "lucide-react";
import "../styles/welcome.css";

const fruits = [
  { emoji: "🍉", x: "8%", y: "20%", delay: 0 },
  { emoji: "🍊", x: "82%", y: "16%", delay: 0.8 },
  { emoji: "🍍", x: "88%", y: "68%", delay: 1.4 },
  { emoji: "🍓", x: "12%", y: "75%", delay: 0.5 },
  { emoji: "🥝", x: "72%", y: "83%", delay: 1.1 },
  { emoji: "🍋", x: "23%", y: "42%", delay: 1.8 },
];

function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-noise" />
      <div className="welcome-glow welcome-glow-one" />
      <div className="welcome-glow welcome-glow-two" />

      <div className="welcome-grid" />

      {/* Floating fruits */}
      <div className="fruit-field">
        {fruits.map((fruit, index) => (
          <motion.div
            key={index}
            className="floating-fruit"
            style={{ left: fruit.x, top: fruit.y }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 12, -12, 0],
            }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              delay: fruit.delay,
              ease: "easeInOut",
            }}
          >
            {fruit.emoji}
          </motion.div>
        ))}
      </div>

      {/* Energy rings */}
      <div className="energy-system">
        <div className="energy-ring ring-one" />
        <div className="energy-ring ring-two" />
        <div className="energy-ring ring-three" />
        <div className="energy-core">
          <Zap size={48} />
        </div>
      </div>

      {/* Top navigation */}
      <header className="welcome-nav">
        <Link to="/" className="welcome-logo">
          <span className="welcome-logo-icon">
            <Zap size={22} />
          </span>
          SLICE <span>STORM</span>
        </Link>

        <div className="welcome-nav-status">
          <span className="status-dot" />
          THE ARENA IS OPEN
        </div>
      </header>

      {/* Main content */}
      <section className="welcome-content">
        <motion.div
          className="welcome-kicker"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles size={14} />
          THE NEXT LEVEL OF ARCADE ACTION
        </motion.div>

        <motion.h1
          className="welcome-title"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span>SLICE</span>
          <span className="title-storm">
            STORM<span className="title-period">.</span>
          </span>
        </motion.h1>

        <motion.div
          className="welcome-slash"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        />

        <motion.p
          className="welcome-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Sharpen your reflexes. Chase the high score.
          <br />
          <strong>Make every slice count.</strong>
        </motion.p>

        <motion.div
          className="welcome-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Link to="/login" className="welcome-btn welcome-login">
            <Play size={17} fill="currentColor" />
            ENTER THE ARENA
            <ArrowUpRight size={18} />
          </Link>

          <Link to="/signup" className="welcome-btn welcome-register">
            CREATE ACCOUNT
            <ArrowUpRight size={17} />
          </Link>
        </motion.div>

        <motion.div
          className="welcome-bottom-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <span>01</span>
          <div />
          <span>READY WHEN YOU ARE</span>
        </motion.div>
      </section>

      <div className="welcome-corner-label">
        <span>SS</span>
        ARCADE EXPERIENCE
      </div>

      <div className="welcome-version">
        SLICE STORM © 2026
      </div>
    </main>
  );
}

export default Welcome;
