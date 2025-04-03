<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format, startOfWeek, eachDayOfInterval, endOfWeek, parseISO } from 'date-fns';
  import { derived, get } from 'svelte/store';
  import { users as userStore } from '$lib/stores/userStore';
  import { scheduleEntries as scheduleStore } from '$lib/stores/scheduleStore';
  import { Role } from '$lib/types/User';
  
  let isLoading = true;
  let errorMessage = '';
  let weekDates = [];
  let technicians = [];
  
  // Get current week start (Monday)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  let weekStartDate = format(weekStart, 'yyyy-MM-dd');
  
  // Load required data
  onMount(async () => {
    try {
      console.log("Loading data...");
      await loadUsers();
      await loadJobs();
      await loadCustomers();
      await loadTrucks();
      await loadScheduleEntries();
      
      // Calculate week dates
      try {
        const start = parseISO(weekStartDate);
        const weekStart = startOfWeek(start, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });
      } catch (e) {
        console.error("Error calculating week dates:", e);
      }
      
      // Get technicians
      try {
        technicians = get(userStore).filter(user => user.role === Role.TECH);
      } catch (e) {
        console.error("Error getting technicians:", e);
      }
      
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Minimal Weekly Schedule</h1>
  
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Error:</strong> {errorMessage}
    </div>
  {/if}
  
  {#if isLoading}
    <div class="flex items-center justify-center h-64 bg-white border border-gray-200 rounded">
      <div class="text-lg text-gray-500">Loading data...</div>
    </div>
  {:else}
    <div class="mb-4 bg-green-100 p-3 rounded">
      <p>Data loaded successfully!</p>
      <p>Week Starting: {weekStartDate}</p>
      <p>Number of Days: {weekDates.length}</p>
      <p>Number of Technicians: {technicians.length}</p>
    </div>
    
    <div class="border rounded overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="border p-2">Technician</th>
            {#each weekDates as date}
              <th class="border p-2">{format(date, 'EEE, MMM d')}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each technicians as tech}
            <tr>
              <td class="border p-2">{tech.firstName} {tech.lastName}</td>
              {#each weekDates as date}
                <td class="border p-2 min-w-[100px] h-[80px]"></td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  
  <div class="mt-4">
    <a href="/test/store-debug" class="text-blue-500 hover:underline mr-4">Go to Store Debug</a>
    <a href="/load-test" class="text-blue-500 hover:underline">Go to Load Test</a>
  </div>
</div> 