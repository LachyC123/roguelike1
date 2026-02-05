import { assets } from '../systems/assets.js';

export class Enemy {
  constructor(scene, x, y, level = 1) {
    this.scene = scene;
    this.level = level;
    this.maxHealth = 24 + level * 6;
    this.health = this.maxHealth;
    this.damage = 8 + level * 1.5;
    this.speed = 70 + level * 4;

    if (assets.hasEnemySprites) {
      this.sprite = scene.physics.add.sprite(x, y, 'enemy');
      this.sprite.setScale(0.9);
    } else {
      this.sprite = scene.add.circle(x, y, 14, 0xff7a7a, 1);
      scene.physics.add.existing(this.sprite);
      this.sprite.body.setCircle(14);
    }

    this.sprite.setDepth(3);
  }

  update(target) {
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, target.x, target.y);
    this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);
  }

  takeDamage(amount) {
    this.health -= amount;
  }
}
