// 성장 기록 관련 타입
export interface GrowthRecord {
  id: string;
  childId: string;
  userId: string;
  recordedAt: string;
  weight?: number; // kg
  height?: number; // cm
  headCircumference?: number; // cm
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface CreateGrowthRecordRequest {
  childId: string;
  recordedAt: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
}

export interface UpdateGrowthRecordRequest {
  recordedAt?: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
}

// 성장 차트 데이터
export interface GrowthChartData {
  records: GrowthRecord[];
  percentiles: {
    weight: PercentileData[];
    height: PercentileData[];
    headCircumference: PercentileData[];
  };
}

export interface PercentileData {
  ageInMonths: number;
  p3: number; // 3rd percentile
  p10: number; // 10th percentile
  p25: number; // 25th percentile
  p50: number; // 50th percentile (median)
  p75: number; // 75th percentile
  p90: number; // 90th percentile
  p97: number; // 97th percentile
}

// 성장 통계
export interface GrowthStats {
  latestRecord?: GrowthRecord;
  growthRate: {
    weight: number; // kg per month
    height: number; // cm per month
  };
  percentileRanking: {
    weight?: number;
    height?: number;
    headCircumference?: number;
  };
}
