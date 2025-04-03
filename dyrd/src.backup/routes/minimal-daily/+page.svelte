<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format, parseISO } from 'date-fns';
  import { get } from 'svelte/store';
  import { users as userStore } from '$lib/stores/userStore';
  import { scheduleEntries as scheduleStore } from '$lib/stores/scheduleStore';
  import { Role } from '$lib/types/User';
  
  let isLoading = true;
  let errorMessage = '';
  let technicians = [];
  let selectedDate = format(new Date(), 'yyyy-MM-dd');
  
  // Load required data
  onMount(async () => {
    try {
      console.log("Loading data...");
      await loadUsers();
      await loadJobs();
      await loadCustomers();
      await loadTrucks();
      await loadScheduleEntries();
      
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
  <h1 class="text-2xl font-bold mb-4">Minimal Daily Schedule</h1>
  
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
      <p>Date: {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</p>
      <p>Number of Technicians: {technicians.length}</p>
    </div>
    
    <div class="border rounded">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="border p-2 w-1/4">Technician</th>
            <th class="border p-2">Schedule for {format(parseISO(selectedDate), 'MMM d, yyyy')}</th>
          </tr>
        </thead>
        <tbody>
          {#each technicians as tech}
            <tr>
              <td class="border p-2">{tech.firstName} {tech.lastName}</td>
              <td class="border p-2 h-[80px]"></td>
            </tr>
          {:else}
            <tr>
              <td colspan="2" class="border p-2 text-center">No technicians found</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  
  <div class="mt-4">
    <a href="/test/store-debug" class="text-blue-500 hover:underline mr-4">Go to Store Debug</a>
    <a href="/minimal-weekly" class="text-blue-500 hover:underline">Go to Minimal Weekly View</a>
  </div>
</div> 