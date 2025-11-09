import { NextResponse } from 'next/server';
import { generateData } from '../../../lib/dataGenerator';
import type { DataPoint } from '../../../lib/types';

interface DataQueryParams {
  count?: string;
  series?: string;
  startTime?: string;
}

interface PostRequestBody {
  action?: 'stream' | 'generate';
  count?: number;
  series?: number;
}

interface SuccessResponse {
  ok: boolean;
  data: DataPoint[];
  metadata: {
    count: number;
    series: number;
    timestamp: number;
  };
}

interface ErrorResponse {
  ok: boolean;
  error: string;
}

/**
 * GET /api/data - Fetch initial or filtered dataset
 * Query params:
 * - count: number of points (default: 10000)
 * - series: number of series (default: 3)
 * - startTime: optional start timestamp
 */
export async function GET(request: Request): Promise<NextResponse<SuccessResponse>> {
  const { searchParams } = new URL(request.url);
  const count: number = parseInt(searchParams.get('count') || '10000', 10);
  const seriesCount: number = parseInt(searchParams.get('series') || '3', 10);
  
  // Server-side data generation with validation
  const validCount: number = Math.min(Math.max(count, 100), 50000); // Limit: 100-50k
  const validSeries: number = Math.min(Math.max(seriesCount, 1), 10); // Limit: 1-10
  
  const data: DataPoint[] = generateData(validCount, validSeries);
  
  return NextResponse.json({
    ok: true,
    data,
    metadata: {
      count: data.length,
      series: validSeries,
      timestamp: Date.now()
    }
  });
}

/**
 * POST /api/data - Stream or generate new data points
 * Body:
 * - action: 'stream' | 'generate'
 * - count: number of new points
 * - series: number of series
 */
export async function POST(request: Request): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body: PostRequestBody = await request.json();
    
    if (!body.action || !['stream', 'generate'].includes(body.action)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid action. Must be "stream" or "generate"' }, 
        { status: 400 }
      );
    }
    
    const count: number = body.count || 10;
    const series: number = body.series || 3;
    const data: DataPoint[] = generateData(count, series);
    
    return NextResponse.json({
      ok: true,
      data,
      metadata: {
        count: data.length,
        series,
        timestamp: Date.now()
      }
    });
  } catch (e: unknown) {
    const errorMessage: string = e instanceof Error ? e.message : 'Invalid request body';
    return NextResponse.json(
      { ok: false, error: errorMessage }, 
      { status: 400 }
    );
  }
}
