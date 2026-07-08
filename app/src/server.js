'use strict';

const { simulateBattle, canEvolve, getPrice, trade, statScale, PEBBLE_BASE, MONSTER_STATS, EVOLUTIONS, craft, CRAFT_RECIPES, createGrid, tileInfo, digTile, placeBuilding, removeBuilding, countHouses, BUILDING_TYPES } = require('./engine');

// ─── Game State ───
const MAP_W = 100, MAP_H = 80;
const state = {
  day: 1,
  cycle: 'day',
  grid: createGrid(MAP_W, MAP_H),
  pebbles: [
    { name:'Explorer',  role:'explorer',  level:1, xp:0, hp:40,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2)+1, y:Math.floor(MAP_H/2), stamina:100 },
    { name:'Miner',     role:'miner',     level:1, xp:0, hp:60,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2), y:Math.floor(MAP_H/2)+1, stamina:100 },
    { name:'Lumberjack',role:'lumberjack',level:1, xp:0, hp:50,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2)-1, y:Math.floor(MAP_H/2), stamina:100 },
    { name:'Builder',   role:'builder',   level:1, xp:0, hp:45,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2), y:Math.floor(MAP_H/2)-1, stamina:100 },
    { name:'Crafter',   role:'crafter',   level:1, xp:0, hp:35,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2)+2, y:Math.floor(MAP_H/2), stamina:100 },
    { name:'Farmer',    role:'farmer',    level:1, xp:0, hp:40,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2), y:Math.floor(MAP_H/2)+2, stamina:100 },
    { name:'Cook',      role:'cook',      level:1, xp:0, hp:30,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2)-2, y:Math.floor(MAP_H/2), stamina:100 },
    { name:'Defender',  role:'defender',  level:1, xp:0, hp:70,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2), y:Math.floor(MAP_H/2)-2, stamina:100 },
    { name:'Scout',     role:'scout',     level:1, xp:0, hp:35,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2)+1, y:Math.floor(MAP_H/2)+1, stamina:100 },
    { name:'Gatherer',  role:'gatherer',  level:1, xp:0, hp:38,  base:'🏕️ Main Camp', home:null, x:Math.floor(MAP_W/2)-1, y:Math.floor(MAP_H/2)-1, stamina:100 }
  ],
  inventory: { coins: 25, wood:10, stone:8, fiber:5, berry:6, iron:0, gold:0, coal:0, crystal:0, plank:0, brick:0, ingot:0, wall:0, floor:0, bed:0, furnace:0, chest:0, crafting_table:0 },
  buildings: [],
  discovered: 10,
  monstersDefeated: 0,
  bossesDefeated: 0,
  zone: 'beach',
  logs: [],
  resourceNodes: [],
  housesBuilt: 1
};

function log(msg) { state.logs.push(msg); }
function findHomePos(homeName) {
  for (let y = 0; y < state.grid.length; y++)
    for (let x = 0; x < state.grid[y].length; x++)
      if (state.grid[y][x].building && state.grid[y][x].building.name === homeName)
        return { x, y };
  return null;
}

// ─── Tool Handlers ───

// 1. Status
function handleStatus(args) {
  const p = state.pebbles.map(pb => {
    const home = pb.home || '⛺ Tent';
    return `${pb.name} (${pb.role}) Lv.${pb.level} ❤️${pb.hp} ⚡${pb.stamina}% 🏠${home} (${pb.x},${pb.y})`;
  }).join('\n');
  return {
    day: state.day,
    cycle: state.cycle,
    zone: state.zone,
    discovered: `${state.discovered}%`,
    pebbleCount: state.pebbles.filter(p => p.hp > 0).length,
    monstersDefeated: state.monstersDefeated,
    bossesDefeated: state.bossesDefeated,
    houses: countHouses(state.grid),
    inventory: state.inventory,
    pebbles: p,
    logs: state.logs.slice(-5)
  };
}

// 2. Explore
function handleExplore(args) {
  const gain = 5 + Math.floor(Math.random() * 16);
  state.discovered = Math.min(100, state.discovered + gain);
  const found = ['wood','stone','fiber','berry','iron','coal'][Math.floor(Math.random()*6)];
  const qty = 1 + Math.floor(Math.random() * 3);
  state.inventory[found] = (state.inventory[found] || 0) + qty;
  let encounter = null;
  if (Math.random() < 0.3) {
    const monsters = ['slime','bat','skeleton'];
    const m = monsters[Math.floor(Math.random()*3)];
    encounter = { type: m, level: Math.ceil(state.day / 3) + 1 };
  }
  log(`🔍 Explored +${gain}%. Found ${qty} ${found}.`);
  return { discovered: state.discovered, found: { item: found, qty }, encounter };
}

// 3. Move Pebble
function handleMove(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  const tx = args.x, ty = args.y;
  if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return { ok: false, reason: 'Out of map bounds' };
  const dx = Math.abs(pebble.x - tx), dy = Math.abs(pebble.y - ty);
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist > 20) return { ok: false, reason: 'Too far (max 20 tiles per move)' };
  const tile = state.grid[ty][tx];
  const info = tileInfo(tile.type);
  if (!info.walkable && !tile.building) return { ok: false, reason: `Cannot walk on ${tile.type}` };
  pebble.x = tx;
  pebble.y = ty;
  pebble.stamina = Math.max(0, pebble.stamina - Math.ceil(dist));
  log(`🚶 ${pebble.name} moved to (${tx},${ty}).`);
  return { ok: true, x: tx, y: ty, stamina: pebble.stamina };
}

// 4. Dig
function handleDig(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  const x = args.x != null ? args.x : pebble.x;
  const y = args.y != null ? args.y : pebble.y;
  const adj = Math.abs(pebble.x - x) <= 1 && Math.abs(pebble.y - y) <= 1;
  if (!adj) return { ok: false, reason: 'Target too far, move closer first' };
  const result = digTile(state.grid, x, y);
  if (result.ok && result.dug && result.resource) {
    state.inventory[result.resource] = (state.inventory[result.resource] || 0) + 1;
    pebble.stamina = Math.max(0, pebble.stamina - 10);
    log(`⛏️ ${pebble.name} dug ${result.from} → got 1 ${result.resource}.`);
  } else if (result.ok && !result.dug) {
    pebble.stamina = Math.max(0, pebble.stamina - 5);
  }
  return result;
}

// 5. Build
function handleBuild(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  if (pebble.role !== 'builder') return { ok: false, reason: 'Only Builder can place buildings' };
  const bType = args.buildingType;
  if (!BUILDING_TYPES[bType]) return { ok: false, reason: `Unknown building: ${bType}` };
  // Check if player has the item in inventory
  if ((state.inventory[bType] || 0) <= 0 && bType !== 'house') return { ok: false, reason: `No ${bType} in inventory (craft first)` };
  if (bType === 'house' && (state.inventory.plank||0) < 5) return { ok: false, reason: 'Need 5 plank to build a house' };
  const x = args.x != null ? args.x : pebble.x;
  const y = args.y != null ? args.y : pebble.y + 1;
  const adj = Math.abs(pebble.x - x) <= 1 && Math.abs(pebble.y - y) <= 1;
  if (!adj) return { ok: false, reason: 'Target too far' };
  const result = placeBuilding(state.grid, x, y, bType);
  if (result.ok) {
    if (bType !== 'house') state.inventory[bType]--;
    else { state.inventory.plank -= 5; state.inventory.brick = (state.inventory.brick||0) - 3; state.inventory.stone = (state.inventory.stone||0) - 3; }
    state.housesBuilt = countHouses(state.grid);
    pebble.stamina = Math.max(0, pebble.stamina - 15);
    log(`🔨 ${pebble.name} built ${bType} at (${x},${y}).`);
  }
  return result;
}

// 6. Assign Home
function handleAssignHome(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  const homeName = args.homeName;
  // Find house
  let found = false;
  for (let y = 0; y < state.grid.length; y++)
    for (let x = 0; x < state.grid[y].length; x++)
      if (state.grid[y][x].building && state.grid[y][x].building.type === 'house' && state.grid[y][x].building.name === homeName)
        found = true;
  if (!found) return { ok: false, reason: `No house named "${homeName}" found` };
  // Check if another pebble already assigned
  const occupied = state.pebbles.find(p => p.home === homeName && p.name !== pebble.name);
  if (occupied) return { ok: false, reason: `House "${homeName}" already assigned to ${occupied.name}` };
  pebble.home = homeName;
  pebble.base = homeName;
  // Move pebble to house location
  const pos = findHomePos(homeName);
  if (pos) { pebble.x = pos.x; pebble.y = pos.y + 1; }
  log(`🏠 ${pebble.name} assigned to ${homeName}.`);
  return { ok: true, pebble: pebble.name, home: homeName };
}

// 7. Craft
function handleCraft(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  const item = args.item;
  const result = craft(item, state.inventory);
  if (!result.ok) return result;
  const recipe = result.recipe;
  if (recipe.requireRole && pebble.role !== recipe.requireRole) return { ok: false, reason: `Need ${recipe.requireRole} role to craft ${item}` };
  // Consume
  for (const [mat, need] of Object.entries(recipe.needs)) state.inventory[mat] -= need;
  state.inventory[item] = (state.inventory[item] || 0) + (recipe.produces || 1);
  pebble.stamina = Math.max(0, pebble.stamina - 10);
  pebble.xp += 5;
  log(`⚒️ ${pebble.name} crafted ${recipe.produces||1} ${item}.`);
  return { ok: true, crafted: item, qty: recipe.produces || 1, inventory: { ...state.inventory } };
}

// 8. Gather (auto collect around pebble)
function handleGather(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  let collected = {};
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = pebble.x + dx, ny = pebble.y + dy;
      if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) continue;
      const tile = state.grid[ny][nx];
      const info = tileInfo(tile.type);
      if (info.resource && tile.hits === 0) {
        // Auto-dig destroyable tiles
        const digResult = digTile(state.grid, nx, ny);
        if (digResult.ok && digResult.dug && digResult.resource) {
          state.inventory[digResult.resource] = (state.inventory[digResult.resource] || 0) + 1;
          collected[digResult.resource] = (collected[digResult.resource] || 0) + 1;
        }
      }
    }
  }
  pebble.stamina = Math.max(0, pebble.stamina - 10);
  const keys = Object.keys(collected);
  if (keys.length) log(`🧺 ${pebble.name} gathered: ${keys.map(k => `${collected[k]} ${k}`).join(', ')}`);
  return { ok: true, collected };
}

// 9. Night Return (auto-return all pebbles to base)
function handleNightReturn() {
  const results = [];
  state.pebbles.forEach(p => {
    if (p.home) {
      const pos = findHomePos(p.home);
      if (pos) { p.x = pos.x; p.y = pos.y + 1; results.push(`${p.name} → ${p.home}`); }
    } else {
      // Return to main camp
      p.x = Math.floor(MAP_W/2);
      p.y = Math.floor(MAP_H/2);
      results.push(`${p.name} → 🏕️ Main Camp`);
    }
    p.stamina = Math.min(100, p.stamina + 20);
  });
  state.cycle = 'night';
  log('🌙 All Pebbles returned home for the night.');
  return { ok: true, moves: results };
}

// 10. Battle
function handleBattle(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  const monster = args.monster || 'slime';
  if (!MONSTER_STATS[monster]) return { ok: false, reason: `Unknown monster "${monster}"` };
  const monsterLevel = args.level || Math.ceil(state.day / 3) + 1;
  const result = simulateBattle(pebble.role, pebble.level, monster, monsterLevel);
  if (result.winner === 'pebble') {
    pebble.xp += 10 + monsterLevel * 3;
    state.monstersDefeated++;
    if (monster === 'boss') state.bossesDefeated++;
    const needed = pebble.level * 15;
    let levelUp = false;
    if (pebble.xp >= needed) {
      pebble.level++;
      pebble.xp -= needed;
      const base = PEBBLE_BASE[pebble.role];
      if (base) pebble.hp = statScale(base.hp, pebble.level);
      levelUp = true;
      log(`⬆️ ${pebble.name} leveled up to Lv.${pebble.level}!`);
    }
    const loot = ['wood','stone','berry','iron','coal'][Math.floor(Math.random()*5)];
    const qty = 1 + Math.floor(Math.random() * 2);
    state.inventory[loot] = (state.inventory[loot] || 0) + qty;
    log(`⚔️ ${pebble.name} defeated Lv.${monsterLevel} ${monster}!`);
    return { winner: 'pebble', pebbleHp: result.pebbleHp, monsterHp: result.monsterHp, log: result.log.concat([`Loot: ${qty} ${loot}`]), levelUp };
  } else {
    pebble.hp = Math.max(1, pebble.hp - 10);
    log(`💀 ${pebble.name} fainted to Lv.${monsterLevel} ${monster}!`);
    return { winner: 'monster', pebbleHp: result.pebbleHp, monsterHp: result.monsterHp, log: result.log };
  }
}

// 11. Evolve
function handleEvolve(args) {
  const pebble = state.pebbles.find(p => p.name === args.pebbleName || p.role === args.pebbleName);
  if (!pebble) return { ok: false, reason: `Pebble "${args.pebbleName}" not found` };
  const evo = canEvolve(pebble.role, pebble.level);
  if (!evo) return { ok: false, reason: `${pebble.name} cannot evolve yet` };
  pebble.role = evo.to;
  const base = PEBBLE_BASE[pebble.role.split('_')[0]] || PEBBLE_BASE[pebble.role] || { hp:50, atk:10, def:10 };
  pebble.hp = Math.floor(statScale(base.hp, pebble.level) * evo.statBoost);
  log(`🌟 ${pebble.name} evolved into ${evo.to}!`);
  return { ok: true, evolvedTo: evo.to, statBoost: evo.statBoost, newHp: pebble.hp };
}

// 12. Market
function handleMarket(args) {
  if (!args.action) return { items: Object.keys(require('./engine').MARKET) };
  if (args.action === 'buy') {
    const result = trade(args.item, args.qty || 1, state.inventory.coins);
    if (result.ok) {
      state.inventory.coins -= result.cost;
      state.inventory[args.item] = (state.inventory[args.item] || 0) + (args.qty || 1);
      log(`🛒 Bought ${args.qty||1} ${args.item} for ${result.cost} coins.`);
      return { ok: true, item: args.item, qty: args.qty || 1, cost: result.cost, remaining: state.inventory.coins };
    }
    return result;
  }
  if (args.action === 'sell') {
    const item = args.item;
    if (!state.inventory[item] || state.inventory[item] < (args.qty || 1)) return { ok: false, reason: `Not enough ${item}` };
    const price = getPrice(item);
    if (!price) return { ok: false, reason: 'Unknown item' };
    const total = price * (args.qty || 1);
    state.inventory[item] -= (args.qty || 1);
    state.inventory.coins += total;
    log(`💰 Sold ${args.qty||1} ${item} for ${total} coins.`);
    return { ok: true, item, qty: args.qty || 1, gained: total, coins: state.inventory.coins };
  }
  return { ok: false, reason: `Unknown action "${args.action}"` };
}

// 13. Zones
const ZONES = [
  { name:'beach', unlocked:true, resources:['wood','fiber'], danger:'low' },
  { name:'forest', unlocked:false, resources:['wood','berry','coal'], danger:'medium' },
  { name:'mountain', unlocked:false, resources:['stone','iron','gold'], danger:'high' },
  { name:'cave', unlocked:false, resources:['coal','crystal','gold'], danger:'high' },
  { name:'volcano', unlocked:false, resources:['gold','crystal'], danger:'extreme' }
];

function handleZones(args) {
  if (!args.action) return ZONES;
  if (args.action === 'move') {
    const zone = ZONES.find(z => z.name === args.zone);
    if (!zone) return { ok: false, reason: `Unknown zone "${args.zone}"` };
    if (!zone.unlocked) return { ok: false, reason: `${args.zone} is locked.` };
    state.zone = args.zone;
    log(`🚀 Moved to ${args.zone}.`);
    return { ok: true, zone: args.zone, resources: zone.resources };
  }
  return { ok: false, reason: `Unknown action "${args.action}"` };
}

// 14. Advance Day
function handleAdvance(args) {
  state.day++;
  state.cycle = 'day';
  state.pebbles.forEach(p => {
    const base = PEBBLE_BASE[p.role.split('_')[0]] || PEBBLE_BASE[p.role] || { hp:50 };
    p.hp = Math.min(statScale(base.hp, p.level), p.hp + 25);
    p.stamina = 100; // Full stamina new day
  });
  if (state.discovered >= 25) ZONES.find(z=>z.name==='forest').unlocked = true;
  if (state.discovered >= 50) ZONES.find(z=>z.name==='mountain').unlocked = true;
  if (state.discovered >= 70) ZONES.find(z=>z.name==='cave').unlocked = true;
  if (state.discovered >= 90) ZONES.find(z=>z.name==='volcano').unlocked = true;
  log(`🌅 Day ${state.day} begins! All Pebbles healed and stamina restored.`);
  return { day: state.day, cycle: state.cycle, healed: true, staminaRestored: true };
}

// 15. Map view
function handleMap(args) {
  const centerX = args.x != null ? args.x : Math.floor(MAP_W/2);
  const centerY = args.y != null ? args.y : Math.floor(MAP_H/2);
  const radius = args.radius || 5;
  const view = [];
  for (let dy = -radius; dy <= radius; dy++) {
    const row = [];
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = centerX + dx, ny = centerY + dy;
      if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) { row.push('⬛'); continue; }
      const tile = state.grid[ny][nx];
      // Check pebble
      const pebbleHere = state.pebbles.find(p => p.x === nx && p.y === ny);
      if (pebbleHere) { row.push('🧑'); continue; }
      if (tile.building) { row.push(BUILDING_TYPES[tile.building.type]?.label || '🏗️'); continue; }
      const info = tileInfo(tile.type);
      row.push(info.label || '⬜');
    }
    view.push(row.join(''));
  }
  return { center: `(${centerX},${centerY})`, radius, view };
}

// ─── MCP Tool Interface ───
const TOOLS = {
  'claw_status':       { handler: handleStatus,     desc: 'View game status (day, cycle, pebbles, inventory, houses)' },
  'claw_explore':      { handler: handleExplore,    desc: 'Explore island, find resources' },
  'claw_move':         { handler: handleMove,       desc: 'Move a pebble: {pebbleName, x, y}' },
  'claw_dig':          { handler: handleDig,        desc: 'Dig tile: {pebbleName, x?, y?}' },
  'claw_build':        { handler: handleBuild,      desc: 'Build structure: {pebbleName, buildingType, x?, y?} (builder only)' },
  'claw_assign_home':  { handler: handleAssignHome, desc: 'Assign pebble to house: {pebbleName, homeName}' },
  'claw_craft':        { handler: handleCraft,      desc: 'Craft item: {pebbleName, item} (requires role)' },
  'claw_gather':       { handler: handleGather,     desc: 'Auto-gather resources around a pebble' },
  'claw_night_return': { handler: handleNightReturn,desc: 'All pebbles return home for night' },
  'claw_battle':       { handler: handleBattle,     desc: 'Battle: {pebbleName, monster?, level?}' },
  'claw_evolve':       { handler: handleEvolve,     desc: 'Evolve pebble: {pebbleName}' },
  'claw_market':       { handler: handleMarket,     desc: 'Market: {} to list, {action:"buy"|"sell", item, qty}' },
  'claw_zones':        { handler: handleZones,      desc: 'Zones: {} to list, {action:"move", zone}' },
  'claw_advance':      { handler: handleAdvance,    desc: 'Advance to next day' },
  'claw_map':          { handler: handleMap,        desc: 'View local map: {x?, y?, radius?}' }
};

function callTool(name, args) {
  const tool = TOOLS[name];
  if (!tool) return { ok: false, error: `Unknown tool "${name}"` };
  try { return { ok: true, result: tool.handler(args || {}) }; }
  catch (e) { return { ok: false, error: e.message }; }
}

module.exports = { callTool, state, TOOLS, ZONES };