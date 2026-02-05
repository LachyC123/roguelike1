const STORAGE_KEY = 'rogue-ascendant-save';

const defaultSave = {
  gold: 0,
  meta: {
    maxHealth: 0,
    damage: 0,
    attackRate: 0,
    dashCooldown: 0,
    armor: 0,
    economy: 0,
    crit: 0,
    aoe: 0,
    dot: 0,
    dashCharges: 0,
  },
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultSave);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultSave),
      ...parsed,
      meta: { ...structuredClone(defaultSave.meta), ...parsed.meta },
    };
  } catch (error) {
    console.warn('Save load failed', error);
    return structuredClone(defaultSave);
  }
}

export function saveGame(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addGold(amount) {
  const save = loadSave();
  save.gold += amount;
  saveGame(save);
  return save;
}

export function spendGold(amount) {
  const save = loadSave();
  if (save.gold < amount) return null;
  save.gold -= amount;
  saveGame(save);
  return save;
}

export function formatGold(amount) {
  return amount.toLocaleString('en-US');
}
