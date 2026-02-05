export const assets = {
  hasSprites: false,
  hasEnemySprites: false,
  load(scene) {
    this.hasSprites = false;
    this.hasEnemySprites = false;

    scene.load.on('filecomplete-image-player', () => {
      this.hasSprites = true;
    });
    scene.load.on('filecomplete-image-enemy', () => {
      this.hasEnemySprites = true;
    });
    scene.load.on('loaderror', (file) => {
      if (file.key === 'player') this.hasSprites = false;
      if (file.key === 'enemy') this.hasEnemySprites = false;
    });

    scene.load.image('player', 'assets/img/player/player.png');
    scene.load.image('enemy', 'assets/img/enemies/chaser.png');
    scene.load.image('bullet', 'assets/img/fx/bullet.png');
  },
};
