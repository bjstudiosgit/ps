export const GROUND = 172;
export const DINO_X = 42;
export type Obstacle = { x: number; width: number; height: number; large: boolean };
export type Run = { width: number; y: number; velocity: number; elapsed: number; distance: number; spawnIn: number; dead: boolean; started: boolean; obstacles: Obstacle[] };
export function createRun(width: number): Run {
  return { width, y: 0, velocity: 0, elapsed: 0, distance: 0, spawnIn: 1, dead: false, started: false, obstacles: [] };
}
export function jump(run: Run) {
  if (run.dead) return;
  run.started = true;
  if (run.y === 0) run.velocity = 590;
}
export function stepRun(run: Run, delta: number, random = Math.random) {
  if (!run.started || run.dead) return;
  // Small simulation steps keep collision and jump timing stable across screens.
  let remaining = Math.min(Math.max(delta, 0), 0.1);
  while (remaining > 0 && !run.dead) {
    const dt = Math.min(remaining, 1 / 120);
    remaining -= dt;
    run.elapsed += dt;
    const speed = Math.min(440, 260 + run.elapsed * 2);
    run.distance += speed * dt;
    run.y = Math.max(0, run.y + run.velocity * dt - 850 * dt * dt);
    run.velocity = run.y > 0 ? run.velocity - 1700 * dt : 0;
    run.spawnIn -= dt;
    if (run.spawnIn <= 0) {
      const large = random() > 0.5;
      run.obstacles.push({ x: run.width + 35, width: large ? 25 : 17, height: large ? 50 : 35, large });
      run.spawnIn = 1.35 + random() * 0.65;
    }
    for (const obstacle of run.obstacles) {
      obstacle.x -= speed * dt;
      if (DINO_X + 34 > obstacle.x + 3 && DINO_X + 9 < obstacle.x + obstacle.width - 3 && run.y + 6 < obstacle.height) run.dead = true;
    }
    run.obstacles = run.obstacles.filter(obstacle => obstacle.x + obstacle.width > -10);
  }
}
