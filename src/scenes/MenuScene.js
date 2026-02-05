import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { loadSave, formatGold } from '../systems/save.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(350, 6, 10, 18);

    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0b0f1a);
    bg.setDepth(-2);

    const panel = createPanel(this, width / 2, height / 2, 520, 360, {
      title: 'Rogue Ascendant',
      subtitle: 'A premium roguelike vertical slice',
    });

    const save = loadSave();
    const goldText = this.add.text(width / 2, height / 2 - 40, `Gold Vault: ${formatGold(save.gold)}`, {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '18px',
      color: '#d2e3ff',
    }).setOrigin(0.5);

    const playButton = createButton(this, width / 2, height / 2 + 40, 260, 52, 'Start Run', () => {
      this.cameras.main.fadeOut(260, 6, 10, 18);
      this.time.delayedCall(260, () => {
        this.scene.start('RunScene');
      });
    });

    const upgradeButton = createButton(this, width / 2, height / 2 + 110, 260, 52, 'Upgrades', () => {
      this.cameras.main.fadeOut(260, 6, 10, 18);
      this.time.delayedCall(260, () => {
        this.scene.start('UpgradeScene');
      });
    }, {
      variant: 'secondary',
    });

    panel.add([goldText, playButton, upgradeButton]);

    this.add.text(width / 2, height - 40, 'WASD / Arrows + Space to dash', {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '14px',
      color: '#7b8fb4',
    }).setOrigin(0.5);
  }
}
