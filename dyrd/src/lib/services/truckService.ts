import type { Truck } from '$lib/types/Truck';
import { setTrucks } from '$lib/stores/truckStore';
import trucksData from '$lib/mock/trucks.json'; // Import mock data

// Simulate API call delay
const API_DELAY = 50;

let loaded = false;

// Function to load trucks from mock data into the store
export async function loadTrucks(): Promise<void> {
  // Prevent multiple loads
  if (loaded) {
    // console.log('Trucks already loaded.');
    return;
  }

  console.log('Loading trucks...');
  return new Promise((resolve) => {
    setTimeout(() => {
      // Deep copy mock data to prevent mutations affecting the source
      const trucksToLoad: Truck[] = JSON.parse(JSON.stringify(trucksData));
      setTrucks(trucksToLoad);
      loaded = true;
      console.log(`Loaded ${trucksToLoad.length} trucks.`);
      resolve();
    }, API_DELAY);
  });
}

// Placeholder for future CRUD operations if needed
// export async function createTruck(truckData: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Truck> { ... }
// export async function updateTruck(id: string, updateData: Partial<Truck>): Promise<Truck | null> { ... }
// export async function deleteTruck(id: string): Promise<boolean> { ... } 