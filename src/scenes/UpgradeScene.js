import { createButton } from '../ui/buttons.js';
import { createPanel } from '../ui/panels.js';
import { metaUpgrades } from '../systems/balance.js';
import { loadSave, saveGame, formatGold } from '../systems/save.js';

export default class UpgradeScene extends Phaser.Scene {
  constructor() {
    super('UpgradeScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 6, 10, 18);
    this.save = loadSave();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0f1a);

    this.panel = createPanel(this, width / 2, height / 2, 820, 520, {
      title: 'Meta Upgrades',
      subtitle: 'Persistent upgrades funded by your vault gold',
    });

    this.goldText = this.add.text(width / 2, height / 2 - 190, `Gold Vault: ${formatGold(this.save.gold)}`, {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '16px',
      color: '#f7d37c',
    }).setOrigin(0.5);

    this.panel.add(this.goldText);

    this.renderUpgradeList(width / 2, height / 2 - 120);

    this.backButton = createButton(this, width / 2, height / 2 + 210, 220, 50, 'Back to Menu', () => {
      this.cameras.main.fadeOut(260, 6, 10, 18);
      this.time.delayedCall(260, () => {
        this.scene.start('MenuScene');
      });
    }, { variant: 'secondary' });
    this.panel.add(this.backButton);
  }

  renderUpgradeList(originX, originY) {
    if (this.listContainer) {
      this.listContainer.destroy();
    }
    this.listContainer = this.add.container(originX, originY);

    metaUpgrades.forEach((upgrade, index) => {
      const row = this.add.container(0, index * 40);
      const bg = this.add.graphics();
      bg.fillStyle(0x111a2b, 0.9);
      bg.lineStyle(1, 0x304160, 0.9);
      bg.fillRoundedRect(-350, -16, 700, 32, 12);
      bg.strokeRoundedRect(-350, -16, 700, 32, 12);

      const rank = this.save.meta[upgrade.id] || 0;
      const nameText = this.add.text(-320, 0, upgrade.name, {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: '14px',
        color: '#e0ebff',
      }).setOrigin(0, 0.5);

      const descText = this.add.text(-80, 0, upgrade.desc, {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: '12px',
        color: '#8ca4cf',
      }).setOrigin(0, 0.5);

      const rankText = this.add.text(170, 0, `Rank ${rank}/${upgrade.maxRank}`, {
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: '12px',
        color: '#9fb0d9',
      }).setOrigin(0, 0.5);

      const canBuy = rank < upgrade.maxRank && this.save.gold >= upgrade.cost;
      const buyButton = createButton(this, 310, 0, 120, 28, `Buy ${upgrade.cost}`, () => {
        if (rank >= upgrade.maxRank) return;
        if (this.save.gold < upgrade.cost) return;
        this.save.gold -= upgrade.cost;
        this.save.meta[upgrade.id] = rank + 1;
        saveGame(this.save);
        this.goldText.setText(`Gold Vault: ${formatGold(this.save.gold)}`);
        this.renderUpgradeList(originX, originY);
      }, {
        variant: canBuy ? 'primary' : 'secondary',
      });

      if (!canBuy) {
        buyButton.setAlpha(0.6);
      }

      row.add([bg, nameText, descText, rankText, buyButton]);
      this.listContainer.add(row);
    });

    this.panel.add(this.listContainer);
  }
}
