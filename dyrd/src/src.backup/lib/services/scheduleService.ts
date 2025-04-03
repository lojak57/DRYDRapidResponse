import type { ScheduleEntry, CreateScheduleEntryInput, UpdateScheduleEntryInput } from '$lib/types/ScheduleEntry';
import { setScheduleEntries, addScheduleEntry, updateScheduleEntryStore, removeScheduleEntryStore, scheduleEntries } from '$lib/stores/scheduleStore';
import { get } from 'svelte/store';
import scheduleEntriesData from '$lib/mock/scheduleEntries.json'; // Import mock data
import { generateId } from '$lib/utils/idUtils';

// Simulate API call delay
const API_DELAY = 50;

let loaded = false;

// Keep a local copy of the data for operations that modify it
let _scheduleEntries = [...scheduleEntriesData];

// Function to load schedule entries from mock data into the store
export async function loadScheduleEntries(): Promise<void> {
  // Prevent multiple loads
  if (loaded) {
    // console.log('Schedule entries already loaded.');
    return;
  }

  console.log('Loading schedule entries...');
  return new Promise((resolve) => {
    setTimeout(() => {
      const entriesToLoad: ScheduleEntry[] = JSON.parse(JSON.stringify(_scheduleEntries));
      setScheduleEntries(entriesToLoad);
      loaded = true;
      console.log(`Loaded ${entriesToLoad.length} schedule entries.`);
      resolve();
    }, API_DELAY);
  });
}

// Function to create a new schedule entry
export async function createScheduleEntry(input: CreateScheduleEntryInput): Promise<ScheduleEntry> {
  console.log('Creating schedule entry:', input);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create new entry, ensuring type safety for optional properties
      const newEntry: ScheduleEntry = {
        ...input,
        id: generateId('sched'), // Generate a unique ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update mock data (simulate backend update)
      _scheduleEntries.push(newEntry as any); // Use type assertion to avoid TS error

      // Update the store
      addScheduleEntry(newEntry);

      console.log('Schedule entry created:', newEntry);
      resolve(JSON.parse(JSON.stringify(newEntry))); // Return a deep copy
    }, API_DELAY);
  });
}

// Function to update an existing schedule entry
export async function updateScheduleEntry(id: string, input: UpdateScheduleEntryInput): Promise<ScheduleEntry | null> {
   console.log(`Updating schedule entry ${id}:`, input);
   return new Promise((resolve) => {
     setTimeout(() => {
       const currentEntries = get(scheduleEntries);
       const entryIndex = currentEntries.findIndex(e => e.id === id);

       if (entryIndex === -1) {
         console.error(`Schedule entry with id ${id} not found.`);
         return resolve(null);
       }

       const updatedEntry: ScheduleEntry = {
         ...currentEntries[entryIndex],
         ...input,
         updatedAt: new Date().toISOString(),
       };

       // Update mock data (simulate backend update)
       const mockIndex = _scheduleEntries.findIndex(e => e.id === id);
       if (mockIndex !== -1) {
            _scheduleEntries[mockIndex] = { 
              ..._scheduleEntries[mockIndex], 
              ...input, 
              updatedAt: updatedEntry.updatedAt 
            };
       }

       // Update the store
       updateScheduleEntryStore(updatedEntry);

       console.log('Schedule entry updated:', updatedEntry);
       resolve(JSON.parse(JSON.stringify(updatedEntry))); // Return a deep copy
     }, API_DELAY);
   });
}

// Function to delete a schedule entry
export async function deleteScheduleEntry(id: string): Promise<boolean> {
  console.log(`Deleting schedule entry ${id}`);
  return new Promise((resolve) => {
    setTimeout(() => {
       // Update mock data (simulate backend update)
       const initialLength = _scheduleEntries.length;
       _scheduleEntries = _scheduleEntries.filter(e => e.id !== id);
       const deleted = _scheduleEntries.length < initialLength;

       if(deleted) {
            // Update the store
            removeScheduleEntryStore(id);
            console.log(`Schedule entry ${id} deleted.`);
       } else {
            console.warn(`Schedule entry ${id} not found for deletion.`);
       }
       resolve(deleted);
    }, API_DELAY);
  });
} 