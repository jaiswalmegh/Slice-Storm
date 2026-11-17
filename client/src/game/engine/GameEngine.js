const FRUITS = [
  { name: "apple", color: "#ed394e", highlight: "#ff9b91", score: 10, radius: 27 },
  { name: "orange", color: "#f58a21", highlight: "#ffd17b", score: 15, radius: 26 },
  { name: "watermelon", color: "#e9405b", highlight: "#ff9ba5", score: 25, radius: 32 },
  { name: "kiwi", color: "#82a947", highlight: "#d4e58c", score: 20, radius: 25 },
  { name: "lemon", color: "#e9c92c", highlight: "#fff18a", score: 15, radius: 24 },
  { name: "plum", color: "#9554c7", highlight: "#d5a0f5", score: 20, radius: 25 },
  { name: "mango", color: "#ed8131", highlight: "#ffd16c", score: 25, radius: 29 }
];

const random = (min, max) => Math.random() * (max - min) + min;

const distanceToSegment = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;

  if (length === 0) return Math.hypot(px - ax, py - ay);

  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length)
  );

  return Math.hypot(
    px - (ax + t * dx),
    py - (ay + t * dy)
  );
};

export default class GameEngine {
  constructor(canvas, onUpdate, mode = "classic") {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onUpdate = onUpdate;
    this.mode = mode;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.objects = [];
    this.particles = [];
    this.trails = [];
    this.floatingTexts = [];

    this.score = 0;
    this.lives = 3;
    this.fruitsSliced = 0;
    this.bombsHit = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.level = 1;
    this.timeLeft = 60;

    this.running = false;
    this.gameOver = false;
    this.paused = false;
    this.gameOverPending = false;

    this.explosion = null;

    this.lastTime = 0;
    this.spawnTimer = 0;
    this.comboTimer = 0;
    this.elapsed = 0;

    this.pointer = null;
    this.previousPointer = null;

    this.animationFrame = null;

    this.onResize = this.resize.bind(this);
    this.resize();

    window.addEventListener("resize", this.onResize);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;

    if (!this.width || !this.height) return;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  start() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.reset();

    this.running = true;
    this.lastTime = performance.now();

    this.spawnFruit();
    this.spawnFruit();

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  reset() {
    this.objects = [];
    this.particles = [];
    this.trails = [];
    this.floatingTexts = [];

    this.score = 0;
    this.lives = 3;
    this.fruitsSliced = 0;
    this.bombsHit = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.level = 1;
    this.timeLeft = 60;

    this.elapsed = 0;
    this.spawnTimer = 0;
    this.comboTimer = 0;

    this.gameOver = false;
    this.gameOverPending = false;
    this.paused = false;

    this.explosion = null;

    this.pointer = null;
    this.previousPointer = null;

    this.emitUpdate();
  }

  setMode(mode) {
    this.mode = mode;
    this.emitUpdate();
  }

  pause() {
    if (!this.running || this.gameOver || this.paused || this.gameOverPending) {
      return;
    }

    this.paused = true;
    this.emitUpdate();
  }

  resume() {
    if (!this.running || this.gameOver || !this.paused) return;

    this.paused = false;
    this.lastTime = performance.now();

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    window.removeEventListener("resize", this.onResize);
  }

  loop = (timestamp) => {
    if (!this.running || this.paused) return;

    const delta = Math.min(
      (timestamp - this.lastTime) / 1000,
      0.035
    );

    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    if (this.running && !this.paused) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  };

  update(delta) {
    // CINEMATIC EXPLOSION SEQUENCE
    // Gameplay stops immediately when a bomb is hit.

    if (this.gameOverPending) {
      this.updateParticles(delta);
      this.updateTrails(delta);
      this.updateFloatingTexts(delta);

      if (this.explosion) {
        this.explosion.life -= delta;

        this.explosion.radius =
          this.explosion.maxRadius *
          (1 - this.explosion.life / this.explosion.maxLife);
      }

      if (this.explosion && this.explosion.life <= 0) {
        this.explosion = null;
        this.gameOverPending = false;
        this.endGame();
      }

      return;
    }

    this.elapsed += delta;

    if (this.mode === "arcade") {
      this.timeLeft = Math.max(0, 60 - this.elapsed);

      if (this.timeLeft <= 0) {
        this.endGame();
        return;
      }
    }

    this.comboTimer += delta;

    if (this.comboTimer > 1.4) {
      this.combo = 0;
    }

    this.level = 1 + Math.floor(this.score / 250);

    this.updateSpawning(delta);
    this.updateObjects(delta);
    this.updateParticles(delta);
    this.updateTrails(delta);
    this.updateFloatingTexts(delta);

    this.checkGameOver();
  }

  updateSpawning(delta) {
    this.spawnTimer += delta;

    // Gradual difficulty curve: starts relaxed and builds with score.
    const scoreProgress = Math.min(this.score / 1800, 1);
    const extraProgress = Math.max(0, this.score - 1800) / 1800;

    const interval = Math.max(
      0.82,
      1.95 - scoreProgress * 0.88 - extraProgress * 0.18
    );

    if (this.spawnTimer < interval) return;

    this.spawnTimer = 0;

    let minFruits = 1;
    let maxFruits = 2;

    if (this.score >= 200) {
      minFruits = 2;
      maxFruits = 3;
    }

    if (this.score >= 500) {
      minFruits = 3;
      maxFruits = 4;
    }

    if (this.score >= 1500) {
      minFruits = 3;
      maxFruits = 5;
    }

    const fruitCount = Math.floor(random(minFruits, maxFruits + 1));

    const bombChance = Math.min(
      0.025 +
        scoreProgress * 0.30 +
        extraProgress * 0.07 +
        Math.min(this.elapsed / 240, 0.035),
      0.42
    );

    let bombCount = 0;
    let finalFruitCount = fruitCount;

    if (
      this.mode !== "zen" &&
      this.elapsed > 12 &&
      Math.random() < bombChance
    ) {
      const patternRoll = Math.random();

      if (this.score < 500) {
        bombCount = 1;
      } else if (patternRoll < 0.48) {
        bombCount = 1;
        finalFruitCount = Math.max(3, fruitCount);
      } else if (patternRoll < 0.82) {
        bombCount = this.score >= 1200 ? 3 : 2;
        finalFruitCount = Math.random() < 0.5 ? 1 : 2;
      } else {
        bombCount = this.score >= 1500 ? 2 : 1;
        finalFruitCount = Math.max(2, fruitCount - 1);
      }
    }

    const wave = [];

    for (let i = 0; i < finalFruitCount; i++) wave.push("fruit");
    for (let i = 0; i < bombCount; i++) wave.push("bomb");

    // Randomize each wave so bombs do not always appear at the same edge.
    for (let i = wave.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wave[i], wave[j]] = [wave[j], wave[i]];
    }

    const usableWidth = Math.max(100, this.width * 0.76);
    const left = (this.width - usableWidth) / 2;
    const spacing = usableWidth / Math.max(wave.length, 1);

    wave.forEach((type, index) => {
      const x =
        left +
        spacing * (index + 0.5) +
        random(-spacing * 0.2, spacing * 0.2);

      if (type === "bomb") {
        this.spawnBomb(x);
      } else {
        this.spawnFruit(x);
      }
    });
  }

  spawnFruit(customX) {
    if (!this.width || !this.height) return;

    const type = FRUITS[
      Math.floor(Math.random() * FRUITS.length)
    ];

    const x = customX ?? random(
      Math.max(type.radius + 15, this.width * 0.12),
      Math.min(this.width - type.radius - 15, this.width * 0.88)
    );

    const scoreProgress = Math.min(this.score / 1800, 1);
    const extraProgress = Math.max(0, this.score - 1800) / 1800;
    const speedMultiplier =
      1 + scoreProgress * 0.42 + extraProgress * 0.12;

    const speed =
      (random(600, 730) + Math.min(this.level * 4, 70)) *
      speedMultiplier;

    this.objects.push({
      type: "fruit",
      name: type.name,
      color: type.color,
      highlight: type.highlight,
      score: type.score,
      radius: type.radius,

      x,
      y: this.height + type.radius + 15,

      vx: random(-105, 105),
      vy: -speed,

      gravity: 780,
      rotation: random(-1.5, 1.5),
      angle: random(-Math.PI, Math.PI),

      sliced: false,
      missed: false
    });
  }

  spawnBomb(customX) {
    if (!this.width || !this.height) return;

    const scoreProgress = Math.min(this.score / 1800, 1);
    const extraProgress = Math.max(0, this.score - 1800) / 1800;
    const speedMultiplier =
      1 + scoreProgress * 0.38 + extraProgress * 0.1;

    this.objects.push({
      type: "bomb",

      x: customX ?? random(this.width * 0.15, this.width * 0.85),
      y: this.height + 45,

      vx: random(-85, 85),
      vy: -random(600, 700) * speedMultiplier,

      gravity: 780,
      radius: 25,
      rotation: random(-1.5, 1.5),
      angle: 0,

      sliced: false
    });
  }

  updateObjects(delta) {
    let missedCount = 0;

    for (const object of this.objects) {
      if (object.sliced) continue;

      object.vy += object.gravity * delta;
      object.x += object.vx * delta;
      object.y += object.vy * delta;
      object.angle += object.rotation * delta;

      if (
        object.type === "fruit" &&
        !object.sliced &&
        !object.missed &&
        object.vy > 0 &&
        object.y - object.radius > this.height
      ) {
        object.missed = true;
        missedCount++;
      }
    }

    if (missedCount > 0 && this.mode === "classic") {
      this.lives = Math.max(0, this.lives - missedCount);

      this.addText(
        this.width / 2,
        this.height * 0.4,
        `-${missedCount} LIFE`,
        "#ff6b66",
        22
      );

      this.emitUpdate();
    }

    this.objects = this.objects.filter(object => {
      if (object.sliced || object.missed) return false;

      return (
        object.y < this.height + 100 &&
        object.x > -100 &&
        object.x < this.width + 100
      );
    });
  }

  checkGameOver() {
    if (this.mode === "classic" && this.lives <= 0) {
      this.endGame();
    }
  }

  pointerDown(x, y) {
    if (
      !this.running ||
      this.paused ||
      this.gameOver ||
      this.gameOverPending
    ) return;

    this.pointer = { x, y };
    this.previousPointer = { x, y };
  }

  pointerMove(x, y) {
    if (
      !this.pointer ||
      this.paused ||
      this.gameOver ||
      this.gameOverPending ||
      !this.running
    ) return;

    const previous = this.previousPointer;
    if (!previous) return;

    const distance = Math.hypot(
      x - previous.x,
      y - previous.y
    );

    if (distance > 2) {
      this.trails.push({
        x1: previous.x,
        y1: previous.y,
        x2: x,
        y2: y,
        life: 0.19,
        maxLife: 0.19
      });

      this.checkSlice(previous.x, previous.y, x, y);
    }

    this.pointer = { x, y };
    this.previousPointer = { x, y };
  }

  pointerUp() {
    this.pointer = null;
    this.previousPointer = null;
  }

  checkSlice(x1, y1, x2, y2) {
    if (this.gameOverPending || this.gameOver) return;

    let slicedCount = 0;
    let earnedPoints = 0;

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const object = this.objects[i];

      if (object.sliced || object.missed) continue;

      const distance = distanceToSegment(
        object.x,
        object.y,
        x1,
        y1,
        x2,
        y2
      );

      if (distance > object.radius + 10) continue;

      if (object.type === "bomb") {
        this.hitBomb(object);
        return;
      }

      object.sliced = true;
      slicedCount++;

      earnedPoints += object.score;

      this.sliceFruit(
        object,
        x2 - x1,
        y2 - y1
      );
    }

    if (slicedCount === 0) return;

    this.fruitsSliced += slicedCount;

    this.combo += slicedCount;
    this.bestCombo = Math.max(
      this.bestCombo,
      this.combo
    );

    this.comboTimer = 0;

    const bonus = slicedCount >= 3
      ? slicedCount * 10
      : 0;

    const totalPoints = earnedPoints + bonus;

    this.score += totalPoints;

    if (this.combo >= 3) {
      this.addText(
        x2,
        y2 - 45,
        `COMBO x${this.combo}`,
        "#ffad50",
        24
      );
    }

    this.addText(
      x2,
      y2 - 12,
      `+${totalPoints}`,
      "#ffffff",
      20
    );

    this.emitUpdate();
  }

    sliceFruit(fruit, dx, dy) {
    const angle = Math.atan2(dy, dx);
    const spread = angle + Math.PI / 2;

    const halfRadius = fruit.radius * 0.72;

    // Fruit-specific juicy splash.
    const juiceColors = {
      apple: ["#ff5265", "#ffb0a5", "#fff0d9"],
      orange: ["#ff9b26", "#ffd16a", "#fff0a8"],
      watermelon: ["#ff496c", "#ff9db0", "#fff0dc"],
      kiwi: ["#8dbb45", "#cce88a", "#fff2c5"],
      lemon: ["#f4d83d", "#fff18a", "#fffbd1"],
      plum: ["#a45bd0", "#d9a0f5", "#f4dcff"],
      mango: ["#ff9639", "#ffd16c", "#fff0a8"]
    };

    const colors = juiceColors[fruit.name] || [fruit.color, fruit.highlight, "#ffffff"];

    this.createJuice(
      fruit.x,
      fruit.y,
      fruit.color,
      14
    );

    // Extra directional juice droplets.
    for (let i = 0; i < 12; i++) {
      const direction = random(-0.9, 0.9);
      const speed = random(140, 360);

      this.particles.push({
        type: "juice",
        x: fruit.x,
        y: fruit.y,
        vx: Math.cos(angle + direction) * speed,
        vy: Math.sin(angle + direction) * speed,
        gravity: 480,
        radius: random(2, 5),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: random(0.35, 0.75),
        maxLife: 0.75,
        rotation: random(-4, 4)
      });
    }

    this.createSpark(fruit.x, fruit.y);

    // Two separated fruit halves with their original fruit identity.
    for (const side of [-1, 1]) {
      this.particles.push({
        type: "half",
        x: fruit.x,
        y: fruit.y,

        vx: Math.cos(spread) * 125 * side,
        vy: Math.sin(spread) * 125 * side - 75,

        gravity: 680,
        radius: halfRadius,
        color: fruit.color,
        highlight: fruit.highlight,
        fruitName: fruit.name,

        angle: fruit.angle,
        rotation: random(-4, 4),
        side,

        life: 1.1,
        maxLife: 1.1
      });
    }
  }

  // MASSIVE BOMB EXPLOSION

  hitBomb(bomb) {
    if (bomb.sliced || this.gameOver || this.gameOverPending) {
      return;
    }

    bomb.sliced = true;
    this.bombsHit++;

    this.gameOverPending = true;

    this.pointerUp();

    this.explosion = {
      x: bomb.x,
      y: bomb.y,
      radius: 0,
      maxRadius: Math.min(260, Math.max(170, Math.min(this.width, this.height) * 0.42)),
      life: 1.2,
      maxLife: 1.2
    };

    // Optimized explosion burst with fewer particles for smoother rendering.

    const explosionColors = [
      "#ff3015",
      "#ff5420",
      "#ff792b",
      "#ffae35",
      "#ffe17b",
      "#ffffff"
    ];

    for (let i = 0; i < 80; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(120, 850);

      const color = explosionColors[
        Math.floor(Math.random() * explosionColors.length)
      ];

      this.particles.push({
        type: "explosion",

        x: bomb.x,
        y: bomb.y,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        gravity: random(100, 350),
        radius: random(3, 12),

        color,
        life: random(0.5, 1.2),
        maxLife: 1.2
      });
    }

    // Secondary bright sparks

    for (let i = 0; i < 24; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(250, 700);

      this.particles.push({
        type: "spark",

        x: bomb.x,
        y: bomb.y,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        gravity: 100,
        radius: random(3, 9),

        color: "#ffffff",
        life: random(0.25, 0.5),
        maxLife: 0.5
      });
    }

    // Fire and smoke

    for (let i = 0; i < 20; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(40, 250);

      this.particles.push({
        type: "smoke",

        x: bomb.x + random(-10, 10),
        y: bomb.y + random(-10, 10),

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,

        gravity: -30,
        radius: random(12, 35),

        color: i % 2 === 0 ? "#ff682a" : "#49312b",
        life: random(0.6, 1.2),
        maxLife: 1.2
      });
    }

    this.addText(
      bomb.x,
      bomb.y - 65,
      "BOOOOOOM!",
      "#ff542b",
      48
    );

    this.emitUpdate();
  }

  createJuice(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(90, 370);

      this.particles.push({
        type: "drop",

        x,
        y,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        gravity: 550,
        radius: random(2, 6),

        color,
        life: random(0.4, 0.9),
        maxLife: 0.9
      });
    }
  }

  createSpark(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(70, 250);

      this.particles.push({
        type: "spark",

        x,
        y,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        gravity: 0,
        radius: random(1, 3),

        color: "#fff0ba",
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  addText(x, y, text, color, size) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      life: 0.9,
      maxLife: 0.9
    });
  }

    updateParticles(delta) {
    this.particles.forEach(particle => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;

      particle.vy += particle.gravity * delta;
      particle.life -= delta;

      if (particle.type === "half") {
        particle.angle += particle.rotation * delta;
      }

      if (particle.type === "juice") {
        particle.rotation += delta * 2;
      }
    });

    this.particles = this.particles.filter(
      particle => particle.life > 0
    );
  }
  updateTrails(delta) {
    this.trails.forEach(trail => {
      trail.life -= delta;
    });

    this.trails = this.trails.filter(
      trail => trail.life > 0
    );
  }

  updateFloatingTexts(delta) {
    this.floatingTexts.forEach(text => {
      text.y -= 55 * delta;
      text.life -= delta;
    });

    this.floatingTexts = this.floatingTexts.filter(
      text => text.life > 0
    );
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    this.drawBackground(ctx);
    this.drawObjects(ctx);
    this.drawParticles(ctx);
    this.drawTrails(ctx);
    this.drawExplosion(ctx);
    this.drawFloatingTexts(ctx);

    ctx.restore();
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(
      0, 0, 0, this.height
    );

    gradient.addColorStop(0, "#21150f");
    gradient.addColorStop(0.5, "#170f0c");
    gradient.addColorStop(1, "#0e0b09");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const glow = ctx.createRadialGradient(
      this.width / 2,
      this.height * 0.4,
      0,
      this.width / 2,
      this.height * 0.4,
      this.width * 0.65
    );

    glow.addColorStop(0, "rgba(255,125,42,0.12)");
    glow.addColorStop(1, "rgba(255,125,42,0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = "rgba(255,180,110,0.035)";
    ctx.lineWidth = 1;

    for (let y = 30; y < this.height; y += 65) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  }

  drawObjects(ctx) {
    this.objects.forEach(object => {
      if (object.sliced || object.missed) return;

      ctx.save();

      ctx.translate(object.x, object.y);
      ctx.rotate(object.angle);

      if (object.type === "bomb") {
        this.drawBomb(ctx, object);
      } else {
        this.drawFruit(ctx, object);
      }

      ctx.restore();
    });
  }

    drawFruit(ctx, fruit) {
    const r = fruit.radius;

    // Natural fruit silhouette, without the artificial outer glow.
    ctx.save();

    if (fruit.name === "apple") {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.88);
      ctx.bezierCurveTo(r * 0.18, -r * 1.08, r * 0.55, -r * 0.93, r * 0.78, -r * 0.55);
      ctx.bezierCurveTo(r * 1.08, -r * 0.12, r * 0.88, r * 0.62, r * 0.38, r * 0.9);
      ctx.bezierCurveTo(r * 0.12, r * 1.04, -r * 0.12, r * 1.04, -r * 0.38, r * 0.9);
      ctx.bezierCurveTo(-r * 0.88, r * 0.62, -r * 1.08, -r * 0.12, -r * 0.78, -r * 0.55);
      ctx.bezierCurveTo(-r * 0.55, -r * 0.93, -r * 0.18, -r * 1.08, 0, -r * 0.88);
      ctx.closePath();
    } else if (fruit.name === "lemon") {
      ctx.beginPath();
      ctx.moveTo(-r * 0.98, 0);
      ctx.quadraticCurveTo(-r * 0.55, -r * 0.72, 0, -r * 0.68);
      ctx.quadraticCurveTo(r * 0.55, -r * 0.72, r * 0.98, 0);
      ctx.quadraticCurveTo(r * 0.55, r * 0.72, 0, r * 0.68);
      ctx.quadraticCurveTo(-r * 0.55, r * 0.72, -r * 0.98, 0);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }

    const gradient = ctx.createRadialGradient(
      -r * 0.34,
      -r * 0.42,
      r * 0.04,
      r * 0.12,
      r * 0.12,
      r * 1.22
    );

    gradient.addColorStop(0, fruit.highlight);
    gradient.addColorStop(0.38, fruit.color);
    gradient.addColorStop(0.78, fruit.color);
    gradient.addColorStop(1, "rgba(35, 18, 20, 0.72)");

    ctx.fillStyle = gradient;
    ctx.fill();

    // Fine, low-contrast skin texture.
    ctx.save();
    ctx.beginPath();

    if (fruit.name === "apple") {
      ctx.moveTo(0, -r * 0.88);
      ctx.bezierCurveTo(r * 0.18, -r * 1.08, r * 0.55, -r * 0.93, r * 0.78, -r * 0.55);
      ctx.bezierCurveTo(r * 1.08, -r * 0.12, r * 0.88, r * 0.62, r * 0.38, r * 0.9);
      ctx.bezierCurveTo(r * 0.12, r * 1.04, -r * 0.12, r * 1.04, -r * 0.38, r * 0.9);
      ctx.bezierCurveTo(-r * 0.88, r * 0.62, -r * 1.08, -r * 0.12, -r * 0.78, -r * 0.55);
      ctx.bezierCurveTo(-r * 0.55, -r * 0.93, -r * 0.18, -r * 1.08, 0, -r * 0.88);
      ctx.closePath();
    } else if (fruit.name === "lemon") {
      ctx.ellipse(0, 0, r, r * 0.68, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }

    ctx.clip();

    if (fruit.name === "orange" || fruit.name === "lemon") {
      for (let i = 0; i < 34; i++) {
        const angle = i * 2.399;
        const distance = r * (0.18 + ((i * 7) % 11) / 14);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        ctx.fillStyle = i % 2 === 0
          ? "rgba(255, 239, 173, 0.22)"
          : "rgba(104, 65, 18, 0.12)";

        ctx.beginPath();
        ctx.arc(x, y, i % 3 === 0 ? 1.15 : 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (fruit.name !== "watermelon" && fruit.name !== "kiwi") {
      for (let i = 0; i < 11; i++) {
        const angle = i * 2.4;
        const distance = r * (0.25 + (i % 4) * 0.13);

        ctx.fillStyle = "rgba(65, 28, 24, 0.10)";
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance,
          0.8,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();

    // Soft natural reflection, not an outer glow.
    ctx.fillStyle = "rgba(255,255,255,0.19)";
    ctx.beginPath();
    ctx.ellipse(
      -r * 0.31,
      -r * 0.37,
      r * 0.12,
      r * 0.23,
      -0.55,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Stem and leaf.
    ctx.strokeStyle = "#55331f";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.82);
    ctx.quadraticCurveTo(2, -r * 1.02, 4, -r * 1.12);
    ctx.stroke();

    ctx.fillStyle = "#579447";
    ctx.beginPath();
    ctx.ellipse(9, -r * 1.02, 7, 3.2, -0.55, 0, Math.PI * 2);
    ctx.fill();

    if (fruit.name === "watermelon") {
      ctx.strokeStyle = "#a4ef85";
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(31, 105, 52, 0.55)";
      ctx.lineWidth = 2;

      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.25, -r * 0.78);
        ctx.quadraticCurveTo(i * r * 0.12, 0, i * r * 0.25, r * 0.78);
        ctx.stroke();
      }
    }

    if (fruit.name === "kiwi") {
      ctx.fillStyle = "#fff1c5";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;

        ctx.fillStyle = "#38291d";
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * r * 0.48,
          Math.sin(angle) * r * 0.48,
          1.2,
          2.2,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawBomb(ctx, bomb) {
    const r = bomb.radius;

    ctx.shadowColor = "#ff522e";
    ctx.shadowBlur = 17;

    const gradient = ctx.createRadialGradient(
      -8, -9, 2, 0, 0, r
    );

    gradient.addColorStop(0, "#55565b");
    gradient.addColorStop(0.6, "#24252a");
    gradient.addColorStop(1, "#08090c");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#ff6844";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ffad51";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(4, -r + 5);
    ctx.lineTo(11, -r - 7);
    ctx.stroke();

    ctx.fillStyle = "#ffbe54";

    ctx.beginPath();
    ctx.arc(13, -r - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff6545";
    ctx.font = "bold 19px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 0, 1);
  }

    drawParticles(ctx) {
    this.particles.forEach(particle => {
      const alpha = Math.max(
        0,
        particle.life / (particle.maxLife || 1)
      );

      ctx.save();
      ctx.globalAlpha = alpha;

      if (particle.type === "half") {
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);

        const r = particle.radius;
        const side = particle.side;

        // Outer fruit skin.
        ctx.beginPath();

        if (side === 1) {
          ctx.arc(0, 0, r, Math.PI, 0);
          ctx.lineTo(r, 0);
        } else {
          ctx.arc(0, 0, r, 0, Math.PI);
          ctx.lineTo(-r, 0);
        }

        ctx.closePath();
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Inner juicy flesh.
        const fleshColors = {
          apple: "#ffe0b7",
          orange: "#ffbd52",
          watermelon: "#ff9eaa",
          kiwi: "#d6e88b",
          lemon: "#fff19a",
          plum: "#e5b9ef",
          mango: "#ffd47b"
        };

        const flesh = fleshColors[particle.fruitName] || "#ffe0b7";

        ctx.beginPath();

        if (side === 1) {
          ctx.arc(0, 0, r * 0.83, Math.PI, 0);
          ctx.lineTo(r * 0.83, 0);
        } else {
          ctx.arc(0, 0, r * 0.83, 0, Math.PI);
          ctx.lineTo(-r * 0.83, 0);
        }

        ctx.closePath();
        ctx.fillStyle = flesh;
        ctx.fill();

        // Fruit-specific cut details.
        if (particle.fruitName === "watermelon") {
          ctx.fillStyle = "#39251f";

          for (let i = 0; i < 5; i++) {
            const x = (i - 2) * r * 0.23;
            const y = side * -r * 0.25;

            ctx.beginPath();
            ctx.ellipse(x, y, 1.7, 3.2, -0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (particle.fruitName === "kiwi") {
          ctx.fillStyle = "#fff6d8";

          ctx.beginPath();
          ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#3c3020";

          for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;

            ctx.beginPath();
            ctx.arc(
              Math.cos(angle) * r * 0.42,
              Math.sin(angle) * r * 0.42,
              1.4,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        if (
          particle.fruitName === "orange" ||
          particle.fruitName === "lemon"
        ) {
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = 1.5;

          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(i * r * 0.2, side * -r * 0.72);
            ctx.stroke();
          }
        }

        // Fresh cut edge.
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(-r * 0.82, 0);
        ctx.lineTo(r * 0.82, 0);
        ctx.stroke();

      } else {
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 0;

        if (particle.type === "explosion") {
          ctx.globalCompositeOperation = "lighter";
        }

        if (particle.type === "smoke") {
          ctx.globalAlpha = alpha * 0.5;
        }

        if (particle.type === "juice") {
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation * (1 - alpha));

          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            particle.radius * 0.65,
            particle.radius * 1.5,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          ctx.beginPath();

          ctx.arc(
            particle.x,
            particle.y,
            Math.max(0.5, particle.radius * alpha),
            0,
            Math.PI * 2
          );

          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  drawTrails(ctx) {
    this.trails.forEach(trail => {
      const alpha = trail.life / trail.maxLife;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = "round";

      const gradient = ctx.createLinearGradient(
        trail.x1,
        trail.y1,
        trail.x2,
        trail.y2
      );

      gradient.addColorStop(0, "rgba(69,216,233,0)");
      gradient.addColorStop(0.5, "#e5ffff");
      gradient.addColorStop(1, "#ff9b47");

      ctx.strokeStyle = gradient;
      ctx.shadowColor = "#4de8ff";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 5 * alpha + 1;

      ctx.beginPath();
      ctx.moveTo(trail.x1, trail.y1);
      ctx.lineTo(trail.x2, trail.y2);
      ctx.stroke();

      ctx.restore();
    });
  }

  // LARGE CINEMATIC EXPLOSION

  drawExplosion(ctx) {
    if (!this.explosion) return;

    const e = this.explosion;
    const progress = 1 - e.life / e.maxLife;

    ctx.save();

    // Local shockwave: it stays around the bomb instead of covering the screen.

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);

    ctx.strokeStyle = `rgba(255, 125, 45, ${Math.max(0, e.life / e.maxLife)})`;
    ctx.lineWidth = 9 * (1 - progress) + 2;
    ctx.shadowColor = "#ff4b1c";
    ctx.shadowBlur = 14;
    ctx.stroke();

    // Fireball

    const radius = 22 + progress * 135;

    const gradient = ctx.createRadialGradient(
      e.x, e.y, 2,
      e.x, e.y, radius
    );

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.15, "#fff2a3");
    gradient.addColorStop(0.4, "#ffad32");
    gradient.addColorStop(0.7, "#ff4b20");
    gradient.addColorStop(1, "rgba(160,20,5,0)");

    ctx.globalAlpha = Math.min(1, e.life * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#ff4b20";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawFloatingTexts(ctx) {
    this.floatingTexts.forEach(text => {
      ctx.save();

      ctx.globalAlpha = text.life / text.maxLife;
      ctx.fillStyle = text.color;
      ctx.font = `900 ${text.size}px Arial`;
      ctx.textAlign = "center";

      ctx.shadowColor = text.color;
      ctx.shadowBlur = 15;

      ctx.fillText(text.text, text.x, text.y);

      ctx.restore();
    });
  }

  endGame() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.gameOverPending = false;
    this.running = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.emitUpdate();
  }

  getState() {
    return {
      score: this.score,
      lives: this.lives,
      combo: this.combo,
      bestCombo: this.bestCombo,
      level: this.level,
      timeLeft: Math.ceil(this.timeLeft),
      fruitsSliced: this.fruitsSliced,
      bombsHit: this.bombsHit,
      mode: this.mode,
      paused: this.paused,
      gameOver: this.gameOver
    };
  }

  emitUpdate() {
    this.onUpdate?.(this.getState());
  }
}