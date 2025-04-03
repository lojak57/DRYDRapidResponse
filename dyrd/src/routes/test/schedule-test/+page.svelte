<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format, startOfWeek } from 'date-fns';

  let isLoading = true;
  let errorMessage = '';
  let data = {
    users: [],
    jobs: [],
    customers: [],
    trucks: [],
    scheduleEntries: []
  };

  // Get current Monday for the week start date
  const today = new Date();
  const currentMonday = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  let weekStartDate = format(currentMonday, 'yyyy-MM-dd');

  // Load all necessary data
  onMount(async () => {
    try {
      isLoading = true;
      
      // Load data one by one to isolate issues
      console.log("Loading users...");
      await loadUsers();
      console.log("Users loaded");
      
      console.log("Loading jobs...");
      await loadJobs();
      console.log("Jobs loaded");
      
      console.log("Loading customers...");
      await loadCustomers();
      console.log("Customers loaded");
      
      console.log("Loading trucks...");
      await loadTrucks();
      console.log("Trucks loaded");
      
      console.log("Loading schedule entries...");
      await loadScheduleEntries();
      console.log("Schedule entries loaded");
      
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = `Failed to load scheduling data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="container p-6 mx-auto">
  <h1 class="text-2xl font-bold mb-4">Schedule Test Page</h1>
  
  {#if errorMessage}
    <div class="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {errorMessage}
    </div>
  {/if}
  
  {#if isLoading}
    <div class="flex items-center justify-center h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
      <div class="text-lg text-gray-500">Loading data...</div>
    </div>
  {:else}
    <div class="bg-white p-4 rounded shadow">
      <p>Data loaded successfully!</p>
      <p>Week start date: {weekStartDate}</p>
      
      <div class="mt-4">
        <a href="/schedule" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Schedule Page
        </a>
      </div>
    </div>
  {/if}
</div> 