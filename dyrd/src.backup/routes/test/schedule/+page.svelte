<script lang="ts">
  import DailyScheduleView from '$lib/components/scheduling/DailyScheduleView.svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { onMount } from 'svelte';
  
  let displayDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  let loading = true;
  
  // Load data when the component mounts
  onMount(async () => {
    try {
      await Promise.all([
        loadUsers(),
        loadJobs(),
        loadCustomers(),
        loadScheduleEntries(),
        loadTrucks()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      loading = false;
    }
  });
  
  // Function to change the displayed date
  function changeDate(offset: number) {
    const date = new Date(displayDate);
    date.setDate(date.getDate() + offset);
    displayDate = date.toISOString().split('T')[0];
  }
</script>

<div class="container p-4 mx-auto">
  <h1 class="text-2xl font-bold mb-4">Daily Schedule View Test</h1>
  
  <div class="flex items-center space-x-4 mb-6">
    <button class="px-4 py-2 bg-blue-600 text-white rounded" on:click={() => changeDate(-1)}>
      Previous Day
    </button>
    
    <div class="text-lg font-medium">
      {displayDate}
    </div>
    
    <button class="px-4 py-2 bg-blue-600 text-white rounded" on:click={() => changeDate(1)}>
      Next Day
    </button>
  </div>
  
  {#if loading}
    <div class="flex justify-center items-center h-40">
      <div class="text-lg text-gray-500">Loading schedule data...</div>
    </div>
  {:else}
    <DailyScheduleView {displayDate} />
  {/if}
</div> 