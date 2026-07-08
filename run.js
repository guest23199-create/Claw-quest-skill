#!/usr/bin/env node
'use strict';

const readline = require('readline');
const { callTool, state, ZONES } = require('./src/server');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(q) { return new Promise(r => rl.question(q, r)); }

function showStatus() {
  const r = callTool('claw_status', {});
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Claw Quest — Ngày ${r.result.day} | ${r.result.cycle.toUpperCase()} | Zone: ${r.result.zone} | Khám phá: ${r.result.discovered}`);
  console.log(`💰 ${r.result.inventory.coins} coins | 🧱 gỗ:${r.result.inventory.wood} đá:${r.result.inventory.stone} sợi:${r.result.inventory.fiber} quả:${r.result.inventory.berry}`);
  console.log(`⚔️ Quái: ${r.result.monstersDefeated} | Boss: ${r.result.bossesDefeated}`);
  console.log('-'.repeat(50));
  console.log(r.result.pebbles);
  console.log('='.repeat(50) + '\n');
}

async function main() {
  console.log('\n🐚 CLAW QUEST — OpenClaw Skill\n');
  
  while (true) {
    showStatus();
    const cmd = (await prompt('❯ ')).trim().toLowerCase();
    
    if (cmd === 'exit' || cmd === 'quit') break;
    
    if (cmd === 'explore' || cmd === 'e') {
      const r = callTool('claw_explore', {});
      console.log(`🔍 Khám phá +${r.result.discovered}% | Tìm: ${r.result.found.qty} ${r.result.found.item}`);
      if (r.result.encounter) console.log(`⚠️ Gặp ${r.result.encounter.type} cấp ${r.result.encounter.level}!`);
    }
    else if (cmd.startsWith('battle') || cmd === 'b') {
      const parts = cmd.split(' ');
      const name = parts[1] || 'Miner';
      const monster = parts[2] || 'slime';
      const r = callTool('claw_battle', { pebbleName: name, monster });
      if (r.ok) {
        r.result.log.forEach(l => console.log(`  ${l}`));
        console.log(`🏆 ${r.result.winner === 'pebble' ? 'Thắng!' : 'Thua...'}`);
      } else console.log(`❌ ${r.reason}`);
    }
    else if (cmd.startsWith('evolve')) {
      const name = cmd.split(' ')[1] || 'Miner';
      const r = callTool('claw_evolve', { pebbleName: name });
      if (r.ok) console.log(r.result.ok ? `🌟 Tiến hóa thành ${r.result.evolvedTo}!` : `❌ ${r.result.reason}`);
      else console.log(`❌ ${r.error}`);
    }
    else if (cmd.startsWith('buy')) {
      const parts = cmd.split(' ');
      const r = callTool('claw_market', { action: 'buy', item: parts[1] || 'wood', qty: parseInt(parts[2]) || 1 });
      if (r.ok && r.result.ok) console.log(`🛒 Mua ${r.result.qty} ${r.result.item} (${r.result.cost} coins). Còn: ${r.result.remaining}`);
      else console.log(`❌ ${r.result?.reason || r.error}`);
    }
    else if (cmd.startsWith('sell')) {
      const parts = cmd.split(' ');
      const r = callTool('claw_market', { action: 'sell', item: parts[1] || 'wood', qty: parseInt(parts[2]) || 1 });
      if (r.ok && r.result.ok) console.log(`💰 Bán ${r.result.qty} ${r.result.item} được ${r.result.gained} coins.`);
      else console.log(`❌ ${r.result?.reason || r.error}`);
    }
    else if (cmd.startsWith('move')) {
      const zone = cmd.split(' ')[1] || 'forest';
      const r = callTool('claw_zones', { action: 'move', zone });
      if (r.ok) console.log(r.result.ok ? `🚀 Di chuyển đến ${zone}` : `❌ ${r.result.reason}`);
      else console.log(`❌ ${r.error}`);
    }
    else if (cmd === 'advance' || cmd === 'a') {
      const r = callTool('claw_advance', {});
      console.log(`🌅 Ngày ${r.result.day} bắt đầu! Hồi phục! Quái đêm: ${r.result.nightMonsters}`);
    }
    else if (cmd === 'help' || cmd === 'h') {
      console.log(`
  📋 LỆNH:
    explore (e)         — khám phá bản đồ
    battle <tên> <quái> — chiến đấu (vd: battle Miner slime)
    evolve <tên>        — tiến hóa pebble
    buy <item> <sl>     — mua vật phẩm
    sell <item> <sl>    — bán vật phẩm
    move <zone>         — di chuyển vùng
    advance (a)         — qua ngày mới
    exit                — thoát
      `);
    }
    else console.log('❓ Gõ "help" để xem lệnh.');
  }
  
  rl.close();
  console.log('👋 Tạm biệt!');
}

main().catch(console.error);