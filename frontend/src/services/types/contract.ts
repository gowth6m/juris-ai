export enum ContractType {
  SERVICE_LEVEL_AGREEMENT = 'service_level_agreement',
  MASTER_SERVICE_AGREEMENT = 'master_service_agreement',
  NON_DISCLOSURE_AGREEMENT = 'non_disclosure_agreement',
  OTHER = 'other',
}

export enum ContractIndustry {
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  OTHER = 'other',
}

export enum ContractJurisdiction {
  UNITED_STATES = 'united_states',
  UNITED_KINGDOM = 'united_kingdom',
  OTHER = 'other',
}

export interface Clause {
  key: string; // The key of the clause e.g. "1.1" or "2.3.4"
  content: string;
  risk_type: string;
  risk_level: number;
  concerns: string;
  recommendations: string;
}

export interface Contract {
  _id: string;
  title: string;
  processed_html: string;
  original_html: string;
  uploaded_by: string;
  clauses?: Clause[];
  pages?: number;
  has_review: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewAnalytics {
  tokens_used: number;
  total_time_taken: number;
  total_clauses: number;
  risky_clauses: number;
  total_batches: number;
  rate_limit_hits: number;
  average_time_per_batch: number;
  success_rate: number;
}

export interface ContractReview {
  _id: string;
  contract_id: string;
  risky_clauses: Clause[];
  contract_type: ContractType;
  contract_industry: ContractIndustry;
  contract_jurisdiction: ContractJurisdiction;
  summary_checklist: string | null;
  analytics: ReviewAnalytics | null;
  created_at: Date;
  updated_at: Date;
}

export interface ContractResponse extends Contract {}

export interface ContractReviewPayload {
  contractId: string;
  jurisdiction: string;
  industry: string;
  contractType: string;
}

export interface ContractExplainClauseRequest {
  clause: string;
}

export interface ContractResponseWithReview extends ContractResponse {
  review: ContractReview | null;
}
