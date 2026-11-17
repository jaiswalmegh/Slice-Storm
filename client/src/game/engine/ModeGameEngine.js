
import GameEngine from "./GameEngine.js";

/**
 * Mode-specific rules layered over the finalised Classic engine.
 * Classic keeps the original GameEngine behaviour unchanged.
 */
export default class ModeGameEngine extends GameEngine {
  constructor(canvas, onUpdate, mode = "classic") {
    super(canvas, onUpdate, mode);

    this.mode = mode;
    this.activeMode = mode;
    this.timeLeft = mode === "zen" ? 90 : 0;
    this.lastTimerSecond = mode === "zen" ? 90 : 0;
  }

  start() {
    super.start();

    // Arcade starts with one additional fruit for immediate intensity.
    if (this.activeMode === "arcade") {
      this.spawnFruit();
    }
  }

  reset() {
    super.reset();

    this.timeLeft = this.activeMode === "zen" ? 90 : 0;
    this.lastTimerSecond = this.timeLeft;

    this.emitUpdate();
  }

  setMode(mode) {
    this.activeMode = mode;
    this.mode = mode;

    this.timeLeft = mode === "zen" ? 90 : 0;
    this.lastTimerSecond = this.timeLeft;

    super.setMode(mode);
  }

  getState() {
    const state = super.getState();

    return {
      ...state,
      mode: this.activeMode,
      lives: this.activeMode === "zen" ? 0 : state.lives,
      timeLeft:
        this.activeMode === "zen"
          ? Math.ceil(this.timeLeft)
          : 0
    };
  }

  update(delta) {
    if (this.activeMode === "arcade") {
      // Disable the original 60-second Arcade timer.
      // Internally use Classic's life and bomb consequences.
      const previousMode = this.mode;

      this.mode = "classic";
      super.update(delta);
      this.mode = previousMode;

      return;
    }

    if (this.activeMode === "zen") {
      const previousSecond = Math.ceil(this.timeLeft);

      super.update(delta);

      this.timeLeft = Math.max(0, 90 - this.elapsed);

      const currentSecond = Math.ceil(this.timeLeft);

      if (
        this.timeLeft <= 0 &&
        !this.gameOver &&
        !this.gameOverPending
      ) {
        this.endGame();
        return;
      }

      if (currentSecond !== previousSecond) {
        this.lastTimerSecond = currentSecond;
        this.emitUpdate();
      }

      return;
    }

    super.update(delta);
  }

  updateSpawning(delta) {
    if (this.activeMode === "classic") {
      super.updateSpawning(delta);
      return;
    }

    this.spawnTimer += delta;

    const scoreProgress = Math.min(this.score / 1800, 1);
    const extraProgress =
      Math.max(0, this.score - 1800) / 1800;

    const interval =
      this.activeMode === "arcade"
        ? Math.max(
            0.58,
            0.92 -
              scoreProgress * 0.24 -
              extraProgress * 0.10
          )
        : 1.45;

    if (this.spawnTimer < interval) return;

    this.spawnTimer = 0;

    const minFruits =
      this.activeMode === "arcade" ? 2 : 1;

    const maxFruits =
      this.activeMode === "arcade" ? 4 : 2;

    const fruitCount =
      Math.floor(
        Math.random() * (maxFruits - minFruits + 1)
      ) + minFruits;

    const bombChance =
      this.activeMode === "arcade"
        ? Math.min(0.12 + scoreProgress * 0.16, 0.28)
        : 0.12;

    let bombCount = 0;
    let finalFruitCount = fruitCount;

    if (Math.random() < bombChance) {
      if (this.activeMode === "arcade") {
        bombCount = Math.random() < 0.20 ? 2 : 1;

        finalFruitCount = Math.max(
          2,
          fruitCount - (bombCount === 2 ? 1 : 0)
        );
      } else {
        bombCount = 1;
      }
    }

    const wave = [];

    for (let i = 0; i < finalFruitCount; i++) {
      wave.push("fruit");
    }

    for (let i = 0; i < bombCount; i++) {
      wave.push("bomb");
    }

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
        (Math.random() * 0.4 - 0.2) * spacing;

      if (type === "bomb") {
        this.spawnBomb(x);
      } else {
        this.spawnFruit(x);
      }
    });
  }

  spawnFruit(customX) {
    const previousMode = this.mode;

    this.mode = this.activeMode;
    super.spawnFruit(customX);
    this.mode = previousMode;

    if (this.activeMode === "arcade") {
      const fruit = this.objects[this.objects.length - 1];

      if (fruit?.type === "fruit") {
        const scoreProgress = Math.min(
          this.score / 1800,
          1
        );

        fruit.vy *= 1.28 + scoreProgress * 0.18;
      }
    }
  }

  spawnBomb(customX) {
    const previousMode = this.mode;

    this.mode = this.activeMode;
    super.spawnBomb(customX);
    this.mode = previousMode;

    if (this.activeMode === "arcade") {
      const bomb = this.objects[this.objects.length - 1];

      if (bomb?.type === "bomb") {
        bomb.vy *= 1.22;
      }
    }
  }

  updateObjects(delta) {
    if (this.activeMode !== "zen") {
      super.updateObjects(delta);
      return;
    }

    const possibleMisses = this.objects.filter(
      object =>
        object.type === "fruit" &&
        !object.sliced &&
        !object.missed &&
        object.vy > 0
    );

    super.updateObjects(delta);

    const missedCount = possibleMisses.filter(
      object => object.missed
    ).length;

    if (missedCount > 0) {
      const penalty = missedCount * 20;

      this.score = Math.max(
        0,
        this.score - penalty
      );

      this.addText(
        this.width / 2,
        this.height * 0.4,
        `-${penalty} POINTS`,
        "#ff6b66",
        22
      );

      this.emitUpdate();
    }
  }

  hitBomb(bomb) {
    if (this.activeMode !== "zen") {
      super.hitBomb(bomb);
      return;
    }

    if (
      bomb.sliced ||
      this.gameOver ||
      this.gameOverPending
    ) {
      return;
    }

    bomb.sliced = true;
    this.bombsHit++;

    this.score = Math.max(
      0,
      this.score - 50
    );

    this.addText(
      bomb.x,
      bomb.y - 35,
      "-50 POINTS",
      "#ff5252",
      30
    );

    this.createSpark(bomb.x, bomb.y);
    this.emitUpdate();
  }
}
