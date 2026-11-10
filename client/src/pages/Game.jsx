
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pause,
  Play,
  Heart,
  Volume2,
  VolumeX,
  Trophy,
  Zap,
  Target,
  Clock3,
  RotateCcw,
  Home,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/game.css";

const FRUITS = [
  "🍉", "🍊", "🍎", "🍋", "🥝",
  "🍑", "🍍", "🥥", "🍓", "🍇",
];

const MODES = {
  classic: { name: "CLASSIC", lives: 3, duration: 0, bombs: true },
  arcade: { name: "ARCADE", lives: 3, duration: 0, bombs: true },
  zen: { name: "ZEN", lives: 0, duration: 90, bombs: false },
};

const random = (min, max) => Math.random() * (max - min) + min;

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (!lengthSquared) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx +
        (point.y - start.y) * dy) /
        lengthSquared
    )
  );

  const x = start.x + t * dx;
  const y = start.y + t * dy;

  return Math.hypot(point.x - x, point.y - y);
}

function playGameSound(type) {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    if (type === "slice") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(650, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1100,
        audio.currentTime + 0.08
      );
      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.18
      );
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.18);
    } else {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(160, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        45,
        audio.currentTime + 0.35
      );
      gain.gain.setValueAtTime(0.2, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.4
      );
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.4);
    }

    oscillator.onended = () => audio.close();
  } catch {
    // Audio is optional.
  }
}

const overlayStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(28, 25, 22, 0.82)",
  borderRadius: "13px",
  textAlign: "center",
};

export default function Game() {
  const navigate = useNavigate();
  const { mode = "classic" } = useParams();
  const config = MODES[mode] || MODES.classic;

  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  const pointerRef = useRef({ down: false, last: null });
  const soundRef = useRef(true);
  const bestScoreRef = useRef(0);

  const [sound, setSound] = useState(true);
  const [status, setStatus] = useState("ready");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(localStorage.getItem(`sliceStormBest_${mode}`)) || 0;
    } catch {
      return 0;
    }
  });
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [lives, setLives] = useState(config.lives);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
      safe % 60
    ).padStart(2, "0")}`;
  };

  const resetGame = useCallback(() => {
    gameRef.current = {
      fruits: [],
      particles: [],
      trail: [],
      score: 0,
      lives: config.lives,
      combo: 0,
      lastSliceAt: 0,
      elapsed: 0,
      timeLeft: config.duration,
      spawnTimer: 0,
      lastHudUpdate: 0,
      width: 0,
      height: 0,
      bombHit: false,
      bombExplosion: null,
      ended: false,
    };

    pointerRef.current = { down: false, last: null };

    setScore(0);
    setLives(config.lives);
    setCombo(0);
    setTimeLeft(config.duration);
    setElapsed(0);
    setIsNewRecord(false);
  }, [config]);

  const endGame = useCallback(() => {
    const game = gameRef.current;
    if (!game || game.ended) return;

    game.ended = true;

    const finalScore = game.score;
    const previousBest = bestScoreRef.current;

    if (finalScore > previousBest) {
      bestScoreRef.current = finalScore;
      setBestScore(finalScore);
      setIsNewRecord(true);

      try {
        localStorage.setItem(
          `sliceStormBest_${mode}`,
          String(finalScore)
        );
      } catch {
        // Local storage is optional.
      }
    }

    setScore(finalScore);
    setStatus("over");
  }, [mode]);

  const startGame = () => {
    resetGame();
    setStatus("playing");
  };

  const toggleSound = () => setSound((previous) => !previous);

  // Bomb hit: stop gameplay immediately and start a short cinematic blast.
  const triggerBombExplosion = (game, fruit) => {
    if (game.bombHit || game.ended) return;

    game.bombHit = true;
    game.combo = 0;

    game.bombExplosion = {
      x: fruit.x,
      y: fruit.y,
      start: performance.now(),

      sparks: Array.from({ length: 55 }, () => {
        const angle = random(0, Math.PI * 2);
        const speed = random(2, 10);

        return {
          x: fruit.x,
          y: fruit.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: random(2, 6),
          life: 1,
          color: [
            "#ffcc66",
            "#ff6b35",
            "#f5e6c8",
            "#d94b32",
            "#ffffff",
          ][Math.floor(random(0, 5))],
        };
      }),

      smoke: Array.from({ length: 16 }, () => ({
        x: fruit.x + random(-12, 12),
        y: fruit.y + random(-12, 12),
        vx: random(-1.8, 1.8),
        vy: random(-2.5, -0.5),
        size: random(8, 16),
        life: 1,
      })),
    };

    pointerRef.current = { down: false, last: null };

    if (soundRef.current) playGameSound("bomb");
  };

  // Pointer controls.
  const handlePointerDown = (event) => {
    if (status !== "playing") return;

    const game = gameRef.current;
    if (!game || game.bombHit || game.ended) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const rect = event.currentTarget.getBoundingClientRect();

    pointerRef.current = {
      down: true,
      last: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    };
  };

  const handlePointerMove = (event) => {
    if (status !== "playing" || !pointerRef.current.down) return;

    const game = gameRef.current;
    if (!game || game.bombHit || game.ended) return;

    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const previous = pointerRef.current.last;
    if (!previous) {
      pointerRef.current.last = point;
      return;
    }

    game.trail.push({ ...point, life: 1 });

    let slicedCount = 0;

    for (const fruit of game.fruits) {
      if (fruit.sliced) continue;

      const distance = pointToSegmentDistance(
        fruit,
        previous,
        point
      );

      if (distance >= fruit.radius + 13) continue;

      fruit.sliced = true;

      if (fruit.type === "bomb") {
        triggerBombExplosion(game, fruit);
        break;
      }

      slicedCount++;

      const now = performance.now();
      const isCombo =
        game.lastSliceAt > 0 && now - game.lastSliceAt < 850;

      game.combo = isCombo ? game.combo + 1 : 1;
      game.score += 10;

      if (isCombo) {
        game.score += Math.min(game.combo, 10) * 2;
      }

      for (let i = 0; i < 12; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(1.5, 5);

        game.particles.push({
          x: fruit.x,
          y: fruit.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: random(2, 5),
          color: [
            "#f8c17a",
            "#e0935e",
            "#f4e4c8",
            "#f5a35b",
          ][Math.floor(random(0, 4))],
        });
      }

      game.lastSliceAt = now;
    }

    if (slicedCount > 0 && soundRef.current) {
      playGameSound("slice");
    }

    pointerRef.current.last = point;
  };

  const handlePointerUp = () => {
    pointerRef.current = { down: false, last: null };
  };

  // Main animation engine.
  useEffect(() => {
    if (status !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    let animationFrame;
    let previousFrame = performance.now();

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (gameRef.current) {
        gameRef.current.width = rect.width;
        gameRef.current.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const spawnFruit = (game) => {
      // Zen stays calm and consistent. Survival modes ramp over time.
      const difficulty = mode === "zen"
        ? 0
        : Math.min(
            1,
            game.elapsed / (mode === "arcade" ? 75 : 100)
          );

      const bombChance = !config.bombs
        ? 0
        : mode === "arcade"
          ? 0.08 + difficulty * 0.17
          : 0.05 + difficulty * 0.15;

      const isBomb = Math.random() < bombChance;
      const radius = random(25, 36);

      const x = random(
        radius + 15,
        Math.max(radius + 16, game.width - radius - 15)
      );

      const speedMultiplier = mode === "zen"
        ? 0.82
        : mode === "arcade"
          ? 1.28 + difficulty * 0.85
          : 1 + difficulty * 0.65;

      game.fruits.push({
        x,
        y: game.height + radius,
        vx: random(-1.3, 1.3) * speedMultiplier,
        vy: mode === "zen"
          ? random(-10.5, -9.5)
          : mode === "arcade"
            ? random(-9.5, -8.5) * speedMultiplier
            : random(-12, -11),
        gravity: mode === "zen" ? 0.16 : 0.19 + difficulty * 0.09,
        radius,
        rotation: random(-0.4, 0.4),
        rotationSpeed: random(-0.06, 0.06),
        emoji: isBomb
          ? "💣"
          : FRUITS[Math.floor(random(0, FRUITS.length))],
        type: isBomb ? "bomb" : "fruit",
        sliced: false,
      });
    };

    // Safe explosion renderer. Every canvas radius is clamped positive.
    const drawExplosion = (game, now, dt) => {
      const explosion = game.bombExplosion;
      if (!explosion) return;

      const age = Math.max(0, now - explosion.start);
      const progress = Math.min(age / 650, 1);
      const width = game.width;
      const height = game.height;

      ctx.save();

      // Local flash around the bomb, not a full-screen flash.
      if (age < 160) {
        const flashAlpha = Math.max(0, 1 - age / 160);
        const flashRadius = Math.max(2, 240 * (1 - progress * 0.35));

        const flash = ctx.createRadialGradient(
          explosion.x,
          explosion.y,
          2,
          explosion.x,
          explosion.y,
          flashRadius
        );

        flash.addColorStop(
          0,
          `rgba(255,245,205,${0.65 * flashAlpha})`
        );
        flash.addColorStop(
          0.35,
          `rgba(255,145,65,${0.35 * flashAlpha})`
        );
        flash.addColorStop(1, "rgba(255,90,30,0)");

        ctx.fillStyle = flash;
        ctx.fillRect(0, 0, width, height);
      }

      // Expanding shockwave.
      const ringRadius = Math.max(1, progress * 145);

      ctx.beginPath();
      ctx.arc(
        explosion.x,
        explosion.y,
        ringRadius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(255,175,85,${Math.max(0, 1 - progress)})`;
      ctx.lineWidth = Math.max(1, 9 * (1 - progress));
      ctx.shadowColor = "#ff8b42";
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Inner glow.
      const coreRadius = Math.max(1, 55 * (1 - progress));

      const core = ctx.createRadialGradient(
        explosion.x,
        explosion.y,
        1,
        explosion.x,
        explosion.y,
        coreRadius
      );

      core.addColorStop(0, "rgba(255,255,220,0.95)");
      core.addColorStop(0.3, "rgba(255,180,75,0.85)");
      core.addColorStop(1, "rgba(180,40,20,0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(
        explosion.x,
        explosion.y,
        coreRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Sparks.
      explosion.sparks.forEach((spark) => {
        if (spark.life <= 0) return;

        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.vx *= 0.985;
        spark.vy = spark.vy * 0.985 + 0.07 * dt;
        spark.life = Math.max(0, spark.life - 0.025 * dt);

        const radius = Math.max(0.5, spark.size * spark.life);

        ctx.globalAlpha = spark.life;
        ctx.fillStyle = spark.color;
        ctx.shadowColor = spark.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Smoke.
      explosion.smoke.forEach((smoke) => {
        if (smoke.life <= 0) return;

        smoke.x += smoke.vx * dt;
        smoke.y += smoke.vy * dt;
        smoke.size += 0.12 * dt;
        smoke.life = Math.max(0, smoke.life - 0.018 * dt);

        ctx.globalAlpha = smoke.life * 0.3;
        ctx.fillStyle = "#65534a";
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(
          smoke.x,
          smoke.y,
          Math.max(1, smoke.size),
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.restore();

      // This condition always ends the blast after 650ms.
      if (age >= 650) {
        endGame();
      }
    };

    const draw = (now) => {
      const game = gameRef.current;
      if (!game || game.ended) return;

      const dt = Math.min((now - previousFrame) / 16.67, 2);
      previousFrame = now;

      const width = game.width;
      const height = game.height;

      ctx.clearRect(0, 0, width, height);

      // Arena grid.
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();

      // Explosion mode: no fruit movement or spawning during the blast.
      if (game.bombHit) {
        drawExplosion(game, now, dt);

        if (!game.ended) {
          animationFrame = requestAnimationFrame(draw);
        }
        return;
      }

      game.elapsed += (dt * 16.67) / 1000;

      if (config.duration > 0) {
        game.timeLeft = Math.max(
          0,
          config.duration - game.elapsed
        );
      }

      // Zen stays relaxed. Arcade ramps faster than Classic.
      const difficulty = mode === "zen"
        ? 0
        : Math.min(
            1,
            game.elapsed / (mode === "arcade" ? 75 : 100)
          );

      game.spawnTimer += dt * 16.67;

      const spawnInterval = mode === "zen"
        ? 1050
        : mode === "arcade"
          ? Math.max(300, 900 - difficulty * 520)
          : Math.max(430, 1250 - difficulty * 650);

      if (game.spawnTimer >= spawnInterval) {
        let waveSize;

        if (mode === "classic") {
          // Once the player reaches 150 points, Classic never sends a solo fruit.
          waveSize = game.score < 150
            ? Math.floor(random(1, 3))
            : Math.floor(random(2, 4));
        } else if (mode === "arcade") {
          // Arcade always starts with a pair, then scales to pairs or triples.
          waveSize = game.score < 150
            ? 2
            : Math.floor(random(2, 4));
        } else {
          // Zen sends relaxed pairs with no bombs or missed-fruit penalties.
          waveSize = 2;
        }

        for (let i = 0; i < waveSize; i++) {
          spawnFruit(game);
        }

        game.spawnTimer = 0;
      }

      // Fruit movement and drawing.
      game.fruits.forEach((fruit) => {
        fruit.x += fruit.vx * dt;
        fruit.y += fruit.vy * dt;
        fruit.vy += fruit.gravity * dt;
        fruit.rotation += fruit.rotationSpeed * dt;

        if (fruit.sliced) return;

        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);

        ctx.font = `${fruit.radius * 1.8}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor =
          fruit.type === "bomb"
            ? "rgba(230,70,50,0.5)"
            : "rgba(255,170,90,0.3)";
        ctx.shadowBlur = 18;

        ctx.fillText(fruit.emoji, 0, 0);
        ctx.restore();
      });

      // Missed fruit penalty.
      game.fruits.forEach((fruit) => {
        if (!fruit.sliced && fruit.y > height + fruit.radius) {
          if (fruit.type === "fruit" && config.lives > 0) {
            game.lives = Math.max(0, game.lives - 1);
            game.combo = 0;
          }

          fruit.sliced = true;
        }
      });

      game.fruits = game.fruits.filter((fruit) => !fruit.sliced);

      // Combo timeout.
      if (
        game.combo > 0 &&
        now - game.lastSliceAt > 850
      ) {
        game.combo = 0;
      }

      // Slice particles.
      game.particles.forEach((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 0.12 * dt;
        particle.life = Math.max(0, particle.life - 0.025 * dt);

        if (particle.life <= 0) return;

        const radius = Math.max(
          0.5,
          (particle.size || 4) * particle.life
        );

        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color || "#f4a36e";

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      game.particles = game.particles.filter(
        (particle) => particle.life > 0
      );

      ctx.globalAlpha = 1;

      // Blade trail.
      game.trail = game.trail.filter((point) => {
        point.life = Math.max(0, point.life - 0.07 * dt);
        return point.life > 0;
      });

      if (game.trail.length > 1) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < game.trail.length; i++) {
          const point = game.trail[i];
          const previous = game.trail[i - 1];

          ctx.beginPath();
          ctx.moveTo(previous.x, previous.y);
          ctx.lineTo(point.x, point.y);

          ctx.strokeStyle = `rgba(255,190,135,${point.life})`;
          ctx.lineWidth = 4 + point.life * 5;
          ctx.shadowColor = "#f4a36e";
          ctx.shadowBlur = 14;
          ctx.stroke();
        }

        ctx.restore();
      }

      // HUD updates.
      if (now - game.lastHudUpdate > 100) {
        setScore(game.score);
        setLives(game.lives);
        setCombo(game.combo);
        setElapsed(game.elapsed);

        if (config.duration > 0) {
          setTimeLeft(game.timeLeft);
        }

        game.lastHudUpdate = now;
      }

      // Normal game-over conditions.
      const noLives = config.lives > 0 && game.lives <= 0;
      const timeExpired =
        config.duration > 0 && game.timeLeft <= 0;

      if (noLives || timeExpired) {
        endGame();
        return;
      }

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      pointerRef.current = { down: false, last: null };
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [status, config, endGame]);

  const displayedTime =
    config.duration > 0
      ? formatTime(timeLeft)
      : formatTime(elapsed);

  return (
    <main className="game-page">
      <header className="game-navbar">
        <button className="game-back" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          <span>BACK TO HOME</span>
        </button>

        <div className="game-brand">
          <span className="game-brand-icon">S</span>
          SLICE <span>STORM</span>
        </div>

        <button
          className="game-sound"
          onClick={toggleSound}
          aria-label="Toggle sound"
        >
          {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>
      </header>

      <section className="game-main">
        <div className="game-heading">
          <span className="game-eyebrow">THE ARENA IS YOURS</span>
          <h1>{config.name} <span>MODE</span></h1>
          <p>Stay sharp. Slice fast. Survive the storm.</p>
        </div>

        <div className="game-hud">
          <div className="hud-item">
            <span><Target size={14} /> SCORE</span>
            <strong>{String(score).padStart(6, "0")}</strong>
          </div>

          <div className="hud-item">
            <span><Trophy size={14} /> BEST SCORE</span>
            <strong>{String(bestScore).padStart(6, "0")}</strong>
          </div>

          <div className="hud-item">
            <span><Zap size={14} /> COMBO</span>
            <strong>{combo}x</strong>
          </div>

          <div className="hud-item">
            <span><Clock3 size={14} /> TIME</span>
            <strong>{displayedTime}</strong>
          </div>

          <div className="hud-item lives-item">
            <span>
              <Heart size={14} /> {mode === "zen" ? "NO LIVES" : "LIVES"}
            </span>
            <strong>
              {config.lives === 0
                ? "∞"
                : "♥ ".repeat(lives).trim() || "0"}
            </strong>
          </div>
        </div>

        <motion.div
          className={`game-arena ${status === "paused" ? "arena-paused" : ""}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ position: "relative" }}
        >
          <div className="arena-top" style={{ zIndex: 5 }}>
            <span className="arena-live">
              <span className="live-dot"></span>
              {status === "playing"
                ? "ARENA LIVE"
                : status === "paused"
                ? "PAUSED"
                : status === "over"
                ? "RUN COMPLETE"
                : "ARENA READY"}
            </span>

            <span className="arena-level">
              {mode === "zen"
                ? "ZEN SESSION"
                : mode === "arcade"
                ? "ENDLESS SURVIVAL"
                : "SURVIVAL RUN"}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            className="game-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              touchAction: "none",
              zIndex: 1,
            }}
          />

          {status === "ready" && (
            <div className="arena-overlay" style={overlayStyle}>
              <div className="arena-center">
                <div className="arena-emblem">S</div>
                <span className="arena-small-label">READY YOUR BLADE</span>
                <h2>THE STORM<br />AWAITS.</h2>
                <p>
                  {mode === "zen"
                    ? "Relax, focus and slice without pressure."
                    : mode === "arcade"
                    ? "Endless survival. Slice fast, avoid bombs and protect your three lives."
                    : "Slice fruit. Avoid bombs. Protect your lives."}
                </p>
                <button className="arena-start-button" onClick={startGame}>
                  START GAME <Zap size={17} />
                </button>
              </div>
            </div>
          )}

          {status === "paused" && (
            <div className="arena-overlay" style={overlayStyle}>
              <div className="pause-overlay">
                <Pause size={35} />
                <h2>GAME PAUSED</h2>
                <button
                  className="arena-start-button"
                  onClick={() => setStatus("playing")}
                >
                  RESUME <Play size={17} />
                </button>
              </div>
            </div>
          )}

          {status === "over" && (
            <div className="arena-overlay" style={overlayStyle}>
              <div className="game-over-panel">
                <Trophy size={38} />
                <span className="arena-small-label">RUN COMPLETE</span>
                <h2>GAME OVER</h2>
                <p className="final-score-label">YOUR SCORE</p>
                <strong className="final-score">{score}</strong>

                {isNewRecord && (
                  <span className="new-record">
                    ✦ NEW PERSONAL BEST ✦
                  </span>
                )}

                <button className="arena-start-button" onClick={startGame}>
                  PLAY AGAIN <RotateCcw size={17} />
                </button>

                <button
                  className="game-home-button"
                  onClick={() => navigate("/")}
                >
                  <Home size={15} />
                  BACK TO HOME
                </button>
              </div>
            </div>
          )}

          <div className="arena-bottom" style={{ zIndex: 5 }}>
            <span>SLICE FRUIT</span>
            <span>{mode === "zen" ? "NO BOMBS" : "AVOID BOMBS"}</span>
            <span>BUILD COMBOS</span>
          </div>
        </motion.div>

        <div className="game-controls">
          <div>
            <strong>HOW TO PLAY</strong>
            <p>
              {mode === "zen"
                ? "Move your mouse or finger across the arena and enjoy a relaxed fruit-slicing session. No bombs or lives to worry about."
                : "Move your mouse or finger across the arena to slice fruit. Avoid bombs. One bomb ends your run!"}
            </p>
          </div>

          {status === "playing" && (
            <button
              className="pause-button"
              onClick={() => setStatus("paused")}
            >
              <Pause size={16} />
              PAUSE
            </button>
          )}

          {status === "paused" && (
            <button
              className="pause-button"
              onClick={() => setStatus("playing")}
            >
              <Play size={16} />
              RESUME
            </button>
          )}

          {status === "over" && (
            <button className="pause-button" onClick={startGame}>
              <RotateCcw size={16} />
              RESTART
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
