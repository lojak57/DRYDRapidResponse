<script lang="ts">
  import DailyScheduleView from '$lib/components/scheduling/DailyScheduleView.svelte';
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format } from 'date-fns';

  let isLoading = true;
  let errorMessage = '';
  let selectedDate = format(new Date(), 'yyyy-MM-dd');
  
  // Load all required data
  onMount(async () => {
    try {
      console.log("Loading all data for daily schedule view test...");
      
      await loadUsers();
      console.log("✓ Users loaded");
      
      await loadJobs();
      console.log("✓ Jobs loaded");
      
      await loadCustomers();
      console.log("✓ Customers loaded");
      
      await loadTrucks();
      console.log("✓ Trucks loaded");
      
      await loadScheduleEntries();
      console.log("✓ Schedule entries loaded");
      
      console.log("All data loaded successfully");
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error loading data';
    } finally {
      isLoading = false;
    }
  });

  function handlePrevDay() {
    console.log("Previous day clicked");
  }

  function handleNextDay() {
    console.log("Next day clicked");
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Daily Schedule View Test</h1>
  
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Error:</strong> {errorMessage}
    </div>
  {/if}
  
  {#if isLoading}
    <div class="flex items-center justify-center h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
      <div class="text-lg text-gray-500">Loading schedule data...</div>
    </div>
  {:else}
    <div class="mb-4">
      <p class="text-sm bg-yellow-100 p-2 rounded">
        Testing the DailyScheduleView component in isolation. Date: {selectedDate}
      </p>
    </div>
    
    <DailyScheduleView 
      displayDate={selectedDate}
      on:prevDay={handlePrevDay}
      on:nextDay={handleNextDay}
    />
  {/if}
  
  <div class="mt-4">
    <a href="/test/store-debug" class="text-blue-500 hover:underline">Go to Store Debug</a> | 
    <a href="/schedule" class="text-blue-500 hover:underline">Go to Schedule Page</a>
  </div>
</div> 