import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, getScore, getSpeed, jump, stepRun } from '../lib/dino-engine.ts';

test('waits for a player action before starting', () => {
  const run = createRun(320);
  stepRun(run, 1);
  assert.equal(run.distance, 0);
  assert.equal(run.dead, false);
});

test('a ground-level plant ends a run and freezes the score', () => {
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

test('speed increases at each 100-point milestone and is capped', () => {
  for (const [score, speed] of [[0, 380], [99, 380], [100, 415], [199, 415], [200, 450], [300, 485], [400, 520], [500, 555], [600, 590], [700, 625], [800, 660], [20000, 660]]) {
    const run = createRun(320);
    run.started = true;
    run.spawnIn = 100;
    run.elapsed = 1000;
    run.distance = score * 10;
    assert.equal(getScore(run), score);
    stepRun(run, 1 / 60);
    assert.ok(Math.abs(run.distance - score * 10 - speed / 60) < 1e-8, `speed at ${score} points`);
  }
  assert.equal(getScore(createRun(320)), 0, 'a fresh run resets the score');
  assert.equal(getSpeed(createRun(320)), 380, 'a fresh run resets the speed');
});

test('crossing a score milestone increases speed on the next simulation step', () => {
  const run = createRun(320);
  run.started = true;
  run.spawnIn = 100;
  run.distance = 999;
  stepRun(run, 1 / 120);
  assert.equal(getScore(run), 100);
  const previousDistance = run.distance;
  stepRun(run, 1 / 120);
  assert.ok(Math.abs(run.distance - previousDistance - 415 / 120) < 1e-8);
});

test('a correctly timed jump clears every plant size at every speed and lands', () => {
  for (const fps of [30, 60, 120]) {
    for (const height of [40, 50, 60, 70]) {
      for (const score of [0, 100, 200, 300, 400, 500, 600, 700, 800]) {
        const run = createRun(320);
        run.spawnIn = 100;
        run.distance = score * 10;
        // Jump with 0.3 seconds before the plant reaches the dinosaur.
        run.obstacles.push({ x: 76 + getSpeed(run) * 0.3, width: height / 2, height, large: height >= 50 });
        jump(run);
        for (let frame = 0; frame < fps; frame++) stepRun(run, 1 / fps);
        assert.equal(run.dead, false, `jump should clear height ${height} at ${fps} fps and ${score} points`);
        assert.equal(run.y, 0, 'dinosaur lands on the ground');
      }
    }
  }
});

test('the tallest plants at the shortest spacing allow consecutive jumps', () => {
  for (const width of [280, 320, 720, 1280]) {
    for (const fps of [30, 60, 120]) {
      const run = createRun(width);
      run.started = true;
      run.distance = 7990;
      let randomCall = 0, jumps = 0;
      // Tallest individual plants, alternate artwork, and the shortest gap.
      const random = () => ++randomCall % 3 === 0 ? 0 : 0.999;
      for (let frame = 0; frame < fps * 20 && !run.dead; frame++) {
        const nextPlant = run.obstacles.find(plant => plant.x + plant.width > 51);
        if (run.y === 0 && nextPlant && nextPlant.x <= 76 + getSpeed(run) * 0.22) {
          jump(run);
          jumps++;
        }
        stepRun(run, 1 / fps, random);
      }
      assert.equal(run.dead, false, `consecutive jumps at width ${width} and ${fps} fps`);
      assert.ok(jumps >= 15, 'the run clears repeated plants through acceleration and maximum speed');
    }
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
