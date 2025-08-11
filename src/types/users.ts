/**
 * @file Contains type definitions for user management system including customers, staff, and permissions.
 */

/** The role of a user in the system. */
export type UserRole = 'owner' | 'staff' | 'customer';

/** The status of a user account. */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/** Base user interface */
export interface BaseUser {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  company_id: string;
  last_login?: string;
}

/** Staff user with additional permissions */
export interface StaffUser extends BaseUser {
  role: 'staff' | 'owner';
  permissions: UserPermission[];
  invited_by?: string;
  invited_at?: string;
  department?: string;
  title?: string;
}

/** Customer user for portal access */
export interface CustomerUser extends BaseUser {
  role: 'customer';
  phone?: string;
  address?: string;
  total_orders?: number;
  total_spent?: number;
  preferred_contact_method?: 'email' | 'phone' | 'sms';
  notes?: string;
}

/** User permissions for staff */
export type UserPermission = 
  | 'view_orders'
  | 'manage_orders'
  | 'view_customers'
  | 'manage_customers'
  | 'view_products'
  | 'manage_products'
  | 'view_bookings'
  | 'manage_bookings'
  | 'view_contacts'
  | 'manage_contacts'
  | 'view_proofing'
  | 'manage_proofing'
  | 'view_analytics'
  | 'manage_staff'
  | 'manage_company_settings';

/** Staff invitation */
export interface StaffInvitation {
  id: string;
  email: string;
  name: string;
  role: 'staff';
  permissions: UserPermission[];
  invited_by: string;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  company_id: string;
}

/** Customer portal session */
export interface CustomerSession {
  id: string;
  customer_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}

/** Customer portal preferences */
export interface CustomerPortalSettings {
  id: string;
  company_id: string;
  allow_order_history: boolean;
  allow_profile_edit: boolean;
  allow_support_tickets: boolean;
  allow_file_downloads: boolean;
  custom_branding: boolean;
  welcome_message?: string;
  support_email?: string;
  support_phone?: string;
}

/** Support ticket for customer portal */
export interface SupportTicket {
  id: string;
  customer_id: string;
  company_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  internal_notes?: string;
  attachments?: string[];
}
