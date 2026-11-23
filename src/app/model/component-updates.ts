// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
var updateQueue = [];

let lastTick = new Date();
let ticksPerSecond = 0;

let pauseSimulation = false;
let updates;
let simulationSaturated = false;

function tick() {
  const start = new Date();
  updates = 0;

  const result = window.reeoTick(updateQueue, pauseSimulation);
  updates = result.updates;
  simulationSaturated = result.saturated;

  ticksPerSecond = 1000 / (new Date() - lastTick);
  lastTick = new Date();
}

setInterval(tick, 16);

// 500ms : 1:39
// 250ms : 56
