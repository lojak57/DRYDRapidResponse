import { writable, derived, get } from 'svelte/store';
import type { Truck } from '$lib/types/Truck';
import { TruckStatus } from '$lib/types/Truck';
import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
import { scheduleEntries } from '$lib/stores/scheduleStore';

// Internal writable store
const _trucks = writable<Truck[]>([]);

// Public readable store
export const trucks = derived(_trucks, ($_trucks) => $_trucks);

// Function to set trucks (used by service)
export function setTrucks(truckData: Truck[]) {
  _trucks.set(truckData);
}

// Derived store to find available trucks for a specific date
// Returns a function that takes a date and returns available trucks
export const availableTrucksByDate = derived(
  [trucks, scheduleEntries],
  ([$trucks, $scheduleEntries]) => (date: string): Truck[] => {
    if (!date) return []; // Return empty if no date provided

    // Get IDs of trucks scheduled on the given date
    const scheduledTruckIds = $scheduleEntries
      .filter((entry: ScheduleEntry) => entry.date === date && entry.truckId)
      .map((entry: ScheduleEntry) => entry.truckId);

    // Filter the main truck list
    return $trucks.filter((truck: Truck) =>
      truck.status === TruckStatus.AVAILABLE && // Only consider generally available trucks
      !scheduledTruckIds.includes(truck.id)
    );
  }
);

// Helper function to get truck by ID (optional but useful)
export function getTruckById(id: string): Truck | undefined {
    return get(_trucks).find(t => t.id === id);
} 