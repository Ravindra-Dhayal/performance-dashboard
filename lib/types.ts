export type DataPoint = {
  id: number;
  x: number;
  y: number;
  series?: string;
  value?: number;
  timestamp?: number;
};

export type DataBatch = DataPoint[];
