// Case Manager Type Definitions
export type CaseStatus = 'Intake' | 'Open' | 'Stayed' | 'Settled' | 'Closed' | 'Archived';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Todo' | 'In Progress' | 'Blocked' | 'Done' | 'Canceled';
export type DocketStatus = 'Scheduled' | 'Submitted' | 'Entered' | 'Completed' | 'Canceled' | 'Overdue';
export type DocketType = 'Filing' | 'Order' | 'Hearing' | 'Deadline' | 'Conference' | 'Trial' | 'Other';
export type PartyRole = 'Client' | 'Opposing' | 'Witness' | 'Expert' | 'Other';
export type TeamRole = 'Attorney' | 'Paralegal' | 'Billing' | 'Viewer';
export type TimeStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Billed';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Void';
export type OCRStatus = 'Not Requested' | 'Queued' | 'Done' | 'Failed';
export type CustodyAction = 'Received' | 'Transferred' | 'Logged' | 'Returned';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CaseRow {
  id: string; // "CASE-2025-000317"
  title: string;
  caseType: string; // "Criminal", "Family", etc.
  jurisdiction?: string; // "FL - Leon County"
  court?: string; // "2nd Judicial Circuit"
  leadAttorneyId?: string;
  leadAttorneyName?: string;
  clientId: string;
  clientName: string;
  status: CaseStatus;
  stage?: string; // "Discovery", "Pre-Trial"
  openedAt: string; // ISO
  nextEventAt?: string; // ISO
  updatedAt: string; // ISO
  tags: string[];
}

export interface TeamMember {
  userId: string;
  name: string;
  role: TeamRole;
}

export interface Party {
  id: string;
  role: PartyRole;
  contactId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  notes?: string;
}

export interface DocketItem {
  id: string;
  caseId: string;
  type: DocketType;
  title: string;
  dateTime?: string; // ISO for scheduled events
  dueDate?: string; // ISO for deadlines
  status: DocketStatus;
  relatedDocs: string[]; // file ids
  createdAt: string;
  updatedAt: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  assigneeName?: string;
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  checklist?: { id: string; label: string; done: boolean }[];
  notes?: string;
  watchers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseTaskSummary extends CaseTask {}

export interface Redaction {
  page: number;
  rects: { x: number; y: number; width: number; height: number }[];
  reason?: string;
}

export interface FileItem {
  id: string;
  caseId: string;
  name: string;
  size: number;
  mime: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  ocrStatus: OCRStatus;
  piiRedactions?: Redaction[];
  previewUrl?: string;
}

export interface CustodyEvent {
  timestamp: string;
  user: string;
  action: CustodyAction;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  exhibitNo?: string;
  title: string;
  source: string;
  collectedAt?: string;
  chainOfCustody: CustodyEvent[];
  fileId?: string;
  notes?: string;
  tags: string[];
}

// Document management
export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  status: 'Active' | 'Archived' | 'Deleted';
  isEvidence: boolean;
  confidential: boolean;
  folderId: string | null;
  pages?: number;
  checksum: string;
  ocrCompleted?: boolean;
  ocrText?: string;
  version: number;
  versionHistory: DocumentVersion[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
  sizeBytes: number;
}

export interface DocumentFolder {
  id: string;
  caseId: string;
  name: string;
  description?: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
  color?: string;
}

export interface TimeEntry {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  description: string;
  status: TimeStatus;
}

export interface InvoiceItem {
  type: 'Time' | 'Expense' | 'Fixed';
  refId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  caseId: string;
  number: string;
  periodFrom: string;
  periodTo: string;
  items: InvoiceItem[];
  subtotal: number;
  taxes: number;
  discounts: number;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface CaseEvent {
  timestamp: string;
  user: string;
  description: string;
}

export interface CaseFinancials {
  billed: number;
  paid: number;
  outstanding: number;
  trustBalance?: number;
  currency: 'USD';
}

export interface CaseDetail extends CaseRow {
  description?: string;
  team: TeamMember[];
  parties: Party[];
  docket: DocketItem[];
  tasks: CaseTaskSummary[];
  financials: CaseFinancials;
  confidentiality: { piiMasked: boolean; restricted: boolean };
  history: CaseEvent[];
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  role?: PartyRole;
  caseCount: number;
  lastActivity?: string;
  notes?: string;
}

// Permissions System
export const CASE_PERMISSIONS = {
  Administrator: [
    'create_case', 'edit_case', 'close_case', 'delete_case',
    'manage_parties', 'manage_tasks', 'manage_deadlines', 'file_docket',
    'upload_documents', 'approve_ocr', 'manage_evidence',
    'log_time', 'approve_time', 'invoice', 'refund',
    'view_financials', 'view_analytics', 'manage_settings'
  ],
  Attorney: [
    'create_case', 'edit_case', 'close_case',
    'manage_parties', 'manage_tasks', 'manage_deadlines', 'file_docket',
    'upload_documents', 'request_ocr', 'manage_evidence',
    'log_time', 'approve_time', 'invoice',
    'view_financials', 'view_analytics'
  ],
  Paralegal: [
    'edit_case', 'manage_parties', 'manage_tasks', 'manage_deadlines',
    'file_docket', 'upload_documents', 'request_ocr', 'manage_evidence',
    'log_time'
  ],
  Intake: [
    'create_case', 'edit_case_intake', 'manage_parties', 'upload_documents'
  ],
  Billing: [
    'view_financials', 'invoice', 'refund', 'approve_time'
  ],
  Viewer: [
    'view_case', 'view_documents', 'view_docket'
  ]
} as const;

export type Permission = typeof CASE_PERMISSIONS[keyof typeof CASE_PERMISSIONS][number];
export type UserRole = keyof typeof CASE_PERMISSIONS;

// Badge Color Mappings
export const STATUS_COLORS = {
  case: {
    Open: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    Intake: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300',
    Stayed: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
    Settled: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300',
    Closed: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300',
    Archived: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  },
  task: {
    Todo: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
    'In Progress': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    Blocked: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    Done: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    Canceled: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
  },
  docket: {
    Scheduled: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
    Submitted: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300',
    Entered: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300',
    Completed: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    Overdue: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    Canceled: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
  },
  billing: {
    Paid: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    Partial: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
    Draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    Sent: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    Void: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300'
  },
  priority: {
    Low: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    Medium: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
    High: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
    Urgent: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
  },
  document: {
    Active: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    Archived: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    Deleted: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    'Medical Records': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    'Legal Documents': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    'Correspondence': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    'Financial': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
    'Evidence': 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
    'Other': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
  }
} as const;
