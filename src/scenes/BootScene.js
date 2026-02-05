import { assets } from '../systems/assets.js';
import { initAudio } from '../systems/audio.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.cameras.main.fadeIn(300, 6, 10, 18);
    assets.load(this);
    initAudio(this);
  }

  create() {
    this.time.delayedCall(250, () => {
      this.scene.start('MenuScene');
    });
  }
}
