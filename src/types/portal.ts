/**
 * @file Contains type definitions for the Portals feature.
 */

/** Defines the type of portal. */
export type PortalType = 'Owners' | 'Owners Staff' | 'Customer';

/** Represents a portal instance. */
export interface Portal {
  id: string;
  user_id: string; // The app user who owns this portal
  created_at: string;
  name: string;
  type: PortalType;
  page_id?: string | null;
  settings?: any; // JSONB for future settings
}
