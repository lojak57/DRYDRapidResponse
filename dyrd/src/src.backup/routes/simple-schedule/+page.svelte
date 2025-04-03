<script lang="ts">
  import DailyScheduleView from '$lib/components/scheduling/DailyScheduleView.svelte';
  import WeeklyScheduleView from '$lib/components/scheduling/WeeklyScheduleView.svelte';
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format, startOfWeek, addDays, subDays, addWeeks, subWeeks, parseISO } from 'date-fns';

  // Simple state
  let view = 'weekly'; // 'daily' or 'weekly'
  let isLoading = true;
  let errorMessage = '';
  let selectedDate = format(new Date(), 'yyyy-MM-dd');
  let weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Load all data
  onMount(async () => {
    try {
      console.log("Loading data for simple schedule...");
      
      // Load one at a time to see where any error might occur
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
      
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error loading data';
    } finally {
      isLoading = false;
    }
  });

  // Navigation functions
  function handlePrevDay() {
    try {
      selectedDate = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error navigating to previous day:", error);
    }
  }

  function handleNextDay() {
    try {
      selectedDate = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error navigating to next day:", error);
    }
  }

  function handlePrevWeek() {
    try {
      weekStartDate = format(subWeeks(parseISO(weekStartDate), 1), 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error navigating to previous week:", error);
    }
  }

  function handleNextWeek() {
    try {
      weekStartDate = format(addWeeks(parseISO(weekStartDate), 1), 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error navigating to next week:", error);
    }
  }

  function goToToday() {
    selectedDate = format(new Date(), 'yyyy-MM-dd');
    weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Simple Schedule View</h1>
  
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Error:</strong> {errorMessage}
    </div>
  {/if}
  
  <!-- Simple View Switcher -->
  <div class="mb-4 flex gap-2">
    <button 
      class="px-4 py-2 {view === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded"
      on:click={() => view = 'daily'}
    >
      Daily View
    </button>
    <button 
      class="px-4 py-2 {view === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded"
      on:click={() => view = 'weekly'}
    >
      Weekly View
    </button>
    <button 
      class="px-4 py-2 bg-green-500 text-white rounded ml-auto"
      on:click={goToToday}
    >
      Today
    </button>
  </div>
  
  {#if isLoading}
    <div class="flex items-center justify-center h-64 bg-white border border-gray-200 rounded">
      <div class="text-lg text-gray-500">Loading schedule data...</div>
    </div>
  {:else}
    {#if view === 'daily'}
      <DailyScheduleView 
        displayDate={selectedDate}
        on:prevDay={handlePrevDay}
        on:nextDay={handleNextDay}
      />
    {:else}
      <WeeklyScheduleView 
        weekStartDate={weekStartDate}
        on:prevWeek={handlePrevWeek}
        on:nextWeek={handleNextWeek}
      />
    {/if}
  {/if}
  
  <div class="mt-4">
    <a href="/test/store-debug" class="text-blue-500 hover:underline">Go to Store Debug</a>
  </div>
</div> 