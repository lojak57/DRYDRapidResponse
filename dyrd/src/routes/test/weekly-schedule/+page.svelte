<script lang="ts">
  import WeeklyScheduleView from '$lib/components/scheduling/WeeklyScheduleView.svelte';
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format, startOfWeek } from 'date-fns';

  let isLoading = true;
  let errorMessage = '';
  
  // Get current week start (Monday)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  let weekStartDate = format(weekStart, 'yyyy-MM-dd');
  
  // Load all required data
  onMount(async () => {
    try {
      console.log("Loading all data for weekly schedule view test...");
      
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

  function handlePrevWeek() {
    console.log("Previous week clicked");
  }

  function handleNextWeek() {
    console.log("Next week clicked");
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Weekly Schedule View Test</h1>
  
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
        Testing the WeeklyScheduleView component in isolation. Week starting: {weekStartDate}
      </p>
    </div>
    
    <WeeklyScheduleView 
      weekStartDate={weekStartDate}
      on:prevWeek={handlePrevWeek}
      on:nextWeek={handleNextWeek}
    />
  {/if}
  
  <div class="mt-4">
    <a href="/test/store-debug" class="text-blue-500 hover:underline">Go to Store Debug</a> | 
    <a href="/test/daily-schedule" class="text-blue-500 hover:underline">Go to Daily Schedule Test</a> | 
    <a href="/schedule" class="text-blue-500 hover:underline">Go to Schedule Page</a>
  </div>
</div> 