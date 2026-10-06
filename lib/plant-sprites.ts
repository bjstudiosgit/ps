// Small canvas sprites keep the runner's foliage crisp at every display scale.
export function createPlantSprites(): HTMLCanvasElement[] {
  return [false, true].map(bushy => {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    const stem = bushy ? '#355d29' : '#49752b';
    const light = bushy ? '#769849' : '#89b94e';
    const dark = bushy ? '#375c34' : '#3f752e';
    ctx.fillStyle = stem;
    ctx.fillRect(19, 8, 3, 72);
    const leaf = (x: number, y: number, angle: number, length: number, color: string) => {
      const dx = Math.sin(angle), dy = -Math.cos(angle);
      const points = [[0, 0], [-2, 0.25], [-1, 0.36], [-3, 0.48], [-2, 0.58], [-2, 0.7], [0, 1], [2, 0.7], [2, 0.58], [3, 0.48], [1, 0.36], [2, 0.25]];
      ctx.fillStyle = color;
      ctx.beginPath();
      points.forEach(([spread, along], index) => {
        const px = Math.round(x + dx * along * length + dy * spread);
        const py = Math.round(y + dy * along * length - dx * spread);
        if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
    };
    const tiers = bushy ? [26, 41, 55, 68] : [25, 44, 63];
    tiers.forEach((y, tier) => {
      const reach = bushy ? 18 : 15;
      for (const angle of [-1.1, -0.55, 0, 0.55, 1.1]) {
        leaf(20, y, angle, angle === 0 ? 20 : reach, (tier + Math.round(angle * 10)) % 2 === 0 ? light : dark);
      }
      if (bushy) {
        ctx.fillStyle = '#795678';
        ctx.fillRect(17, y - 12, 5, 5);
        ctx.fillStyle = '#b1a15d';
        ctx.fillRect(18, y - 14, 2, 3);
      }
    });
    leaf(20, 16, 0, 15, light);
    return canvas;
  });
}
