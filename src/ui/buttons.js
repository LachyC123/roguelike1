import { popIn } from '../systems/fx.js';

export function createButton(scene, x, y, width, height, label, onClick, options = {}) {
  const container = scene.add.container(x, y);
  const radius = 18;
  const variant = options.variant || 'primary';
  const colors = variant === 'secondary'
    ? { fill: 0x1b2338, stroke: 0x4b5f8a }
    : { fill: 0x2b3a5f, stroke: 0x89a9ff };

  const background = scene.add.graphics();
  background.fillStyle(colors.fill, 1);
  background.lineStyle(2, colors.stroke, 0.9);
  background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  background.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

  const labelText = scene.add.text(0, 0, label, {
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: '18px',
    color: '#eaf1ff',
    fontStyle: '600',
  }).setOrigin(0.5);

  container.add([background, labelText]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });

  container.on('pointerover', () => {
    scene.tweens.add({ targets: container, scale: 1.05, duration: 120, ease: 'Quad.Out' });
  });
  container.on('pointerout', () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Quad.Out' });
  });
  container.on('pointerdown', () => {
    scene.tweens.add({ targets: container, scale: 0.97, duration: 80, ease: 'Quad.Out' });
  });
  container.on('pointerup', () => {
    onClick();
  });

  popIn(container);
  return container;
}
