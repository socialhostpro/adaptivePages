/**
 * @file Contains type definitions for team management features.
 */

/** Defines the role of a team member. */
export type TeamRole = 'Admin' | 'Member' | 'Viewer';

/** Represents a team member in the system. */
export interface TeamMember {
  id: string;
  user_id: string; // The owner of the account this member belongs to
  created_at: string;
  name: string;
  email: string;
  role: TeamRole;
}
