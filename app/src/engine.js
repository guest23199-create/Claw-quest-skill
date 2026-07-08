'use strict';

// ─── Type Chart ───
const TYPE_CHART = {
  normal:  { strong: [],           weak: ['rock'],       immune: ['ghost'] },
  fire:    { strong: ['grass','ice','bug','steel'], weak: ['water','rock','fire'], immune: [] },
  water:   { strong: ['fire','rock','ground'],     weak: ['grass','electric'],     immune: [] },
  grass:   { strong: ['water','ground','rock'],     weak: ['fire','grass','bug'],  immune: [] },
  electric:{ strong: ['water','flying'],            weak: ['grass','electric'],    immune: ['ground'] },
  ice:     { strong: ['grass','ground','flying'],   weak: ['fire','water','ice'],  immune: [] },
  rock:    { strong: ['fire','ice','flying','bug'], weak: ['water','grass','rock'],immune: [] },
  ground:  { strong: ['fire','electric','rock'],    weak: ['water','grass','ice'], immune: ['flying'] },
  flying:  { strong: ['grass','bug'],               weak: ['electric','rock','ice'],immune: ['ground'] },
  bug:     { strong: ['grass','psychic'],           weak: ['fire','flying','rock'],immune: [] },
  ghost:   { strong: ['psychic','ghost'],           weak: ['dark'],                immune: ['normal'] },
  dark:    { strong: ['psychic','ghost'],           weak: ['bug','dark'],          immune: [] },
  psychic: { strong: ['fighting','poison'],         weak: ['dark','bug'],          immune: [] },
  fighting:{ strong: ['normal','ice','rock','dark'],weak: ['flying','psychic'],    immune: [] },
  poison:  { strong: ['grass','bug'],               weak: ['poison','ground','rock'],immune: ['steel'] },
  steel:   { strong: ['ice','rock'],                weak: ['fire','water','electric'],immune: ['poison'] }
};

// ─── Stat Scaling ───
function statScale(base, level) {
  return Math.floor(base * (1 + (level - 1) * 0.15));
}

// ─── Pebble Base Stats ───
const PEBBLE_BASE = {
  explorer:  { hp:40, atk:8,  def:6,  spd:14, type:'normal' },
  miner:     { hp:60, atk:12, def:14, spd:6,  type:'rock' },
  lumberjack:{ hp:50, atk:10, def:10, spd:8,  type:'grass' },
  builder:   { hp:45, atk:6,  def:12, spd:7,  type:'rock' },
  crafter:   { hp:35, atk:5,  def:8,  spd:9,  type:'normal' },
  farmer:    { hp:40, atk:6,  def:7,  spd:10, type:'grass' },
  cook:      { hp:30, atk:4,  def:5,  spd:12, type:'normal' },
  defender:  { hp:70, atk:14, def:16, spd:5,  type:'fighting' },
  scout:     { hp:35, atk:7,  def:5,  spd:18, type:'flying' },
  gatherer:  { hp:38, atk:5,  def:6,  spd:11, type:'normal' }
};

// ─── Monster Stats ───
const MONSTER_STATS = {
  slime:     { hp:25, atk:5,  def:3,  type:'normal' },
  bat:       { hp:30, atk:7,  def:4,  type:'flying' },
  skeleton:  { hp:40, atk:10, def:7,  type:'ghost' },
  wolf:      { hp:50, atk:12, def:8,  type:'dark' },
  boss:      { hp:120,atk:20, def:15, type:'dark' }
};

// ─── Battle Engine ───
function typeEffectiveness(atkType, defType) {
  const chart = TYPE_CHART[atkType];
  if (!chart) return 1;
  if (chart.strong.includes(defType)) return 2;
  if (chart.weak.includes(defType)) return 0.5;
  if (chart.immune.includes(defType)) return 0;
  return 1;
}

function battleRound(attacker, defender) {
  const eff = typeEffectiveness(attacker.type, defender.type);
  const rawDmg = Math.max(1, attacker.atk - defender.def * 0.5);
  const dmg = Math.floor(rawDmg * eff);
  const crit = Math.random() < 0.1 ? 1.5 : 1;
  const finalDmg = Math.floor(dmg * crit);
  return { damage: finalDmg, effectiveness: eff, crit: crit > 1 };
}

function simulateBattle(pebble, pebbleLevel, monster, monsterLevel) {
  const base = PEBBLE_BASE[pebble];
  if (!base) return { winner: 'monster', pebbleHp: 0, monsterHp: 999, log: ['❌ Unknown pebble role'] };
  const mBase = MONSTER_STATS[monster];
  if (!mBase) return { winner: 'monster', pebbleHp: 0, monsterHp: 999, log: ['❌ Unknown monster'] };
  const p = { ...base, hp: statScale(base.hp, pebbleLevel), atk: statScale(base.atk, pebbleLevel), def: statScale(base.def, pebbleLevel) };
  const m = { ...mBase, hp: statScale(mBase.hp, monsterLevel), atk: statScale(mBase.atk, monsterLevel), def: statScale(mBase.def, monsterLevel) };
  let log = [];
  while (p.hp > 0 && m.hp > 0) {
    const r1 = battleRound(p, m);
    m.hp -= r1.damage;
    log.push(`⚔️ Pebble deals ${r1.damage}${r1.crit?' 💥CRIT':''}${r1.effectiveness>1?' ✨super':r1.effectiveness===0?' ❌immune':''}`);
    if (m.hp <= 0) break;
    const r2 = battleRound(m, p);
    p.hp -= r2.damage;
    log.push(`💥 ${monster} deals ${r2.damage}${r2.crit?' 💥CRIT':''}${r2.effectiveness>1?' ✨super':r2.effectiveness===0?' ❌immune':''}`);
  }
  const winner = p.hp > 0 ? 'pebble' : 'monster';
  return { winner, pebbleHp: Math.max(0, p.hp), monsterHp: Math.max(0, m.hp), log };
}

// ─── Evolution ───
const EVOLUTIONS = {
  miner:     { level: 10, to: 'miner_elite', statBoost: 1.3 },
  defender:  { level: 10, to: 'guardian',    statBoost: 1.35 },
  explorer:  { level: 8,  to: 'navigator',   statBoost: 1.25 },
  lumberjack:{ level: 10, to: 'forester',    statBoost: 1.3 },
  crafter:   { level: 12, to: 'artificer',   statBoost: 1.35 },
  scout:     { level: 8,  to: 'sentinel',    statBoost: 1.25 }
};

function canEvolve(role, level) {
  const evo = EVOLUTIONS[role];
  if (!evo) return null;
  if (level >= evo.level) return { to: evo.to, statBoost: evo.statBoost };
  return null;
}

// ─── Market Prices ───
const MARKET = {
  wood:      { base: 2,  craft: null },
  stone:     { base: 3,  craft: null },
  fiber:     { base: 1,  craft: null },
  berry:     { base: 2,  craft: null },
  iron:      { base: 10, craft: null },
  gold:      { base: 25, craft: null },
  coal:      { base: 8,  craft: null },
  crystal:   { base: 50, craft: null },
  plank:     { base: 5,  craft: { from:{wood:2}, at:'crafter' } },
  brick:     { base: 8,  craft: { from:{stone:2}, at:'crafter' } },
  ingot:     { base: 20, craft: { from:{iron:1,coal:1}, at:'crafter' } },
  wall:      { base: 12, craft: { from:{plank:2,stone:1}, at:'builder' } },
  floor:     { base: 6,  craft: { from:{plank:2}, at:'builder' } },
  bed:       { base: 15, craft: { from:{plank:3,fiber:2}, at:'builder' } },
  furnace:   { base: 25, craft: { from:{stone:4,iron:1}, at:'builder' } },
  chest:     { base: 18, craft: { from:{plank:4,iron:2}, at:'builder' } },
  crafting_table: { base: 20, craft: { from:{plank:3,stone:2}, at:'builder' } }
};

function getPrice(item) {
  const m = MARKET[item];
  if (!m) return null;
  const fluctuation = 0.8 + Math.random() * 0.4;
  return Math.floor(m.base * fluctuation);
}

function trade(item, qty, coins) {
  const price = getPrice(item);
  if (!price) return { ok: false, reason: 'Unknown item' };
  const cost = price * qty;
  if (coins < cost) return { ok: false, reason: 'Not enough coins' };
  return { ok: true, cost, price, item, qty };
}

// ─── Crafting ───
const CRAFT_RECIPES = {
  plank:   { needs: { wood:2 }, produces:1, requireRole:'crafter' },
  brick:   { needs: { stone:2 }, produces:1, requireRole:'crafter' },
  ingot:   { needs: { iron:1, coal:1 }, produces:1, requireRole:'crafter' },
  wall:    { needs: { plank:2, stone:1 }, produces:1, requireRole:'builder' },
  floor:   { needs: { plank:2 }, produces:1, requireRole:'builder' },
  bed:     { needs: { plank:3, fiber:2 }, produces:1, requireRole:'builder' },
  furnace: { needs: { stone:4, iron:1 }, produces:1, requireRole:'builder' },
  chest:   { needs: { plank:4, iron:2 }, produces:1, requireRole:'builder' },
  crafting_table: { needs: { plank:3, stone:2 }, produces:1, requireRole:'builder' },
  house:   { needs: { plank:5, brick:3, stone:3 }, produces:1, requireRole:'builder' }
};

function craft(item, inventory) {
  const recipe = CRAFT_RECIPES[item];
  if (!recipe) return { ok: false, reason: `Unknown recipe: ${item}` };
  for (const [mat, need] of Object.entries(recipe.needs)) {
    if ((inventory[mat] || 0) < need) return { ok: false, reason: `Not enough ${mat} (need ${need}, have ${inventory[mat]||0})` };
  }
  return { ok: true, recipe };
}

// ─── Tile System ───
const TILE_TYPES = {
  sand:         { digHits:0, resource:null, walkable:true, color:'#e8d5a3', label:'🟨' },
  grass:        { digHits:0, resource:null, walkable:true, color:'#7ec850', label:'🟩' },
  forest:       { digHits:2, resource:'wood', walkable:false, color:'#2d8a2d', label:'🌲' },
  stone:        { digHits:3, resource:'stone', walkable:false, color:'#808080', label:'🪨' },
  mountain:     { digHits:5, resource:'stone', walkable:false, color:'#606060', label:'⛰️' },
  water:        { digHits:0, resource:null, walkable:false, color:'#3b82c4', label:'🌊' },
  iron_ore:     { digHits:4, resource:'iron', walkable:false, color:'#a0522d', label:'⛏️' },
  coal_ore:     { digHits:4, resource:'coal', walkable:false, color:'#333333', label:'🖤' },
  gold_ore:     { digHits:5, resource:'gold', walkable:false, color:'#ffd700', label:'✨' },
  crystal_rock: { digHits:6, resource:'crystal', walkable:false, color:'#e0b0ff', label:'💎' },
  fertile:      { digHits:0, resource:null, walkable:true, color:'#8B4513', label:'🌱' },
  deep_forest:  { digHits:4, resource:'wood', walkable:false, color:'#1a5c1a', label:'🌳' },
  snow:         { digHits:0, resource:null, walkable:true, color:'#f0f0ff', label:'❄️' },
  desert:       { digHits:0, resource:null, walkable:true, color:'#f4d03f', label:'🏜️' },
  cave:         { digHits:0, resource:null, walkable:true, color:'#2c2c2c', label:'🕳️' }
};

const BUILDING_TYPES = {
  house:          { hp:50, provides:'housing', label:'🏠', color:'#c0392b', buildable:true },
  wall:           { hp:30, provides:'defense', label:'🧱', color:'#7f8c8d', buildable:true },
  floor:          { hp:10, provides:'floor', label:'⬜', color:'#bdc3c7', buildable:true },
  door:           { hp:20, provides:'access', label:'🚪', color:'#8B4513', buildable:true },
  crafting_table: { hp:20, provides:'crafting', label:'⚒️', color:'#d35400', buildable:true },
  furnace:        { hp:30, provides:'smelting', label:'🔥', color:'#e74c3c', buildable:true },
  chest:          { hp:15, provides:'storage', label:'📦', color:'#f39c12', buildable:true },
  bed:            { hp:10, provides:'sleep', label:'🛏️', color:'#9b59b6', buildable:true }
};

const RESOURCE_ZONES = {
  quarry:     { tiles:['stone','iron_ore','coal_ore'], respawnDays:3, label:'⛰️ Mỏ đá' },
  forest_zone:{ tiles:['forest','deep_forest'],        respawnDays:2, label:'🌲 Rừng gỗ' },
  mine:       { tiles:['gold_ore','crystal_rock'],    respawnDays:5, label:'💎 Mỏ quặng' }
};

// ─── Grid Helper ───
function createGrid(w, h) {
  const grid = [];
  const seed = Date.now();
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      // Simple noise-based generation
      const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
      const r = n - Math.floor(n);
      let type = 'grass';
      if (r < 0.15) type = 'sand';
      else if (r < 0.25) type = 'water';
      else if (r < 0.35) type = 'forest';
      else if (r < 0.42) type = 'stone';
      else if (r < 0.44) type = 'mountain';
      else if (r < 0.46) type = 'iron_ore';
      else if (r < 0.47) type = 'coal_ore';
      else if (r < 0.475) type = 'gold_ore';
      else if (r < 0.48) type = 'crystal_rock';
      else if (r < 0.53) type = 'forest';
      else if (r < 0.55) type = 'deep_forest';
      else if (r < 0.60) type = 'fertile';
      grid[y][x] = { type, building: null, hits: 0, resource: null };
    }
  }
  // Place starting base
  grid[Math.floor(h/2)][Math.floor(w/2)] = { type: 'grass', building: { type: 'house', hp: 50, name: '🏕️ Main Camp' }, hits: 0, resource: null };
  return grid;
}

function tileInfo(type) { return TILE_TYPES[type] || TILE_TYPES.grass; }

function digTile(grid, x, y) {
  const t = grid[y] && grid[y][x];
  if (!t) return { ok: false, reason: 'Out of bounds' };
  const info = TILE_TYPES[t.type];
  if (!info || info.digHits === 0) return { ok: false, reason: 'Cannot dig here' };
  if (t.building) return { ok: false, reason: 'Remove building first' };
  t.hits = (t.hits || 0) + 1;
  if (t.hits >= info.digHits) {
    const resource = info.resource;
    const was = t.type;
    t.type = 'grass';
    t.hits = 0;
    t.resource = null;
    return { ok: true, dug: true, resource, from: was };
  }
  return { ok: true, dug: false, progress: `${t.hits}/${info.digHits}` };
}

function placeBuilding(grid, x, y, buildingType) {
  const t = grid[y] && grid[y][x];
  if (!t) return { ok: false, reason: 'Out of bounds' };
  if (!BUILDING_TYPES[buildingType]) return { ok: false, reason: `Unknown building: ${buildingType}` };
  if (t.building) return { ok: false, reason: 'Tile already occupied' };
  const info = TILE_TYPES[t.type];
  if (!info || !info.walkable) return { ok: false, reason: 'Cannot build on non-walkable tile' };
  t.building = { type: buildingType, hp: BUILDING_TYPES[buildingType].hp, name: BUILDING_TYPES[buildingType].label };
  return { ok: true, building: buildingType };
}

function removeBuilding(grid, x, y) {
  const t = grid[y] && grid[y][x];
  if (!t) return { ok: false, reason: 'Out of bounds' };
  if (!t.building) return { ok: false, reason: 'No building here' };
  const bType = t.building.type;
  t.building = null;
  return { ok: true, removed: bType };
}

function countHouses(grid) {
  let n = 0;
  for (let y = 0; y < grid.length; y++)
    for (let x = 0; x < grid[y].length; x++)
      if (grid[y][x].building && grid[y][x].building.type === 'house') n++;
  return n;
}

module.exports = {
  TYPE_CHART, PEBBLE_BASE, MONSTER_STATS,
  statScale, battleRound, simulateBattle,
  canEvolve, getPrice, trade, EVOLUTIONS, MARKET,
  CRAFT_RECIPES, craft,
  TILE_TYPES, BUILDING_TYPES, RESOURCE_ZONES,
  createGrid, tileInfo, digTile, placeBuilding, removeBuilding, countHouses
};