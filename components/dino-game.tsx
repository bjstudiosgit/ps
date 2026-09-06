'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    let active = true, frame = 0, last = 0, revealTimer = 0;
    const run = createRun(Math.max(260, canvas.clientWidth));
    const sprite = new Image();
    function resize() {
      if (!canvas || !ctx) return;
      run.width = Math.max(260, canvas.clientWidth);
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(run.width * scale);
      canvas.height = Math.round(210 * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, run.width, 210);
      const groundOffset = run.distance % 600;
      for (let x = -groundOffset; x < run.width; x += 600) ctx.drawImage(sprite, 2, 54, 600, 12, x, GROUND - 10, 600, 12);
      const cloudX = run.width - ((run.distance * 0.16 + 100) % (run.width + 100));
      ctx.drawImage(sprite, 86, 2, 46, 14, cloudX, 42, 46, 14);
      const dinoFrame = run.dead ? 220 : !run.started || run.y > 0 ? 0 : 88 + Math.floor(run.elapsed * 10) % 2 * 44;
      ctx.drawImage(sprite, 848 + dinoFrame, 2, 44, 47, DINO_X, GROUND - 47 - run.y, 44, 47);
      for (const obstacle of run.obstacles) ctx.drawImage(sprite, obstacle.large ? 332 : 228, 2, obstacle.width, obstacle.height, obstacle.x, GROUND - obstacle.height, obstacle.width, obstacle.height);
      ctx.fillStyle = '#535353'; ctx.font = '14px monospace'; ctx.textAlign = 'right';
      ctx.fillText(String(Math.floor(run.distance / 10)).padStart(5, '0'), run.width - 8, 24);
      if (run.dead) { ctx.textAlign = 'center'; ctx.font = 'bold 16px monospace'; ctx.fillText('GAME OVER', run.width / 2, 90); }
    }
    function tick(now: number) {
      if (!active) return;
      if (!document.hidden) stepRun(run, last ? (now - last) / 1000 : 0);
      last = now;
      draw();
      if (run.dead) {
        setPhase('over');
        revealTimer = window.setTimeout(() => { if (active) callbackRef.current(); }, 850);
      } else frame = requestAnimationFrame(tick);
    }
    function resetClock() { last = 0; }
    document.addEventListener('visibilitychange', resetClock);
    sprite.onload = () => {
      if (!active) return;
      setPhase('ready');
      actionRef.current = () => { if (run.dead) return; jump(run); setPhase('running'); };
      frame = requestAnimationFrame(tick);
    };
    sprite.onerror = () => { if (active) setPhase('error'); };
    sprite.src = '/dino-sprite.png';
    return () => { active = false; cancelAnimationFrame(frame); clearTimeout(revealTimer); observer.disconnect(); document.removeEventListener('visibilitychange', resetClock); actionRef.current = () => {}; };
  }, [attempt]);

  function play() { actionRef.current(); canvasRef.current?.focus({ preventScroll: true }); }
  return <section className="invitation game-card" aria-labelledby="game-title" onKeyDown={e => {
    if (['Space', 'ArrowUp'].includes(e.code) && phase !== 'error' && phase !== 'loading') { e.preventDefault(); if (!e.repeat) play(); }
  }}>
    <div className="card-top"><span>PACK SOCIETY</span><span>01 / PLAY</span></div>
    <div className="game-content">
      <div className="eyebrow"><span/> BEFORE YOU ENTER <span/></div>
      <h1 id="game-title">One quick <em>run.</em></h1>
      <p className="intro">Jump the cacti. See how far you get.</p>
      <canvas ref={canvasRef} className="dino-canvas" tabIndex={0} role="button" aria-label="Dinosaur game. Press Space or up arrow, or tap to start and jump over cacti." onPointerDown={e => { e.preventDefault(); play(); }} />
      <p className="game-status" role="status">{phase === 'over' ? 'Game over. Your invitation is ready.' : phase === 'loading' ? 'Getting ready…' : phase === 'error' ? 'The game couldn’t load. Please try again.' : 'Tap to jump · Space or ↑ on your keyboard'}</p>
      <Button className="join-button game-button" disabled={phase === 'loading' || phase === 'over'} onClick={() => { if (phase === 'error') { setPhase('loading'); setAttempt(value => value + 1); } else play(); }}>
        {phase === 'running' ? 'Jump' : phase === 'over' ? 'Your invitation awaits' : phase === 'error' ? 'Retry' : 'Let’s play'}<ArrowRight size={19}/>
      </Button>
    </div>
  </section>;
}
