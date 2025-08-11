/**
 * @file Contains type definitions for the Task Management system.
 */

/** The status of a task. */
export type TaskStatus = 'To-Do' | 'In Progress' | 'Done' | 'On Hold';
/** The priority level of a task. */
export type TaskPriority = 'Low' | 'Medium' | 'High';

/** Represents a single sub-task within a main task. */
export interface TaskSubtask {
  id: string;
  text: string;
  completed: boolean;
}

/** Represents a task in the system. */
export interface Task {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string | null; // team_member_id
  assigned_to_name?: string | null; // For display
  is_prompt_mode?: boolean;
  prompt?: string | null;
  subtasks?: TaskSubtask[] | null;
  
  // Linkable entities
  page_id?: string | null;
  order_id?: number | null;
  booking_id?: string | null;
  proofing_request_id?: string | null;
  contact_id?: number | null;
  product_id?: string | null;
  seo_report_id?: string | null;
  page_group_id?: string | null;

  // Display names for linked entities
  page_name?: string;
  order_identifier?: string;
  booking_identifier?: string;
  proofing_request_title?: string;
  contact_name?: string;
  product_name?: string;
  seo_report_name?: string;
  page_group_name?: string;
}
