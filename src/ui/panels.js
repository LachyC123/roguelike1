export function createPanel(scene, x, y, width, height, { title, subtitle } = {}) {
  const container = scene.add.container(x, y);
  const radius = 28;
  const background = scene.add.graphics();
  background.fillStyle(0x101826, 0.95);
  background.lineStyle(2, 0x31456b, 0.9);
  background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  background.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  container.add(background);

  if (title) {
    const titleText = scene.add.text(0, -height / 2 + 46, title, {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '28px',
      color: '#f2f6ff',
      fontStyle: '600',
    }).setOrigin(0.5);
    container.add(titleText);
  }

  if (subtitle) {
    const subtitleText = scene.add.text(0, -height / 2 + 78, subtitle, {
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '13px',
      color: '#8aa2d6',
    }).setOrigin(0.5);
    container.add(subtitleText);
  }

  return container;
}
