'use strict';

const engine = require('./src/engine');
const { callTool, state, TOOLS } = require('./src/server');

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); passed++; console.log(`  ✅ ${name}`); }
  catch (e) { failed++; console.log(`  ❌ ${name}: ${e.message}`); }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg || ''} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

console.log('\n🧪 Claw Quest Skill — Full Test Suite\n');

// ─── Engine Tests ───

test('statScale: level 1 = base', () => {
  assertEq(engine.statScale(50, 1), 50);
});

test('statScale: level 10 scaling', () => {
  const s = engine.statScale(50, 10);
  assert(s > 80 && s < 200, `unexpected scale: ${s}`);
});

test('typeEffectiveness: fire vs grass = 2x', () => {
  assertEq(engine.battleRound({ atk:10, def:5, type:'fire' }, { atk:0, def:0, type:'grass' }).effectiveness, 2);
});

test('typeEffectiveness: normal vs ghost = 0', () => {
  assertEq(engine.battleRound({ atk:10, def:5, type:'normal' }, { atk:0, def:0, type:'ghost' }).effectiveness, 0);
});

test('simulateBattle: miner vs slime (pebble wins)', () => {
  const r = engine.simulateBattle('miner', 1, 'slime', 1);
  assertEq(r.winner, 'pebble');
  assert(r.log.length > 0);
});

test('canEvolve: miner level 5 cannot evolve', () => {
  assertEq(engine.canEvolve('miner', 5), null);
});

test('canEvolve: miner level 12 can evolve', () => {
  const r = engine.canEvolve('miner', 12);
  assertEq(r.to, 'miner_elite');
  assert(r.statBoost > 1);
});

test('canEvolve: cook cannot evolve', () => {
  assertEq(engine.canEvolve('cook', 99), null);
});

test('getPrice: valid item returns number', () => {
  const p = engine.getPrice('wood');
  assert(typeof p === 'number' && p > 0);
});

test('getPrice: invalid item returns null', () => {
  assertEq(engine.getPrice('diamond'), null);
});

test('trade: buy with enough coins', () => {
  const r = engine.trade('wood', 2, 100);
  assert(r.ok);
  assertEq(r.cost, r.price * 2);
});

test('trade: buy with insufficient coins', () => {
  const r = engine.trade('gold', 10, 1);
  assert(!r.ok);
  assertEq(r.reason, 'Not enough coins');
});

// ─── Crafting Engine Tests ───

test('craft: plank recipe', () => {
  const inv = { wood: 5 };
  const r = engine.craft('plank', inv);
  assert(r.ok);
  assertEq(r.recipe.needs.wood, 2);
});

test('craft: house recipe needs plank+brick+stone', () => {
  const inv = { plank: 5, brick: 3, stone: 3 };
  const r = engine.craft('house', inv);
  assert(r.ok);
});

test('craft: house fails without materials', () => {
  const inv = { plank: 0, brick: 0, stone: 0 };
  const r = engine.craft('house', inv);
  assert(!r.ok);
});

// ─── Tile System Tests ───

test('createGrid: returns correct dimensions', () => {
  const grid = engine.createGrid(10, 8);
  assertEq(grid.length, 8);
  assertEq(grid[0].length, 10);
});

test('tileInfo: known tile returns data', () => {
  const info = engine.tileInfo('stone');
  assertEq(info.digHits, 3);
  assertEq(info.resource, 'stone');
});

test('tileInfo: unknown tile defaults to grass', () => {
  const info = engine.tileInfo('void');
  assert(info.walkable);
});

test('digTile: dig stone progressively', () => {
  const grid = engine.createGrid(5, 5);
  grid[2][2] = { type: 'stone', building: null, hits: 0, resource: null };
  const r1 = engine.digTile(grid, 2, 2);
  assert(!r1.dug);
  assert(r1.progress.includes('1/3'));
  const r2 = engine.digTile(grid, 2, 2);
  const r3 = engine.digTile(grid, 2, 2);
  assert(r3.dug);
  assertEq(r3.resource, 'stone');
});

test('placeBuilding: builds on walkable tile', () => {
  const grid = engine.createGrid(5, 5);
  const r = engine.placeBuilding(grid, 2, 3, 'house');
  assert(r.ok);
  assertEq(r.building, 'house');
  assert(grid[3][2].building !== null);
});

test('placeBuilding: fails on water', () => {
  const grid = engine.createGrid(5, 5);
  grid[2][2] = { type: 'water', building: null, hits: 0, resource: null };
  const r = engine.placeBuilding(grid, 2, 2, 'house');
  assert(!r.ok);
});

test('removeBuilding: removes and returns type', () => {
  const grid = engine.createGrid(5, 5);
  engine.placeBuilding(grid, 4, 4, 'wall');
  const r = engine.removeBuilding(grid, 4, 4);
  assert(r.ok);
  assertEq(r.removed, 'wall');
});

test('countHouses: counts correctly', () => {
  const grid = engine.createGrid(10, 10);
  engine.placeBuilding(grid, 3, 3, 'house');
  engine.placeBuilding(grid, 5, 5, 'house');
  engine.placeBuilding(grid, 7, 7, 'wall');
  assertEq(engine.countHouses(grid), 2);
});

// ─── Server/Tool Tests ───

test('claw_status returns day 1 and 10 pebbles', () => {
  const r = callTool('claw_status', {});
  assert(r.ok);
  assertEq(r.result.day, 1);
  const lines = r.result.pebbles.split('\n').filter(l => l.trim());
  assertEq(lines.length, 10);
});

test('claw_status shows houses count', () => {
  const r = callTool('claw_status', {});
  assert(r.ok);
  assert(typeof r.result.houses === 'number');
  assert(r.result.houses >= 1); // Main Camp
});

test('claw_explore increases discovery', () => {
  const before = state.discovered || 0;
  const r = callTool('claw_explore', {});
  assert(r.ok);
  assert(r.result.discovered >= before);
});

test('claw_move moves pebble', () => {
  const r = callTool('claw_move', { pebbleName: 'Scout', x: 55, y: 42 });
  assert(r.ok);
  assert(r.result.ok);
  assertEq(r.result.x, 55);
});

test('claw_dig: dig near pebble', () => {
  // Move Miner near a stone tile
  callTool('claw_move', { pebbleName: 'Miner', x: 52, y: 42 });
  const r = callTool('claw_dig', { pebbleName: 'Miner', x: 52, y: 42 });
  assert(r.ok);
});

test('claw_craft: craft plank with crafter', () => {
  state.inventory.wood = 10;
  const r = callTool('claw_craft', { pebbleName: 'Crafter', item: 'plank' });
  assert(r.ok);
  assert(r.result.ok);
  assertEq(r.result.crafted, 'plank');
});

test('claw_craft: builder cannot craft plank (wrong role)', () => {
  state.inventory.wood = 10;
  const r = callTool('claw_craft', { pebbleName: 'Builder', item: 'plank' });
  assert(r.ok);
  assert(!r.result.ok); // wrong role
});

test('claw_gather: gather resources around pebble', () => {
  const r = callTool('claw_gather', { pebbleName: 'Gatherer' });
  assert(r.ok);
  assert(r.result.ok);
});

test('claw_assign_home: assign pebble to main camp house', () => {
  // First find existing house
  const r = callTool('claw_assign_home', { pebbleName: 'Scout', homeName: '🏕️ Main Camp' });
  assert(r.ok);
  assert(r.result.ok);
  assertEq(r.result.pebble, 'Scout');
});

test('claw_battle: Miner vs slime wins', () => {
  state.pebbles[1].hp = 60;
  const r = callTool('claw_battle', { pebbleName: 'Miner', monster: 'slime', level: 1 });
  assert(r.ok);
  assertEq(r.result.winner, 'pebble');
});

test('claw_evolve: low level cannot evolve', () => {
  const r = callTool('claw_evolve', { pebbleName: 'Miner' });
  assert(r.ok);
  assert(!r.result.ok);
});

test('claw_market: list items', () => {
  const r = callTool('claw_market', {});
  assert(r.ok);
  assert(Array.isArray(r.result.items));
  assert(r.result.items.includes('wood'));
});

test('claw_market: buy wood', () => {
  state.inventory.coins = 100;
  const r = callTool('claw_market', { action: 'buy', item: 'wood', qty: 2 });
  assert(r.ok);
  assert(r.result.ok);
});

test('claw_zones: list zones', () => {
  const r = callTool('claw_zones', {});
  assert(r.ok);
  assert(Array.isArray(r.result));
  assertEq(r.result[0].name, 'beach');
});

test('claw_night_return: all pebbles return home', () => {
  const r = callTool('claw_night_return', {});
  assert(r.ok);
  assert(r.result.ok);
  assert(state.cycle === 'night');
  assert(r.result.moves.length === 10);
});

test('claw_advance: advance to next day', () => {
  const r = callTool('claw_advance', {});
  assert(r.ok);
  assertEq(r.result.day, 2);
  assertEq(r.result.cycle, 'day');
});

test('claw_map: returns map view', () => {
  const r = callTool('claw_map', { x: 50, y: 40, radius: 3 });
  assert(r.ok);
  assert(Array.isArray(r.result.view));
  assertEq(r.result.view.length, 7);
});

// ─── Summary ───
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed+failed} tests\n`);
process.exit(failed > 0 ? 1 : 0);