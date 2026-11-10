
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  Trophy,
  Zap,
  LogOut,
  Gamepad2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const username = user?.username || "Player";
  const email = user?.email || "No email available";
  const level = user?.level ?? 1;
  const totalXP = user?.totalXP ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <main className="profile-page">
      <div className="profile-background-glow" />

      <header className="profile-page-nav">
        <Link to="/" className="profile-back-link">
          <ArrowLeft size={18} />
          <span>BACK TO ARENA</span>
        </Link>

        <Link to="/" className="profile-brand">
          <span className="profile-brand-symbol">S</span>
          <span>
            SLICE<span> STORM</span>
          </span>
        </Link>
      </header>

      <section className="profile-main">
        <div className="profile-heading">
          <span className="profile-kicker">PLAYER ACCOUNT</span>
          <h1>MY <span>PROFILE.</span></h1>
          <p>Your identity inside the Slice Storm arena.</p>
        </div>

        <section className="profile-identity-card">
          <div className="profile-identity-top">
            <div className="profile-large-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={`${username}'s avatar`} />
              ) : (
                <UserRound size={42} />
              )}
            </div>

            <div className="profile-identity-info">
              <span className="profile-small-label">PLAYER</span>
              <h2>{username}</h2>
              <div className="profile-email">
                <Mail size={15} />
                <span>{email}</span>
              </div>
            </div>

            <div className="profile-status">
              <span className={`profile-status-dot ${user?.isActive === false ? "inactive" : ""}`} />
              {user?.isActive === false ? "INACTIVE" : "ACTIVE"}
            </div>
          </div>

          <div className="profile-card-divider" />

          <div className="profile-player-stats">
            <div className="profile-stat-box">
              <div className="profile-stat-icon">
                <Trophy size={19} />
              </div>
              <span className="profile-stat-label">CURRENT LEVEL</span>
              <strong>{level}</strong>
              <span className="profile-stat-caption">PLAYER LEVEL</span>
            </div>

            <div className="profile-stat-box">
              <div className="profile-stat-icon">
                <Zap size={19} />
              </div>
              <span className="profile-stat-label">TOTAL EXPERIENCE</span>
              <strong>{totalXP.toLocaleString("en-IN")}</strong>
              <span className="profile-stat-caption">XP EARNED</span>
            </div>

            <div className="profile-stat-box">
              <div className="profile-stat-icon">
                <ShieldCheck size={19} />
              </div>
              <span className="profile-stat-label">ACCOUNT STATUS</span>
              <strong className="profile-account-status">
                {user?.isActive === false ? "Inactive" : "Active"}
              </strong>
              <span className="profile-stat-caption">PLAYER ACCOUNT</span>
            </div>
          </div>
        </section>

        <div className="profile-actions">
          <Link to="/dashboard" className="profile-action-card">
            <div>
              <ChartIcon />
              <h3>MY STATS</h3>
              <p>Explore your gaming performance and match history.</p>
            </div>
            <span>VIEW STATS ↗</span>
          </Link>

          <Link to="/" className="profile-action-card">
            <div>
              <Gamepad2 size={23} />
              <h3>ENTER THE ARENA</h3>
              <p>Return to the home page and choose your game mode.</p>
            </div>
            <span>PLAY NOW ↗</span>
          </Link>
        </div>

        <button className="profile-logout-button" onClick={handleLogout}>
          <LogOut size={17} />
          LOG OUT OF ACCOUNT
        </button>
      </section>

      <footer className="profile-page-footer">
        SLICE STORM PLAYER ACCOUNT · 2026
      </footer>
    </main>
  );
}

function ChartIcon() {
  return <Zap size={23} />;
}
