import type { EquipmentLogData } from './Equipment';

/**
 * Types of log entries that can be recorded for a job
 */
export enum LogEntryType {
  NOTE = 'NOTE',
  PHOTO = 'PHOTO',
  MOISTURE_READING = 'MOISTURE_READING',
  EQUIPMENT_PLACEMENT = 'EQUIPMENT_PLACEMENT',
  EQUIPMENT_REMOVAL = 'EQUIPMENT_REMOVAL',
  TEMPERATURE_READING = 'TEMPERATURE_READING',
  HUMIDITY_READING = 'HUMIDITY_READING',
  SIGNATURE = 'SIGNATURE',
  CHECKLIST = 'CHECKLIST',
  TASK_COMPLETION = 'TASK_COMPLETION'
}

/**
 * Data for moisture reading log entries
 */
export interface MoistureReadingData {
  /** Location where the reading was taken */
  location: string;
  /** Type of material that was measured */
  material: string;
  /** Moisture percentage value */
  value: number;
  /** Optional reference or photo ID */
  referenceId?: string;
}

/**
 * Data for equipment placement log entries
 */
export interface EquipmentPlacementData {
  /** ID of the equipment placed */
  equipmentId: string;
  /** Location description where equipment was placed */
  location: string;
  /** Equipment-specific settings */
  settings?: Record<string, any>;
}

/**
 * Data for photo log entries
 */
export interface PhotoData {
  /** URL or path to the photo */
  url: string;
  /** Optional caption */
  caption?: string;
  /** Tags applied to the photo */
  tags?: string[];
}

/**
 * Data for signature log entries
 */
export interface SignatureData {
  /** URL or path to the signature image */
  imageUrl: string;
  /** Name of the person who signed */
  name: string;
  /** Role or relationship of the signer (customer, technician, etc.) */
  role: string;
}

/**
 * Represents a log entry for a job
 */
export interface LogEntry {
  /** Unique identifier for the log entry */
  id: string;
  /** ID of the job this log entry belongs to */
  jobId: string;
  /** ID of the user who created this log entry */
  userId: string;
  /** When the log entry was created */
  timestamp: Date;
  /** Type of log entry */
  type: LogEntryType;
  /** Content of the log entry, varies by type */
  content: string | MoistureReadingData | EquipmentPlacementData | EquipmentLogData | PhotoData | SignatureData | Record<string, any>;
  /** Geolocation where the log entry was created */
  location?: {
    latitude: number;
    longitude: number;
  };
  /** Whether this log entry has been synced to the server */
  synced: boolean;
} 