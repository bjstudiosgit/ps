'use client';
import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createRun, jump, stepRun, GROUND, DINO_X } from '@/lib/dino-engine';

// Sprite artwork: The Chromium Authors, BSD licence in public/CHROMIUM-LICENSE.txt.
export default function DinoGame({ onGameOver }: { onGameOver: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actionRef = useRef<() => void>(() => {});
  const callbackRef = useRef(onGameOver);
  callbackRef.current = onGameOver;
  const [phase, setPhase] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let active = true, frame = 0, last = 0, revealTimer = 0, sceneHeight = 210;
    const run = createRun(Math.max(260, canvas.clientWidth));
    const sprite = new Image();
    function resize() {
      if (!canvas || !ctx) return;
      const sceneScale = Math.min(2, canvas.clientWidth / 320);
      run.width = canvas.clientWidth / sceneScale;
      sceneHeight = canvas.clientHeight / sceneScale;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      ctx.setTransform(scale * sceneScale, 0, 0, scale * sceneScale, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, run.width, sceneHeight);
      ctx.save();
      ctx.translate(0, sceneHeight * 0.65 - GROUND);
      const groundOffset = run.distance % 600;
      for (let x = -groundOffset; x < run.width; x += 600) ctx.drawImage(sprite, 2, 54, 600, 12, x, GROUND - 10, 600, 12);
      const cloudX = run.width - ((run.distance * 0.16 + 100) % (run.width + 100));
      ctx.drawImage(sprite, 86, 2, 46, 14, cloudX, 42, 46, 14);
      const dinoFrame = run.dead ? 220 : !run.started || run.y > 0 ? 0 : 88 + Math.floor(run.elapsed * 10) % 2 * 44;
      ctx.drawImage(sprite, 848 + dinoFrame, 2, 44, 47, DINO_X, GROUND - 47 - run.y, 44, 47);
      for (const obstacle of run.obstacles) ctx.drawImage(sprite, obstacle.large ? 332 : 228, 2, obstacle.width, obstacle.height, obstacle.x, GROUND - obstacle.height, obstacle.width, obstacle.height);
      ctx.restore();
    }
    function tick(now: number) {
      if (!active) return;
      if (!document.hidden) stepRun(run, last ? (now - last) / 1000 : 0);
      last = now;
      draw();
      if (run.dead) {
        setPhase('over');
        revealTimer = window.setTimeout(() => { if (active) callbackRef.current(); }, 600);
      } else frame = requestAnimationFrame(tick);
    }
    function resetClock() { last = 0; }
    document.addEventListener('visibilitychange', resetClock);
    sprite.onload = () => {
      if (!active) return;
      run.started = true;
      setPhase('running');
      canvas.focus({ preventScroll: true });
      actionRef.current = () => { if (run.dead) return; jump(run); setPhase('running'); };
      frame = requestAnimationFrame(tick);
    };
    sprite.onerror = () => { if (active) setPhase('error'); };
    sprite.src = '/dino-sprite.png';
    return () => { active = false; cancelAnimationFrame(frame); clearTimeout(revealTimer); observer.disconnect(); document.removeEventListener('visibilitychange', resetClock); actionRef.current = () => {}; };
  }, [attempt]);

  function play() { actionRef.current(); canvasRef.current?.focus({ preventScroll: true }); }
  return <div className="game-fullscreen" onKeyDown={e => {
    if (['Space', 'ArrowUp'].includes(e.code) && phase !== 'error' && phase !== 'loading') { e.preventDefault(); if (!e.repeat) play(); }
  }}>
    <canvas ref={canvasRef} className="dino-canvas" tabIndex={0} role="button" aria-label="Dinosaur game. Press Space or up arrow, or tap to jump over cacti." onPointerDown={e => { e.preventDefault(); play(); }} />
    {phase === 'error' && <Button className="game-retry" aria-label="Game could not load. Retry." onClick={() => { setPhase('loading'); setAttempt(value => value + 1); }}><RotateCcw size={24}/></Button>}
  </div>;
}
