import { createInput } from '../systems/input.js';
import { cameraShake, hitstop, spawnDamageNumber, spawnParticles } from '../systems/fx.js';
import { createRng } from '../systems/rng.js';
import { loadSave, addGold, formatGold } from '../systems/save.js';
import { createBaseStats, upgrades } from '../systems/balance.js';
import { createLootChoices } from '../ui/lootChoice.js';
import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';

export default class RunScene extends Phaser.Scene {
  constructor() {
    super('RunScene');
  }

  create() {
    this.cameras.main.fadeIn(300, 6, 10, 18);
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0f1a);
    this.add.rectangle(width / 2, height / 2, width - 120, height - 80, 0x101826).setAlpha(0.4);

    this.rng = createRng(Date.now());
    this.save = loadSave();
    this.stats = createBaseStats(this.save.meta);

    this.player = new Player(this, width / 2, height / 2, this.stats);
    this.inputState = createInput(this);
    this.lastMove = new Phaser.Math.Vector2(1, 0);

    this.enemies = [];
    this.enemyGroup = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.wave = 1;
    this.goldEarned = 0;
    this.isChoosing = false;
    this.lastShot = 0;

    this.createUI();
    this.spawnWave();

    this.physics.add.overlap(this.bullets, this.enemyGroup, (bullet, enemySprite) => {
      bullet.destroy();
      const enemy = enemySprite.getData('ref');
      this.damageEnemy(enemy, this.stats.damage, false);
    });

    this.physics.add.overlap(this.player.sprite, this.enemyGroup, (playerSprite, enemySprite) => {
      const enemy = enemySprite.getData('ref');
      if (!enemy || enemy.lastHit && this.time.now - enemy.lastHit < 600) return;
      enemy.lastHit = this.time.now;
      const mitigated = enemy.damage * (1 - Phaser.Math.Clamp(this.stats.armor, 0, 0.7));
      if (this.player.isDashing) return;
      this.player.takeDamage(mitigated);
      spawnDamageNumber(this, playerSprite.x, playerSprite.y - 20, Math.round(mitigated), '#ff9b9b');
      cameraShake(this, 0.01, 120);
      hitstop(this, 60);
      this.updateUI();
      if (this.stats.health <= 0) {
        this.endRun();
      }
    });

    this.createOrbitals();
  }

  createUI() {
    const { width } = this.scale;
    this.ui = {};

    this.ui.topBar = this.add.container(width / 2, 32);
    const bar = this.add.graphics();
    bar.fillStyle(0x0d1624, 0.9);
    bar.lineStyle(1, 0x2a3b5c, 0.9);
    bar.fillRoundedRect(-360, -18, 720, 36, 18);
    bar.strokeRoundedRect(-360, -18, 720, 36, 18);

    this.ui.waveText = this.add.text(-310, 0, 'Wave 1', {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '14px',
      color: '#9fb0d9',
    }).setOrigin(0, 0.5);

    this.ui.goldText = this.add.text(0, 0, 'Gold 0', {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '14px',
      color: '#f7d37c',
    }).setOrigin(0.5);

    this.ui.healthText = this.add.text(310, 0, 'HP 100/100', {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '14px',
      color: '#7bd9b8',
    }).setOrigin(1, 0.5);

    this.ui.topBar.add([bar, this.ui.waveText, this.ui.goldText, this.ui.healthText]);

    this.ui.dashContainer = this.add.container(90, this.scale.height - 40);
    const dashBg = this.add.graphics();
    dashBg.fillStyle(0x0f1a2a, 0.9);
    dashBg.lineStyle(1, 0x39527a, 0.9);
    dashBg.fillRoundedRect(-60, -18, 120, 36, 14);
    dashBg.strokeRoundedRect(-60, -18, 120, 36, 14);

    this.ui.dashFill = this.add.rectangle(-56, -12, 112, 24, 0x7fc7ff, 0.8).setOrigin(0, 0);
    this.ui.dashText = this.add.text(0, 0, 'Dash 1', {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '12px',
      color: '#d3e6ff',
    }).setOrigin(0.5);
    this.ui.dashContainer.add([dashBg, this.ui.dashFill, this.ui.dashText]);

    this.updateUI();
  }

  spawnWave() {
    const { width, height } = this.scale;
    const count = 4 + this.wave * 2;
    for (let i = 0; i < count; i += 1) {
      const edge = this.rng.pick(['top', 'bottom', 'left', 'right']);
      let x = 0;
      let y = 0;
      if (edge === 'top') {
        x = this.rng.range(80, width - 80);
        y = 70;
      } else if (edge === 'bottom') {
        x = this.rng.range(80, width - 80);
        y = height - 70;
      } else if (edge === 'left') {
        x = 70;
        y = this.rng.range(80, height - 80);
      } else {
        x = width - 70;
        y = this.rng.range(80, height - 80);
      }
      const enemy = new Enemy(this, x, y, this.wave);
      enemy.sprite.setData('ref', enemy);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }

    this.updateUI();
  }

  createOrbitals() {
    if (this.orbitals) {
      this.orbitals.forEach((item) => item.orb.destroy());
    }
    this.orbitals = [];
    if (!this.stats.orbitals) return;
    for (let i = 0; i < this.stats.orbitals; i += 1) {
      const orb = this.add.circle(this.player.sprite.x, this.player.sprite.y, 6, 0x7af4ff, 0.9);
      this.orbitals.push({ orb, angle: i * (Math.PI * 2) / this.stats.orbitals });
    }
  }

  updateOrbitals() {
    if (!this.orbitals.length) return;
    this.orbitals.forEach((item, index) => {
      item.angle += 0.03 + index * 0.001;
      const radius = 36;
      item.orb.x = this.player.sprite.x + Math.cos(item.angle) * radius;
      item.orb.y = this.player.sprite.y + Math.sin(item.angle) * radius;
    });
  }

  fireAtTarget(target) {
    const origin = new Phaser.Math.Vector2(this.player.sprite.x, this.player.sprite.y);
    const angle = Phaser.Math.Angle.BetweenPoints(origin, target);
    const hasBulletTexture = this.textures.exists('bullet') && this.textures.get('bullet').key !== '__MISSING';
    if (!hasBulletTexture) {
      const fallback = this.add.circle(origin.x, origin.y, 4, 0xffd166, 1);
      this.physics.add.existing(fallback);
      fallback.body.setCircle(4);
      this.bullets.add(fallback);
      fallback.setData('isFallback', true);
      this.physics.velocityFromRotation(angle, 420, fallback.body.velocity);
      this.time.delayedCall(1400, () => fallback.destroy());
      return;
    }
    const bullet = this.physics.add.image(origin.x, origin.y, 'bullet');
    bullet.setScale(0.7);
    this.bullets.add(bullet);
    this.physics.velocityFromRotation(angle, 420, bullet.body.velocity);
    this.time.delayedCall(1400, () => bullet.destroy());
  }

  damageEnemy(enemy, amount, isChain) {
    if (!enemy) return;
    const isCrit = this.rng.next() < this.stats.critChance;
    const finalDamage = isCrit ? amount * this.stats.critDamage : amount;
    enemy.takeDamage(finalDamage);
    spawnDamageNumber(this, enemy.sprite.x, enemy.sprite.y - 18, Math.round(finalDamage), isCrit ? '#ffd166' : '#c7d8ff');
    spawnParticles(this, enemy.sprite.x, enemy.sprite.y, isCrit ? 0xffd166 : 0x7fc7ff);
    cameraShake(this, 0.006, 60);
    hitstop(this, 40);

    if (this.stats.dotChance > 0 && this.rng.next() < this.stats.dotChance) {
      enemy.burn = {
        remaining: this.stats.dotDuration,
        tick: 0.5,
        nextTick: this.time.now + 500,
      };
    }

    if (this.stats.aoeRadius > 0) {
      this.enemies.forEach((other) => {
        if (other === enemy || other.health <= 0) return;
        const distance = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, other.sprite.x, other.sprite.y);
        if (distance <= this.stats.aoeRadius) {
          other.takeDamage(finalDamage * 0.45);
        }
      });
    }

    if (enemy.health <= 0) {
      this.killEnemy(enemy);
      if (this.stats.onKillHeal) {
        this.player.heal(this.stats.onKillHeal);
      }
    } else if (this.stats.chainShots && !isChain) {
      const candidates = this.enemies.filter((other) => other !== enemy && other.health > 0);
      const nearest = candidates.sort((a, b) => {
        const da = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, a.sprite.x, a.sprite.y);
        const db = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, b.sprite.x, b.sprite.y);
        return da - db;
      })[0];
      if (nearest && Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, nearest.sprite.x, nearest.sprite.y) < 160) {
        this.damageEnemy(nearest, amount * 0.6, true);
      }
    }
  }

  killEnemy(enemy) {
    spawnParticles(this, enemy.sprite.x, enemy.sprite.y, 0xff9e9e);
    enemy.sprite.destroy();
    enemy.health = 0;
    this.goldEarned += Math.round(6 * this.stats.economy);
    this.updateUI();
    if (this.enemies.every((unit) => unit.health <= 0)) {
      this.onWaveCleared();
    }
  }

  onWaveCleared() {
    this.isChoosing = true;
    this.physics.pause();
    this.addGoldReward(20 + this.wave * 8);
    const choices = [];
    while (choices.length < 3) {
      const pick = this.rng.pick(upgrades);
      if (!choices.includes(pick)) choices.push(pick);
    }

    const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x05080f, 0.75);
    overlay.setDepth(20);

    this.choiceContainer = createLootChoices(this, this.scale.width / 2, this.scale.height / 2 + 20, choices, (choice) => {
      choice.apply(this.stats);
      if (this.player.dashChargeTimer) {
        this.player.dashChargeTimer.delay = this.stats.dashCooldown * 1000;
      }
      overlay.destroy();
      this.choiceContainer.destroy();
      this.isChoosing = false;
      this.wave += 1;
      this.physics.resume();
      this.spawnWave();
      this.createOrbitals();
      this.updateUI();
    });
    this.choiceContainer.setDepth(21);

    const title = this.add.text(this.scale.width / 2, 120, 'Choose a Cipher', {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '22px',
      color: '#f2f6ff',
    }).setOrigin(0.5).setDepth(21);

    this.choiceContainer.add(title);
  }

  addGoldReward(amount) {
    this.goldEarned += Math.round(amount * this.stats.economy);
    this.updateUI();
  }

  updateUI() {
    if (!this.ui) return;
    this.ui.waveText.setText(`Wave ${this.wave}`);
    this.ui.goldText.setText(`Gold ${formatGold(this.goldEarned)}`);
    this.ui.healthText.setText(`HP ${Math.ceil(this.stats.health)}/${Math.ceil(this.stats.maxHealth)}`);
    let dashFillRatio = this.player.dashCharges / this.stats.dashCharges;
    if (this.player.dashCharges < this.stats.dashCharges) {
      const elapsed = (this.time.now - this.player.lastDash) / (this.stats.dashCooldown * 1000);
      dashFillRatio = (this.player.dashCharges + Phaser.Math.Clamp(elapsed, 0, 1)) / this.stats.dashCharges;
    }
    this.ui.dashFill.width = 112 * Phaser.Math.Clamp(dashFillRatio, 0, 1);
    this.ui.dashText.setText(`Dash ${this.player.dashCharges}`);
  }

  endRun() {
    addGold(this.goldEarned);
    this.cameras.main.fadeOut(300, 6, 10, 18);
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  update(time) {
    if (this.isChoosing) return;

    const moveVector = this.inputState.getVector();
    if (moveVector.lengthSq() > 0) {
      this.lastMove = moveVector.clone();
    }

    if (this.inputState.isDashPressed() && moveVector.lengthSq() > 0) {
      const success = this.player.startDash(moveVector);
      if (success) {
        spawnParticles(this, this.player.sprite.x, this.player.sprite.y, 0x7fc7ff);
      }
    }

    if (!this.player.isDashing) {
      this.player.setVelocity(moveVector.x * this.stats.moveSpeed, moveVector.y * this.stats.moveSpeed);
    }

    this.enemies.forEach((enemy) => {
      if (enemy.health <= 0) return;
      enemy.update(this.player.sprite);
      if (enemy.burn && enemy.burn.remaining > 0 && time >= enemy.burn.nextTick) {
        enemy.burn.remaining -= enemy.burn.tick;
        enemy.burn.nextTick = time + enemy.burn.tick * 1000;
        enemy.takeDamage(this.stats.dotDamage);
        spawnParticles(this, enemy.sprite.x, enemy.sprite.y, 0xff925c);
        if (enemy.health <= 0) {
          this.killEnemy(enemy);
        }
      }
    });

    if (time - this.lastShot > 1000 / this.stats.attackRate) {
      const alive = this.enemies.filter((enemy) => enemy.health > 0);
      if (alive.length) {
        const target = alive.sort((a, b) => {
          const da = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, a.sprite.x, a.sprite.y);
          const db = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, b.sprite.x, b.sprite.y);
          return da - db;
        })[0];
        this.fireAtTarget(target.sprite);
        this.lastShot = time;
      }
    }

    this.updateOrbitals();
    if (this.orbitals.length) {
      this.orbitals.forEach((orbital) => {
        this.physics.overlap(orbital.orb, this.enemyGroup, (orb, enemySprite) => {
          const enemy = enemySprite.getData('ref');
          if (enemy && enemy.health > 0) {
            this.damageEnemy(enemy, this.stats.damage * 0.3, true);
          }
        });
      });
    }

    this.updateUI();
  }
}
