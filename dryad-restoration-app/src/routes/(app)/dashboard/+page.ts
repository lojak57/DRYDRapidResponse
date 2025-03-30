import { loadJobs } from '$lib/stores/jobStore';

/** @type {import('./$types').PageLoad} */
export async function load() {
  // Reload jobs data whenever the dashboard is loaded
  await loadJobs();
  
  return {
    // Return an empty object, as we're using stores directly in the component
  };
} 