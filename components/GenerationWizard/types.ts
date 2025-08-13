// Shared types for GenerationWizard steps
export interface LocalBusinessData {
  businessName: string;
  businessType: string;
  website: string;
  zipCode: string;
  address: string;
  phone: string;
  email: string;
  serviceAreaZips: string[];
  brandTerms: string[];
  targetKeywords: string[];
  competitorUrls: string[];
  primaryServices: string[];
  uniqueSellingPoints: string[];
}

export interface BusinessSearchResult {
  name: string;
  businessType: string;
  address: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  isReal?: boolean;
}

export interface WebsiteAnalysisResult {
  comprehensive: boolean;
  extractedData?: {
    keywords: number;
    services: number;
    brandTerms: number;
    usps: number;
  };
}

export interface PaletteOption {
  value: string;
  label: string;
  description?: string;
  colors?: string[];
}

export interface SelectOption {
  value: string;
  label: string;
}
