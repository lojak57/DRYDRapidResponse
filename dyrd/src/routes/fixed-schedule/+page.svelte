<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { format, startOfWeek, addDays, subDays, addWeeks, subWeeks, parseISO } from 'date-fns';
  import { get } from 'svelte/store';
  import { users as userStore } from '$lib/stores/userStore';
  import { scheduleEntries as scheduleStore } from '$lib/stores/scheduleStore';
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';

  // Simple state
  let view: 'daily' | 'weekly' = 'weekly'; // 'daily' or 'weekly'
  let isLoading = true;
  let errorMessage = '';
  let selectedDate = format(new Date(), 'yyyy-MM-dd');
  let weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  let technicians: User[] = [];
  let weekDates: Date[] = [];

  // Load all data
  onMount(async () => {
    try {
      console.log("Loading data for fixed schedule...");
      
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
      
      // Prepare the data
      technicians = get(userStore).filter(user => user.role === Role.TECH);
      
      // Calculate week dates
      const start = parseISO(weekStartDate);
      const weekStart = startOfWeek(start, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      weekDates = [];
      for (let i = 0; i <= 6; i++) {
        weekDates.push(addDays(weekStart, i));
      }
      
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
    updateWeekDates();
  }

  function handleNextWeek() {
    weekStartDate = format(addWeeks(parseISO(weekStartDate), 1), 'yyyy-MM-dd');
    updateWeekDates();
  }

  function goToToday() {
    selectedDate = format(new Date(), 'yyyy-MM-dd');
    weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    updateWeekDates();
  }
  
  function updateWeekDates() {
    try {
      const start = parseISO(weekStartDate);
      const weekStart = startOfWeek(start, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      weekDates = [];
      for (let i = 0; i <= 6; i++) {
        weekDates.push(addDays(weekStart, i));
      }
    } catch (e) {
      console.error("Error updating week dates:", e);
    }
  }
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Fixed Schedule View</h1>
  
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong>Data Loading Error:</strong> {errorMessage}
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
      <!-- Daily View Implementation -->
      <div class="border rounded">
        <div class="flex justify-between items-center p-2 bg-gray-100 border-b">
          <button class="px-3 py-1 bg-blue-500 text-white rounded" on:click={handlePrevDay}>
            Previous Day
          </button>
          <h3 class="text-lg font-semibold">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h3>
          <button class="px-3 py-1 bg-blue-500 text-white rounded" on:click={handleNextDay}>
            Next Day
          </button>
        </div>
        
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
    {:else}
      <!-- Weekly View Implementation -->
      <div class="overflow-x-auto border rounded">
        <div class="flex justify-between items-center p-2 bg-gray-100 border-b">
          <button class="px-3 py-1 bg-blue-500 text-white rounded" on:click={handlePrevWeek}>
            Previous Week
          </button>
          <h3 class="text-lg font-semibold">
            {format(parseISO(weekStartDate), 'MMM d')} - {format(addDays(parseISO(weekStartDate), 6), 'MMM d, yyyy')}
          </h3>
          <button class="px-3 py-1 bg-blue-500 text-white rounded" on:click={handleNextWeek}>
            Next Week
          </button>
        </div>
        
        <div class="min-w-[1000px]">
          <table class="min-w-full">
            <thead>
              <tr>
                <th class="border p-2 w-[150px] sticky left-0 bg-white">Technician</th>
                {#each weekDates as date}
                  <th class="border p-2 min-w-[120px]">
                    <div>{format(date, 'EEE')}</div>
                    <div class="text-xs text-gray-500">{format(date, 'MMM d')}</div>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each technicians as tech}
                <tr>
                  <td class="border p-2 sticky left-0 bg-white">{tech.firstName} {tech.lastName}</td>
                  {#each weekDates as date}
                    <td class="border p-2 min-h-[70px]"></td>
                  {/each}
                </tr>
              {:else}
                <tr>
                  <td colspan="8" class="border p-2 text-center">No technicians found</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
  
  <div class="mt-4">
    <a href="/minimal-daily" class="text-blue-500 hover:underline mr-4">Minimal Daily</a>
    <a href="/minimal-weekly" class="text-blue-500 hover:underline mr-4">Minimal Weekly</a>
    <a href="/load-test" class="text-blue-500 hover:underline">Data Test</a>
  </div>
</div> 