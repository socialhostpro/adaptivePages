/**
 * @file Contains type definitions related to Customer Relationship Management (CRM), including contacts and forms.
 */

/** The status of a contact in the CRM pipeline. */
export type CrmContactStatus = 'Contact' | 'Lead' | 'Opportunity' | 'Customer';

/** Represents a contact in the CRM system. */
export interface CrmContact {
  id: number;
  created_at: string;
  page_id: string | null;
  owner_id: string;
  name: string | null;
  email: string | null;
  status: CrmContactStatus;
  source: string | null;
  notes: string | null;
}

/** Represents a single field within a custom form. */
export interface CrmFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'tel';
  required: boolean;
}

/** Represents a custom form created in the form builder. */
export interface CrmForm {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  fields: CrmFormField[];
}
