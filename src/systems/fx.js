export function popIn(target, scale = 1) {
  target.setScale(0.85 * scale);
  target.scene.tweens.add({
    targets: target,
    scale: scale,
    ease: 'Back.Out',
    duration: 260,
  });
}

export function cameraShake(scene, intensity = 0.008, duration = 90) {
  scene.cameras.main.shake(duration, intensity);
}

export function hitstop(scene, duration = 60) {
  const timeScale = scene.time.timeScale;
  const tweenScale = scene.tweens.timeScale;
  const physicsScale = scene.physics.world.timeScale;
  scene.time.timeScale = 0.0001;
  scene.tweens.timeScale = 0.0001;
  scene.physics.world.timeScale = 0.0001;
  scene.time.delayedCall(duration, () => {
    scene.time.timeScale = timeScale;
    scene.tweens.timeScale = tweenScale;
    scene.physics.world.timeScale = physicsScale;
  });
}

export function spawnDamageNumber(scene, x, y, text, color = '#fef2c0') {
  const label = scene.add.text(x, y, text, {
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: '16px',
    color,
    stroke: '#07090f',
    strokeThickness: 3,
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: label,
    y: y - 24,
    alpha: 0,
    duration: 650,
    ease: 'Cubic.Out',
    onComplete: () => label.destroy(),
  });
}

export function spawnParticles(scene, x, y, tint = 0xffd166) {
  const count = 8;
  for (let i = 0; i < count; i += 1) {
    const particle = scene.add.circle(x, y, 2, tint, 1);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.FloatBetween(16, 40);
    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      scale: 0.4,
      duration: 400,
      ease: 'Quad.Out',
      onComplete: () => particle.destroy(),
    });
  }
}
