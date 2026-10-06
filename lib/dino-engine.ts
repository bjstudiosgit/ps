export const GROUND = 172;
export const DINO_X = 42;
export type Obstacle = { x: number; width: number; height: number; large: boolean; variant?: number };
export type Run = { width: number; y: number; velocity: number; elapsed: number; distance: number; spawnIn: number; dead: boolean; started: boolean; obstacles: Obstacle[] };
export function createRun(width: number): Run {
  return { width, y: 0, velocity: 0, elapsed: 0, distance: 0, spawnIn: 0.75, dead: false, started: false, obstacles: [] };
}
export function getScore(run: Run) {
  return Math.floor(run.distance / 10);
}
export function getSpeed(run: Run) {
  // Accelerate every 100 points; cap speed to preserve reaction time on mobile.
  return Math.min(660, 380 + Math.floor(getScore(run) / 100) * 35);
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
    const speed = getSpeed(run);
    run.distance += speed * dt;
    run.y = Math.max(0, run.y + run.velocity * dt - 850 * dt * dt);
    run.velocity = run.y > 0 ? run.velocity - 1700 * dt : 0;
    run.spawnIn -= dt;
    if (run.spawnIn <= 0) {
      const height = 40 + Math.floor(random() * 4) * 10;
      // Individual plants vary in appearance and size, with clear space between them.
      const variant = Math.floor(random() * 3);
      run.obstacles.push({ x: run.width + 35, width: height / 2, height, large: height >= 50, variant });
      // A jump lasts about 0.7 seconds; keep a small landing window between clusters.
      const difficulty = (speed - 380) / 280;
      run.spawnIn = 0.88 - difficulty * 0.11 + random() * 0.22;
    }
    for (const obstacle of run.obstacles) {
      obstacle.x -= speed * dt;
      if (DINO_X + 34 > obstacle.x + 3 && DINO_X + 9 < obstacle.x + obstacle.width - 3 && run.y + 6 < obstacle.height) run.dead = true;
    }
    run.obstacles = run.obstacles.filter(obstacle => obstacle.x + obstacle.width > -10);
  }
}
