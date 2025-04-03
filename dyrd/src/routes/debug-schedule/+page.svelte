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
  let view = 'daily'; // 'daily' or 'weekly'
  let isLoading = true;
  let errorMessage = '';
  let selectedDate = format(new Date(), 'yyyy-MM-dd');
  let weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  // Component error states
  let dailyViewError = null;
  let weeklyViewError = null;

  // Load all data
  onMount(async () => {
    try {
      console.log("Loading data for debug schedule...");
      
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

  // Navigation functions - simplified for debugging
  function handlePrevDay() {
    selectedDate = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
  }

  function handleNextDay() {
    selectedDate = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
  }

  function handlePrevWeek() {
    weekStartDate = format(subWeeks(parseISO(weekStartDate), 1), 'yyyy-MM-dd');
  }

  function handleNextWeek() {
    weekStartDate = format(addWeeks(parseISO(weekStartDate), 1), 'yyyy-MM-dd');
  }

  function goToToday() {
    selectedDate = format(new Date(), 'yyyy-MM-dd');
    weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }
  
  // Try to render components with explicit error handling
  function tryRenderDailyView() {
    try {
      return `
        <div>
          <DailyScheduleView 
            displayDate={selectedDate}
            on:prevDay={handlePrevDay}
            on:nextDay={handleNextDay}
          />
        </div>
      `;
    } catch (error) {
      dailyViewError = error instanceof Error ? error.message : "Unknown error rendering daily view";
      return null;
    }
  }
  
  function tryRenderWeeklyView() {
    try {
      return `
        <div>
          <WeeklyScheduleView 
            weekStartDate={weekStartDate}
            on:prevWeek={handlePrevWeek}
            on:nextWeek={handleNextWeek}
          />
        </div>
      `;
    } catch (error) {
      weeklyViewError = error instanceof Error ? error.message : "Unknown error rendering weekly view";
      return null;
    }
  }
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Schedule Debug View</h1>
  
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Data Loading Error:</strong> {errorMessage}
    </div>
  {/if}
  
  {#if dailyViewError}
    <div class="mb-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded">
      <strong>Daily View Error:</strong> {dailyViewError}
    </div>
  {/if}
  
  {#if weeklyViewError}
    <div class="mb-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded">
      <strong>Weekly View Error:</strong> {weeklyViewError}
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
      <div class="daily-wrapper" data-testid="daily-view">
        {#if !dailyViewError}
          {@const render = tryRenderDailyView()}
          {#if render}
            <svelte:component this={DailyScheduleView} 
              displayDate={selectedDate}
              on:prevDay={handlePrevDay}
              on:nextDay={handleNextDay}
            />
          {:else}
            <div class="p-4 border border-red-300 bg-red-50 rounded">
              Failed to render Daily View. See error above.
            </div>
          {/if}
        {:else}
          <div class="p-4 border border-red-300 bg-red-50 rounded">
            Failed to render Daily View. See error above.
          </div>
        {/if}
      </div>
    {:else}
      <div class="weekly-wrapper" data-testid="weekly-view">
        {#if !weeklyViewError}
          {@const render = tryRenderWeeklyView()}
          {#if render}
            <svelte:component this={WeeklyScheduleView} 
              weekStartDate={weekStartDate}
              on:prevWeek={handlePrevWeek}
              on:nextWeek={handleNextWeek}
            />
          {:else}
            <div class="p-4 border border-red-300 bg-red-50 rounded">
              Failed to render Weekly View. See error above.
            </div>
          {/if}
        {:else}
          <div class="p-4 border border-red-300 bg-red-50 rounded">
            Failed to render Weekly View. See error above.
          </div>
        {/if}
      </div>
    {/if}
  {/if}
  
  <div class="mt-4">
    <a href="/minimal-daily" class="text-blue-500 hover:underline mr-4">Minimal Daily</a>
    <a href="/minimal-weekly" class="text-blue-500 hover:underline mr-4">Minimal Weekly</a>
    <a href="/load-test" class="text-blue-500 hover:underline">Data Test</a>
  </div>
</div> 