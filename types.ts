export interface AnalysisResult {
  trust_score: number;
  verdict: 'Genuine' | 'Suspicious' | 'Fake';
  reasons: string[]; 
  advice: string;
  url: string;
  timestamp: string;
  sources?: string[]; 
  nlp_insights?: string[]; // New: Detailed linguistic/pattern insights
  breakdown?: {
    reviews: string[];
    sentiment: string[];
    price: string[];
    seller: string[];
    description: string[];
  };
}

export enum ViewMode {
  ANALYZER = 'ANALYZER',
  EXPLANATION = 'EXPLANATION',
  BACKEND_CODE = 'BACKEND_CODE',
}

export interface FeatureSet {
  has_https: boolean;
  url_length: number;
  domain_age_days: number;
  suspicious_keywords: number;
  subdomain_count: number;
}