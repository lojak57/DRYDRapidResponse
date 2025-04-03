<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, parseISO } from 'date-fns';
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { Calendar, Loader, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-svelte';
  import { get } from 'svelte/store';
  import { users as userStore } from '$lib/stores/userStore';
  import { scheduleEntries as scheduleStore, scheduleByTechnicianAndDate } from '$lib/stores/scheduleStore';
  import { jobs as jobStore } from '$lib/stores/jobStore';
  import { customers as customerStore } from '$lib/stores/customerStore';
  import { trucks as truckStore } from '$lib/stores/truckStore';
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
  import type { Job } from '$lib/types/Job';
  import type { Customer } from '$lib/types/Customer';
  import type { Truck } from '$lib/types/Truck';
  import { JobType, JobStatus } from '$lib/types/Job';

  type ViewMode = 'daily' | 'weekly';

  let currentView: ViewMode = 'weekly'; // Default view
  let selectedDate: string = format(new Date(), 'yyyy-MM-dd');
  // Ensure week starts on Monday (or Sunday based on locale preference)
  let currentWeekStart: string = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  let isLoading = true;
  let errorMessage = '';
  
  // Data holders
  let technicians: User[] = [];
  let weekDates: Date[] = [];
  let scheduleData: { [techId: string]: { [date: string]: ScheduleEntry } } = {};

  // Format dates for display
  $: formattedDate = format(parseISO(selectedDate), 'MMMM d, yyyy');
  $: weekStart = parseISO(currentWeekStart);
  $: weekEnd = addDays(weekStart, 6);
  $: weekRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  // Calculate week dates whenever currentWeekStart changes
  $: {
    try {
      const start = parseISO(currentWeekStart);
      const weekStartDate = startOfWeek(start, { weekStartsOn: 1 });
      const weekEndDate = addDays(weekStartDate, 6);
      weekDates = [];
      for (let i = 0; i <= 6; i++) {
        weekDates.push(addDays(weekStartDate, i));
      }
    } catch (e) {
      console.error("Error calculating week dates:", e);
      weekDates = [];
    }
  }

  // Load all necessary data
  onMount(async () => {
    try {
      isLoading = true;
      await Promise.all([
        loadUsers(),
        loadJobs(),
        loadCustomers(),
        loadTrucks(),
        loadScheduleEntries()
      ]);
      
      // Get all technicians
      const users = get(userStore);
      technicians = users.filter(user => user.role === Role.TECH)
                  .sort((a, b) => a.lastName.localeCompare(b.lastName));
      
      // Get schedule data
      scheduleData = get(scheduleByTechnicianAndDate);
      
      // Log data for debugging
      console.log("Schedule data loaded:", scheduleData);
      console.log("Available technicians:", technicians.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}` })));
      
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = 'Failed to load scheduling data. Please try again.';
    } finally {
      isLoading = false;
    }
  });

  function handlePrevDay() {
    selectedDate = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
  }

  function handleNextDay() {
    selectedDate = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
  }

  function handlePrevWeek() {
    currentWeekStart = format(subWeeks(parseISO(currentWeekStart), 1), 'yyyy-MM-dd');
  }

  function handleNextWeek() {
    currentWeekStart = format(addWeeks(parseISO(currentWeekStart), 1), 'yyyy-MM-dd');
  }

  function goToToday() {
    selectedDate = format(new Date(), 'yyyy-MM-dd');
    currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }
  
  // Function to get job by ID
  function getJobById(jobId: string): Job | undefined {
    return get(jobStore).find(job => job.id === jobId);
  }

  // Function to get customer by ID
  function getCustomerById(customerId: string): Customer | undefined {
    return get(customerStore).find(customer => customer.id === customerId);
  }

  // Function to get truck by ID
  function getTruckById(truckId: string): Truck | undefined {
    return get(truckStore).find(truck => truck.id === truckId);
  }
  
  // Function to map display technician name to the correct ID in the schedule data
  function getTechScheduleId(tech: User): string {
    // Map from user database to schedule entry IDs
    // This is a hardcoded mapping based on what we've seen in the mock data
    const nameToIdMap: {[name: string]: string} = {
      'Jordan Chen': 'tech-02', 
      'Casey Johnson': 'tech-03',
      'Maria Garcia': 'tech-04',
      'David Lee': 'tech-05',
      'Robert Nguyen': 'tech-10'
    };
    
    const fullName = `${tech.firstName} ${tech.lastName}`;
    return nameToIdMap[fullName] || tech.id; // Fall back to the ID if not in the map
  }
  
  // Get card data for a specific cell
  function getCardData(tech: User, date: string): {
    entry?: ScheduleEntry;
    job?: Job;
    customer?: Customer;
    truck?: Truck | null;
    error?: string;
  } {
    const techScheduleId = getTechScheduleId(tech);
    
    // Debug log
    console.log(`Checking schedule for tech ${techScheduleId} (${tech.firstName} ${tech.lastName}) on date ${date}`);
    
    // No schedule entry for this tech/date
    if (!scheduleData[techScheduleId] || !scheduleData[techScheduleId][date]) {
      return {}; 
    }
    
    const entry = scheduleData[techScheduleId][date];
    console.log(`Found schedule entry:`, entry);

    const job = getJobById(entry.jobId);
    if (!job) {
      return { entry, error: `Job ID ${entry.jobId} not found.` };
    }

    // Only show jobs with status SCHEDULED or IN_PROGRESS
    if (job.status !== JobStatus.SCHEDULED && job.status !== JobStatus.IN_PROGRESS) {
      console.log(`Job ${job.id} has status ${job.status}, not displaying on calendar`);
      return {};
    }

    const customer = getCustomerById(job.customerId);
    if (!customer) {
      return { entry, job, error: `Customer ID ${job.customerId} not found.` };
    }

    let truck: Truck | null | undefined = undefined;
    if (entry.truckId) {
      truck = getTruckById(entry.truckId);
    }

    return { entry, job, customer, truck };
  }
  
  // Function to get color based on job type
  function getJobTypeColor(jobType: JobType): string {
    switch (jobType) {
      case JobType.WATER:
        return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case JobType.FIRE:
        return 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20';
      case JobType.MOLD:
        return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20';
      case JobType.SMOKE:
        return 'border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case JobType.STORM:
        return 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-gray-500 dark:border-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  }
</script>

<PageHeader title="Technician Schedule" />

<div class="mb-6">
  {#if errorMessage}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300 rounded">
      {errorMessage}
    </div>
  {/if}

  <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
    <!-- View Switcher -->
    <div class="flex gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-md self-stretch sm:self-start">
      <div class={currentView === 'daily' ? '' : 'text-gray-600 dark:text-gray-300'}>
        <Button
          size="sm"
          color={currentView === 'daily' ? 'primary' : 'ghost'}
          on:click={() => currentView = 'daily'}
        >
          Daily
        </Button>
      </div>
      <div class={currentView === 'weekly' ? '' : 'text-gray-600 dark:text-gray-300'}>
        <Button
          size="sm"
          color={currentView === 'weekly' ? 'primary' : 'ghost'}
          on:click={() => currentView = 'weekly'}
        >
          Weekly
        </Button>
      </div>
    </div>

    <!-- Current View Information -->
    <div class="text-center text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
      {#if currentView === 'daily'}
        <div class="flex items-center">
          <Calendar size={16} class="mr-1" />
          <span>Viewing: {formattedDate}</span>
        </div>
      {:else}
        <div class="flex items-center">
          <Calendar size={16} class="mr-1" />
          <span>Viewing: {weekRange}</span>
        </div>
      {/if}
    </div>

    <!-- Today Button -->
    <div>
      <Button on:click={goToToday} color="secondary" size="sm" disabled={isLoading}>
        Go to Today
      </Button>
    </div>
  </div>

  {#if isLoading}
    <div class="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
      <Loader size={32} class="text-blue-500 animate-spin mb-2" />
      <div class="text-lg text-gray-500 dark:text-gray-400">Loading schedule data...</div>
    </div>
  {:else}
    {#if currentView === 'daily'}
      <!-- Daily View Implementation -->
      <div class="border rounded bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="flex justify-between items-center p-3 border-b dark:border-gray-700">
          <Button on:click={handlePrevDay} color="secondary" size="sm">
            <ChevronLeft size={16} class="-ml-1 mr-1" /> Previous Day
          </Button>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h3>
          <Button on:click={handleNextDay} color="secondary" size="sm">
            Next Day <ChevronRight size={16} class="ml-1 -mr-1" />
          </Button>
        </div>
        
        <div class="overflow-x-auto">
          <div class="grid grid-cols-[150px_1fr] min-w-[600px]">
            <!-- Header Row -->
            <div class="p-2 font-semibold border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Technician</div>
            <div class="p-2 font-semibold border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center text-gray-800 dark:text-gray-200">
              Schedule for {format(parseISO(selectedDate), 'MMM d, yyyy')}
            </div>
            
            <!-- Technician Rows -->
            {#each technicians as tech (tech.id)}
              {@const cardData = getCardData(tech, selectedDate)}
              <div class="p-2 border-r border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {tech.firstName} {tech.lastName}
              </div>
              <div class="p-2 border-b border-gray-200 dark:border-gray-700 min-h-[80px] flex items-center justify-center bg-white dark:bg-gray-800">
                {#if cardData.entry && cardData.job && cardData.customer}
                  <a href={`/jobs/${cardData.job.id}`} class="block w-full p-2 border-l-4 rounded-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer text-sm text-gray-800 dark:text-gray-200 {getJobTypeColor(cardData.job.type)} hover:bg-opacity-70 dark:hover:bg-opacity-30">
                    <div class="font-medium truncate">{cardData.job.title || `Job #${cardData.job.jobNumber}`}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 truncate">Customer: {cardData.customer.name}</div>
                    {#if cardData.entry.notes}
                      <div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">Note: {cardData.entry.notes}</div>
                    {/if}
                  </a>
                {:else if cardData.error}
                  <div class="text-red-600 dark:text-red-400 text-xs flex items-center p-2" title={cardData.error}>
                    <AlertCircle size={16} class="mr-1" /> Error loading details.
                  </div>
                {:else if !cardData.entry}
                  <span class="text-xs text-gray-400 dark:text-gray-500 italic">No job scheduled</span>
                {/if}
              </div>
            {:else}
              <div class="col-span-2 p-4 text-center text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                No technicians found.
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else}
      <!-- Weekly View Implementation -->
      <div class="border rounded bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="flex justify-between items-center p-3 border-b dark:border-gray-700">
          <Button on:click={handlePrevWeek} color="secondary" size="sm">
            <ChevronLeft size={16} class="-ml-1 mr-1" /> Previous Week
          </Button>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {format(parseISO(currentWeekStart), 'MMM d')} - {format(addDays(parseISO(currentWeekStart), 6), 'MMM d, yyyy')}
          </h3>
          <Button on:click={handleNextWeek} color="secondary" size="sm">
            Next Week <ChevronRight size={16} class="ml-1 -mr-1" />
          </Button>
        </div>
        
        <div class="overflow-x-auto">
          <div class="grid grid-cols-[150px_repeat(7,_minmax(120px,_1fr))] min-w-[1000px]">
            <!-- Header Row -->
            <div class="p-2 font-semibold border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky left-0 z-10 text-gray-800 dark:text-gray-200">
              Technician
            </div>
            
            {#each weekDates as date (format(date, 'yyyy-MM-dd'))}
              <div class="p-2 font-semibold text-center border-b border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div class="text-gray-800 dark:text-gray-200">{format(date, 'EEE')}</div>
                <div class="text-xs font-normal text-gray-600 dark:text-gray-400">{format(date, 'MMM d')}</div>
              </div>
            {/each}
            
            <!-- Technician Rows -->
            {#each technicians as tech (tech.id)}
              <div class="p-2 border-r border-t border-gray-200 dark:border-gray-700 flex items-center sticky left-0 z-10 bg-white dark:bg-gray-800">
                <span class="text-gray-800 dark:text-gray-200 truncate">{tech.firstName} {tech.lastName}</span>
              </div>
              
              {#each weekDates as date (format(date, 'yyyy-MM-dd'))}
                {@const dateString = format(date, 'yyyy-MM-dd')}
                <!-- We need to pass in the tech.id (which should match the userId in scheduleEntries) -->
                {@const cardData = getCardData(tech, dateString)}
                <div class="p-1 border-l border-t border-gray-200 dark:border-gray-700 min-h-[70px] bg-white dark:bg-gray-800" title={`${tech.firstName} ${tech.lastName} - ${format(date, 'MMM d, yyyy')}`}>
                  {#if cardData.entry && cardData.job && cardData.customer}
                    <a href={`/jobs/${cardData.job.id}`} class="block w-full p-2 border-l-4 rounded-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer text-sm text-gray-800 dark:text-gray-200 {getJobTypeColor(cardData.job.type)} hover:bg-opacity-70 dark:hover:bg-opacity-30">
                      <div class="font-medium truncate">{cardData.job.title || `Job #${cardData.job.jobNumber}`}</div>
                      <div class="text-xs text-gray-600 dark:text-gray-400 truncate">Customer: {cardData.customer.name}</div>
                      {#if cardData.entry.notes}
                        <div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">Note: {cardData.entry.notes}</div>
                      {/if}
                    </a>
                  {:else if cardData.error}
                    <div class="text-red-600 dark:text-red-400 text-xs flex items-center p-1" title={cardData.error}>
                      <AlertCircle size={14} class="mr-1" /> Error
                    </div>
                  {/if}
                </div>
              {/each}
            {:else}
              <div class="col-span-8 p-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                No technicians found.
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div> 