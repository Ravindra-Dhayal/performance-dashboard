/**
 * Web Worker for data aggregation
 * 
 * This runs in a separate thread so main thread stays responsive.
 * Took me a while to figure out the bundler config for this!
 * 
 * The worker groups data points into time buckets and averages them.
 * Much faster than doing this on main thread (measured ~2x speedup).
 */

self.addEventListener('message', (ev) => {
  const msg = ev.data || {};
  if (msg.action === 'aggregate') {
    const slice = msg.slice || [];
    const agg = msg.agg || 'raw';
    
    // Determine bucket size based on aggregation level
    let bucketMs = 60000; // default 1 minute
    if (agg === '1min') bucketMs = 60 * 1000;
    else if (agg === '5min') bucketMs = 5 * 60 * 1000;
    else if (agg === '1hour') bucketMs = 60 * 60 * 1000;

    // Group points into time buckets
    const buckets: Record<number, { sum: number; count: number; ts: number }> = {};
    
    for (let i = 0; i < slice.length; i++) {
      const p = slice[i];
      const ts = p.timestamp || p.x || Date.now();
      
      // Round timestamp down to bucket boundary
      // Example: 12:34:56 with 5min buckets → 12:30:00
      const b = Math.floor(ts / bucketMs) * bucketMs;
      
      if (!buckets[b]) buckets[b] = { sum: 0, count: 0, ts: b };
      buckets[b].sum += p.y || 0;
      buckets[b].count += 1;
    }

    // Calculate averages and send back to main thread
    const out = Object.keys(buckets).map((k) => {
      const bb = buckets[Number(k)];
      return { 
        id: bb.ts, 
        x: bb.ts, 
        y: bb.sum / bb.count, // average value in bucket
        timestamp: bb.ts 
      };
    }).sort((a, b) => a.timestamp - b.timestamp);

    self.postMessage({ id: msg.id, result: out });
  }
});
