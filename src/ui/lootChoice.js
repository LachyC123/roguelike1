import { rarities } from '../systems/balance.js';
import { popIn } from '../systems/fx.js';

export function createLootChoices(scene, x, y, choices, onPick) {
  const container = scene.add.container(x, y);
  const spacing = 220;

  choices.forEach((choice, index) => {
    const card = createCard(scene, (index - 1) * spacing, 0, choice);
    card.setInteractive({ useHandCursor: true });
    card.on('pointerover', () => {
      scene.tweens.add({ targets: card, scale: 1.04, duration: 120, ease: 'Quad.Out' });
      card.glow.setAlpha(0.8);
    });
    card.on('pointerout', () => {
      scene.tweens.add({ targets: card, scale: 1, duration: 120, ease: 'Quad.Out' });
      card.glow.setAlpha(0);
    });
    card.on('pointerup', () => {
      scene.tweens.add({ targets: card, scale: 1.1, duration: 140, ease: 'Back.Out' });
      scene.time.delayedCall(120, () => {
        onPick(choice);
      });
    });
    container.add(card);
    popIn(card);
  });

  return container;
}

function createCard(scene, x, y, choice) {
  const card = scene.add.container(x, y);
  const width = 190;
  const height = 230;
  const rarity = rarities[choice.rarity];

  const background = scene.add.graphics();
  background.fillStyle(0x0f1828, 0.98);
  background.lineStyle(2, rarity.color, 0.9);
  background.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
  background.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

  const glow = scene.add.graphics();
  glow.fillStyle(rarity.color, 0.4);
  glow.fillRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 24);
  glow.setAlpha(0);

  const rarityText = scene.add.text(0, -height / 2 + 20, rarity.label, {
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: '11px',
    color: '#b8c8e8',
    letterSpacing: 1,
  }).setOrigin(0.5);

  const title = scene.add.text(0, -40, choice.name, {
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: '18px',
    color: '#f2f6ff',
    fontStyle: '600',
    align: 'center',
    wordWrap: { width: width - 32 },
  }).setOrigin(0.5);

  const desc = scene.add.text(0, 40, choice.desc, {
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: '13px',
    color: '#96a9cf',
    align: 'center',
    wordWrap: { width: width - 32 },
  }).setOrigin(0.5);

  card.add([glow, background, rarityText, title, desc]);
  card.glow = glow;
  card.setSize(width, height);
  return card;
}
