export function createInput(scene) {
  const keys = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    upAlt: Phaser.Input.Keyboard.KeyCodes.UP,
    downAlt: Phaser.Input.Keyboard.KeyCodes.DOWN,
    leftAlt: Phaser.Input.Keyboard.KeyCodes.LEFT,
    rightAlt: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
  });

  return {
    keys,
    getVector() {
      const x = (keys.right.isDown || keys.rightAlt.isDown ? 1 : 0) - (keys.left.isDown || keys.leftAlt.isDown ? 1 : 0);
      const y = (keys.down.isDown || keys.downAlt.isDown ? 1 : 0) - (keys.up.isDown || keys.upAlt.isDown ? 1 : 0);
      const vector = new Phaser.Math.Vector2(x, y);
      return vector.lengthSq() > 0 ? vector.normalize() : vector;
    },
    isDashPressed() {
      return Phaser.Input.Keyboard.JustDown(keys.dash);
    },
  };
}
