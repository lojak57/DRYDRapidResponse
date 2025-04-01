import { loadJobs } from '$lib/stores/jobStore';
import { browser } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export async function load() {
  console.log('Dashboard loading at', new Date().toISOString());
  
  // Reload jobs data whenever the dashboard is loaded
  await loadJobs();
  
  // Force a reload of data every 30 seconds when in browser
  // This ensures the data stays fresh even if the user leaves the tab open
  if (browser) {
    console.log('Forcing reload of dashboard data');
    
    // Clear any cached data for this page
    sessionStorage.removeItem('dashboard_data');
    localStorage.removeItem('dashboard_data');
    
    // Schedule regular data refreshes when page is open
    const intervalId = setInterval(async () => {
      console.log('Auto-refreshing job data at', new Date().toISOString());
      await loadJobs();
    }, 30000); // 30 seconds
    
    // Clean up interval on page navigation
    return {
      destroy() {
        clearInterval(intervalId);
      }
    };
  }
  
  return {
    // Return an empty object, as we're using stores directly in the component
  };
} 