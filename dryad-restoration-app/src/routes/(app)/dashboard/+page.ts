import { loadJobs } from '$lib/stores/jobStore';
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load() {
  console.log('Dashboard loading at', new Date().toISOString());
  
  // Reload jobs data whenever the dashboard is loaded
  await loadJobs();
  
  // If in browser, force a clean reload
  if (browser) {
    console.log('Forcing reload of dashboard data');
    
    // Clear any cached data for this page
    sessionStorage.removeItem('dashboard_data');
    localStorage.removeItem('dashboard_data');
  }
  
  return {
    // Return an empty object, as we're using stores directly in the component
  };
} 