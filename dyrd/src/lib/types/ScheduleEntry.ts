import type { Job } from './Job';
import type { User } from './User';
import type { Truck } from './Truck';

export interface ScheduleEntry {
  id: string;
  jobId: string;
  userId: string; // Technician ID
  truckId?: string; // Optional assigned truck ID
  date: string; // YYYY-MM-DD format (for daily assignment)
  // Optional: Add startTime/endTime later if needed for intra-day scheduling
  // startTime?: string; // HH:MM
  // endTime?: string; // HH:MM
  notes?: string; // Any scheduling specific notes
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID of the user who created the entry
}

// Input types for creation/updates
export type CreateScheduleEntryInput = Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateScheduleEntryInput = Partial<Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>; // Cannot update createdBy 