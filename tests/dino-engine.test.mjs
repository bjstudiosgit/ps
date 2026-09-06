import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, jump, stepRun } from '../lib/dino-engine.ts';

test('waits for a player action before starting', () => {
  const run = createRun(320);
  stepRun(run, 1);
  assert.equal(run.distance, 0);
  assert.equal(run.dead, false);
});

test('a ground-level cactus ends a run and freezes the score', () => {
  const run = createRun(320);
  run.started = true;
  run.obstacles.push({ x: 73, width: 17, height: 35, large: false });
  stepRun(run, 1 / 60);
  assert.equal(run.dead, true);
  const distance = run.distance;
  jump(run);
  stepRun(run, 1);
  assert.equal(run.distance, distance);
});

test('a correctly timed jump clears a cactus and lands', () => {
  for (const fps of [30, 60, 120]) {
    const run = createRun(320);
    run.spawnIn = 100;
    run.obstacles.push({ x: 155, width: 25, height: 50, large: true });
    jump(run);
    for (let frame = 0; frame < fps; frame++) stepRun(run, 1 / fps);
    assert.equal(run.dead, false, `jump should clear at ${fps} fps`);
    assert.equal(run.y, 0, 'dinosaur lands on the ground');
  }
});

test('jump cannot be repeated in the air', () => {
  const run = createRun(320);
  jump(run);
  stepRun(run, 0.1);
  const velocity = run.velocity;
  jump(run);
  assert.equal(run.velocity, velocity);
});

test('an unattended run naturally ends on desktop and mobile widths', () => {
  for (const width of [280, 720]) {
    const run = createRun(width);
    jump(run);
    for (let frame = 0; frame < 600 && !run.dead; frame++) stepRun(run, 1 / 60, () => 0.5);
    assert.equal(run.dead, true);
    assert.ok(run.distance > 0);
  }
});
