/**
 * Represents the status of equipment
 */
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  DEPLOYED = 'DEPLOYED',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

/**
 * Represents equipment types available for jobs
 */
export enum EquipmentType {
  AIR_MOVER = 'AIR_MOVER',
  DEHUMIDIFIER = 'DEHUMIDIFIER',
  AIR_SCRUBBER = 'AIR_SCRUBBER',
  HEPA_FILTER = 'HEPA_FILTER',
  MOISTURE_METER = 'MOISTURE_METER',
  THERMAL_IMAGING_CAMERA = 'THERMAL_IMAGING_CAMERA',
  OZONE_GENERATOR = 'OZONE_GENERATOR',
  HEATER = 'HEATER',
  OTHER = 'OTHER'
}

/**
 * Represents a piece of equipment in the inventory
 */
export interface Equipment {
  /** Unique identifier for the equipment */
  id: string;
  /** Type of equipment */
  type: EquipmentType;
  /** Model number or name */
  model: string;
  /** Serial number of the equipment */
  serialNumber: string;
  /** Current status of the equipment */
  status: EquipmentStatus;
  /** Current job ID if the equipment is deployed */
  currentJobId?: string | null;
  /** Date when the equipment was purchased */
  purchaseDate?: Date;
  /** Date of last maintenance */
  lastMaintenanceDate?: Date;
  /** Notes about the equipment */
  notes?: string;
  /** Current location where the equipment is stored when not in use */
  storageLocation?: string;
}

/**
 * Represents equipment log data for placement and removal activities
 */
export interface EquipmentLogData {
  /** Whether the equipment is being placed or removed */
  action: 'placement' | 'removal';
  /** ID of the equipment */
  equipmentId: string;
  /** Type of equipment (denormalized for easier display) */
  equipmentType: string;
  /** Equipment model */
  equipmentModel: string;
  /** Equipment serial number (optional) */
  equipmentSerialNumber?: string;
  /** Location where equipment was placed (relevant for placement) */
  location?: string;
  /** Settings applied to the equipment (relevant for placement) */
  settings?: Record<string, any>;
  /** Notes about the placement or removal */
  notes?: string;
} 