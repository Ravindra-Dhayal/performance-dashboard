export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, ratio?: number) {
  // Use 1.25 max DPI for optimal 60fps performance
  const dpr = Math.min(1.25, window.devicePixelRatio || 1);
  const actualRatio = ratio ?? dpr;
  const { width, height } = canvas.getBoundingClientRect();
  const w = Math.round(width * actualRatio);
  const h = Math.round(height * actualRatio);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

export function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
