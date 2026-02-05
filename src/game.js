import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import RunScene from './scenes/RunScene.js';
import UpgradeScene from './scenes/UpgradeScene.js';

export function createGame() {
  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 1060,
    height: 640,
    backgroundColor: '#0b0f1a',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scene: [BootScene, MenuScene, RunScene, UpgradeScene],
  };

  return new Phaser.Game(config);
}
