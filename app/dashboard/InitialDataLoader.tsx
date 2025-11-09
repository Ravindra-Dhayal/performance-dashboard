import { generateData } from '../../lib/dataGenerator';
import type { DataPoint } from '../../lib/types';

/**
 * Server Component for SSR data fetching
 * Generates initial dataset on the server to reduce client-side load
 */
export default async function InitialDataLoader() {
  // Server-side data generation (SSR)
  const initialData: DataPoint[] = generateData(10000, 1);
  
  return (
    <script
      id="initial-data"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(initialData)
      }}
    />
  );
}
