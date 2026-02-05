export const audioState = {
  hasAudio: false,
};

export function initAudio(scene) {
  scene.load.on('filecomplete-audio', () => {
    audioState.hasAudio = true;
  });
  scene.load.on('loaderror', () => {
    audioState.hasAudio = false;
  });

  scene.load.audio('sfx-hit', 'assets/audio/sfx/hit.wav');
  scene.load.audio('sfx-crit', 'assets/audio/sfx/crit.wav');
  scene.load.audio('sfx-dash', 'assets/audio/sfx/dash.wav');
  scene.load.audio('music-menu', 'assets/audio/music/menu.mp3');
  scene.load.audio('music-run', 'assets/audio/music/run.mp3');
}

export function playSound(scene, key, options = {}) {
  if (!audioState.hasAudio || !scene.sound) return;
  const sound = scene.sound.add(key, { volume: 0.4, ...options });
  sound.play();
}
