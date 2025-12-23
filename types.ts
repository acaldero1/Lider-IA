export interface ParsedSheet {
  name: string;
  data: unknown[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
}

export interface SimulationReport {
  summary: {
    detectedSheets: string[];
    missingSheets: string[];
    overview: string;
  };
  kpis: {
    label: string;
    value: string | number;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
  charts: {
    resourceUtilization: ChartDataPoint[];
    queueTimes: ChartDataPoint[];
    throughput?: ChartDataPoint[];
  };
  insights: {
    type: 'bottleneck' | 'risk' | 'opportunity';
    title: string;
    description: string;
  }[];
  recommendations: {
    title: string;
    action: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

export enum AnalysisStatus {
  IDLE,
  PARSING,
  ANALYZING,
  COMPLETE,
  ERROR,
}
