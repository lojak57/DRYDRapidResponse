import { writable, derived, get } from 'svelte/store';
import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
import { users as userStore } from './userStore'; // Import user store for technician filtering
import { Role } from '$lib/types/User';

// Internal writable store
const _scheduleEntries = writable<ScheduleEntry[]>([]);

// Public readable store
export const scheduleEntries = derived(_scheduleEntries, ($_scheduleEntries) => $_scheduleEntries);

// Function to set schedule entries (used by service)
export function setScheduleEntries(entries: ScheduleEntry[]) {
  _scheduleEntries.set(entries);
}

// Function to add a single schedule entry (used by service)
export function addScheduleEntry(entry: ScheduleEntry) {
    _scheduleEntries.update(entries => [...entries, entry]);
}

// Function to update a single schedule entry (used by service)
export function updateScheduleEntryStore(updatedEntry: ScheduleEntry) {
    _scheduleEntries.update(entries => entries.map(entry =>
        entry.id === updatedEntry.id ? updatedEntry : entry
    ));
}

// Function to remove a single schedule entry (used by service)
export function removeScheduleEntryStore(id: string) {
    _scheduleEntries.update(entries => entries.filter(entry => entry.id !== id));
}

// Derived Store 1: Group entries by date
export const scheduleByDate = derived(scheduleEntries, ($scheduleEntries) => {
  return $scheduleEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as { [date: string]: ScheduleEntry[] });
});

// Derived Store 2: Group entries by Technician ID and then by Date (assuming one job per tech per day)
export const scheduleByTechnicianAndDate = derived(scheduleEntries, ($scheduleEntries) => {
    const result = $scheduleEntries.reduce((acc, entry) => {
        if (!acc[entry.userId]) {
            acc[entry.userId] = {};
        }
        // This assumes one entry per tech per date. If multiple are possible, this needs adjustment.
        acc[entry.userId][entry.date] = entry;
        return acc;
    }, {} as { [techId: string]: { [date: string]: ScheduleEntry } });
    
    console.log("Created scheduleByTechnicianAndDate:", result);
    return result;
});

// Helper function to get schedule entry by ID (optional)
export function getScheduleEntryById(id: string): ScheduleEntry | undefined {
    return get(_scheduleEntries).find(e => e.id === id);
} 