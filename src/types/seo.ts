/**
 * @file Contains type definitions related to SEO (Search Engine Optimization).
 */

/** Represents a single meta tag for an HTML document. */
export interface MetaTag {
  name: string;
  content: string;
}

/** Represents the core SEO data for a landing page. */
export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  metaTags: MetaTag[];
  schemaSnippet?: string;
  ogImagePrompt?: string;
}

/** Represents the data structure of a generated SEO report. */
export interface SeoReportData {
  overallScore: number;
  titleFeedback: string;
  metaDescriptionFeedback: string;
  contentFeedback: string;
  recommendations: string[];
}

/** Represents an SEO report as stored in the database. */
export interface SeoReport {
  id: string;
  user_id: string;
  page_id: string;
  created_at: string;
  score: number;
  report_data: SeoReportData;
  pageName?: string; // For display
}
