/**
 * @file Contains type definitions for the proofing management system.
 */

import type { PricingStatus } from './product';

/** The status of a proofing request. */
export type ProofingStatus = 'Out for Proof' | 'Response from Client' | 'Approved' | 'Disapproved' | 'Canceled';
/** The type of entity being proofed. */
export type ProofingEntityType = 'order' | 'page' | 'image' | 'video';

/** Represents a comment on a proofing request. */
export interface ProofingComment {
  id: number;
  created_at: string;
  proofing_request_id: string;
  user_id: string | null;
  author_name: string;
  comment_text: string;
  metadata?: { x?: number; y?: number; timestamp?: number; assetIndex?: number };
}

/** Represents a single asset (e.g., an image, a page slug) within a proofing version. */
export interface ProofingAsset {
  url: string;
  price?: number;
  pricingStatus?: PricingStatus;
}

/** Represents a specific version of assets sent out for proofing. */
export interface ProofingVersion {
  version: number;
  assets: ProofingAsset[];
  notes: string;
  created_at: string;
}

/** Represents a full proofing request sent to a client. */
export interface ProofingRequest {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: ProofingStatus;
  client_id?: number | null;
  client_name?: string; // For display
  related_entity_type?: ProofingEntityType | null;
  related_entity_id?: string | null;
  versions?: ProofingVersion[]; 
  comments?: ProofingComment[]; // For display
}
