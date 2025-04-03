<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  
  // Import stores to verify they're accessible
  import { scheduleEntries } from '$lib/stores/scheduleStore';
  import { trucks } from '$lib/stores/truckStore';
  import { users } from '$lib/stores/userStore';
  
  let isLoading = true;
  let errorMessage = '';
  let loadingSteps = [];
  let storeValues = {
    users: 0,
    trucks: 0,
    scheduleEntries: 0
  };
  
  // Subscribe to stores to verify data is loaded
  const unsubUsers = users.subscribe(val => {
    storeValues.users = val.length;
  });
  
  const unsubTrucks = trucks.subscribe(val => {
    storeValues.trucks = val.length;
  });
  
  const unsubSchedule = scheduleEntries.subscribe(val => {
    storeValues.scheduleEntries = val.length;
  });
  
  onMount(() => {
    loadAllData();
    return () => {
      unsubUsers();
      unsubTrucks();
      unsubSchedule();
    };
  });
  
  async function loadAllData() {
    try {
      isLoading = true;
      loadingSteps = [];
      
      // Load one at a time to see where any error might occur
      loadingSteps.push("Loading users...");
      await loadUsers();
      loadingSteps.push("✓ Users loaded");
      
      loadingSteps.push("Loading jobs...");
      await loadJobs();
      loadingSteps.push("✓ Jobs loaded");
      
      loadingSteps.push("Loading customers...");
      await loadCustomers();
      loadingSteps.push("✓ Customers loaded");
      
      loadingSteps.push("Loading trucks...");
      await loadTrucks();
      loadingSteps.push("✓ Trucks loaded");
      
      loadingSteps.push("Loading schedule entries...");
      await loadScheduleEntries();
      loadingSteps.push("✓ Schedule entries loaded");
      
      loadingSteps.push("✅ ALL DATA LOADED SUCCESSFULLY");
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error loading data';
      loadingSteps.push(`❌ ERROR: ${errorMessage}`);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Data Loading Test</h1>
  
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Error:</strong> {errorMessage}
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div class="border p-4 rounded shadow">
      <h2 class="font-bold mb-2">Loading Steps</h2>
      <div class="bg-gray-100 p-3 rounded min-h-[200px]">
        {#each loadingSteps as step}
          <div class="mb-1">{step}</div>
        {/each}
        
        {#if isLoading}
          <div class="text-blue-500">Loading...</div>
        {/if}
      </div>
    </div>
    
    <div class="border p-4 rounded shadow">
      <h2 class="font-bold mb-2">Store Data</h2>
      <div class="bg-gray-100 p-3 rounded">
        <div class="mb-1">Users: {storeValues.users}</div>
        <div class="mb-1">Trucks: {storeValues.trucks}</div>
        <div class="mb-1">Schedule Entries: {storeValues.scheduleEntries}</div>
      </div>
      
      <button 
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        on:click={loadAllData}
      >
        Reload Data
      </button>
    </div>
  </div>
  
  <div class="mt-4">
    <a href="/test/store-debug" class="text-blue-500 hover:underline mr-4">Go to Store Debug</a>
    <a href="/simple-test" class="text-blue-500 hover:underline">Go to Simple Test</a>
  </div>
</div> 