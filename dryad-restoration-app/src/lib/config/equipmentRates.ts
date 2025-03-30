/**
 * Daily rental rates for each equipment type
 * These rates are in dollars per day
 */
export const EQUIPMENT_DAILY_RATES: { [equipmentType: string]: number } = {
  // Air Movers
  'AIR_MOVER': 25,
  
  // Dehumidifiers
  'DEHUMIDIFIER': 65,
  
  // Air Scrubbers
  'AIR_SCRUBBER': 60,
  
  // HEPA Filters
  'HEPA_FILTER': 45,
  
  // Measurement tools
  'MOISTURE_METER': 15,
  'THERMAL_IMAGING_CAMERA': 85,
  
  // Treatment equipment
  'OZONE_GENERATOR': 75,
  
  // Climate control
  'HEATER': 40,
  
  // Misc equipment
  'OTHER': 20
}; 