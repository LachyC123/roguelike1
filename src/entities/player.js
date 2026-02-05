import { assets } from '../systems/assets.js';

export class Player {
  constructor(scene, x, y, stats) {
    this.scene = scene;
    this.stats = stats;
    this.isDashing = false;
    this.lastDash = -999;
    this.dashCharges = stats.dashCharges;
    this.dashChargeTimer = null;

    if (assets.hasSprites) {
      this.sprite = scene.physics.add.sprite(x, y, 'player');
      this.sprite.setScale(0.9);
    } else {
      this.sprite = scene.add.circle(x, y, 16, 0x7fd6ff, 1);
      scene.physics.add.existing(this.sprite);
      this.sprite.body.setCircle(16);
    }

    this.sprite.setDepth(5);
    this.sprite.body.setCollideWorldBounds(true);
  }

  setVelocity(x, y) {
    this.sprite.body.setVelocity(x, y);
  }

  startDash(vector) {
    if (this.dashCharges <= 0) return false;
    this.isDashing = true;
    this.lastDash = this.scene.time.now;
    this.dashCharges -= 1;
    this.sprite.body.setVelocity(vector.x * this.stats.dashSpeed, vector.y * this.stats.dashSpeed);
    this.scene.time.delayedCall(140, () => {
      this.isDashing = false;
    });
    if (!this.dashChargeTimer) {
      this.dashChargeTimer = this.scene.time.addEvent({
        delay: this.stats.dashCooldown * 1000,
        loop: true,
        callback: () => {
          if (this.dashCharges < this.stats.dashCharges) {
            this.dashCharges += 1;
          }
        },
      });
    }
    return true;
  }

  takeDamage(amount) {
    this.stats.health = Math.max(0, this.stats.health - amount);
  }

  heal(amount) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }
}
