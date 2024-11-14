export interface Analytics {
  _id: string;
  user_id: string;
  contracts_reviewed: Record<string, number>;
  total_clauses: number;
  total_risky_clauses: number;
  total_contracts: number;
  total_pages: number;
  total_tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsUpdateRequest {
  contracts_reviewed: Record<string, number>;
  total_clauses: number;
  total_risky_clauses: number;
  total_contracts: number;
  total_pages: number;
  total_tokens_used: number;
}

export interface AnalyticsResponse extends Analytics {
  // pass
}
