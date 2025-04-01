import type { Address } from './Customer';

/**
 * Represents the current status of a job
 */
export enum JobStatus {
  NEW = 'NEW',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  PENDING_COMPLETION = 'PENDING_COMPLETION',
  COMPLETED = 'COMPLETED',
  INVOICE_APPROVAL = 'INVOICE_APPROVAL',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

/**
 * Represents the type of damage/restoration
 */
export enum JobType {
  WATER = 'WATER',
  FIRE = 'FIRE',
  MOLD = 'MOLD',
  SMOKE = 'SMOKE',
  STORM = 'STORM',
  OTHER = 'OTHER'
}

/**
 * Represents insurance information for a job
 */
export interface InsuranceInfo {
  /** Name of the insurance company */
  company: string;
  /** Insurance policy number */
  policyNumber: string;
  /** Insurance claim number */
  claimNumber: string;
  /** Insurance adjustor's name */
  adjustorName?: string;
  /** Insurance adjustor's phone number */
  adjustorPhone?: string;
  /** Insurance adjustor's email */
  adjustorEmail?: string;
  /** Whether the job is an insurance claim */
  isInsuranceClaim: boolean;
  /** Deductible amount in dollars */
  deductible?: number;
}

/**
 * Represents the completion tasks that must be done before a job can be marked as complete
 */
export interface CompletionTasks {
  /** Flag indicating that final moisture readings have been logged */
  finalReadingsLogged: boolean;
  /** Flag indicating that after photos have been taken */
  afterPhotosTaken: boolean;
  /** Flag indicating that the job has been submitted for office review */
  mark_ready_for_review: boolean;
}

/**
 * Represents a restoration job
 */
export interface Job {
  /** Unique identifier for the job */
  id: string;
  /** Reference number for the job */
  jobNumber: string;
  /** Current status of the job */
  status: JobStatus;
  /** Type of damage/restoration */
  jobType: JobType;
  /** Title or brief description of the job */
  title: string;
  /** Detailed description of the job */
  description: string;
  /** Date and time the incident occurred */
  incidentDate?: Date;
  /** Date the job was created */
  createdAt: Date;
  /** Date when work is scheduled to start */
  scheduledStartDate?: Date;
  /** Date when the job is expected to be completed */
  estimatedCompletionDate?: Date;
  /** Date when the job was actually completed */
  completedDate?: Date;
  /** ID of the customer associated with the job */
  customerId: string;
  /** Address where the work is being performed */
  siteAddress: Address;
  /** Insurance information for the job */
  insuranceInfo?: InsuranceInfo;
  /** IDs of users assigned to this job */
  assignedUserIds: string[];
  /** IDs of equipment assigned to this job */
  equipmentIds: string[];
  /** Priority level of the job (1-5, where 5 is highest) */
  priority: number;
  /** Total estimated cost of the job */
  estimatedCost?: number;
  /** Special access instructions for the site */
  accessInstructions?: string;
  /** Tags for categorizing the job */
  tags?: string[];
  /** ID of the quote this job was created from */
  originatingQuoteId?: string | null;
  /** ID of the office user or admin who owns the account */
  accountOwnerId?: string;
  /** Optional tasks that must be completed before job can be marked complete */
  completionTasks?: CompletionTasks;
  /** Flag indicating that "before" photos have been taken for the job */
  hasBeforePhotos?: boolean;
} 