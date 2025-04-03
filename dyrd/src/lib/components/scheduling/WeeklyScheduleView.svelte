<script lang="ts">
  import { users as userStore } from '$lib/stores/userStore';
  import { scheduleEntries as scheduleStore } from '$lib/stores/scheduleStore';
  import { jobs as jobStore } from '$lib/stores/jobStore';
  import { customers as customerStore } from '$lib/stores/customerStore';
  import { trucks as truckStore, getTruckById } from '$lib/stores/truckStore';
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
  import type { Job } from '$lib/types/Job';
  import type { Customer } from '$lib/types/Customer';
  import type { Truck } from '$lib/types/Truck';
  import { derived, get } from 'svelte/store';
  import { addDays, format, parseISO, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
  import ScheduledJobCard from './ScheduledJobCard.svelte';
  import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';

  export let weekStartDate: string; // YYYY-MM-DD, should be a Monday ideally
  const dispatch = createEventDispatcher();

  let technicians: User[] = [];
  let weekDates: Date[] = [];
  let weekScheduleEntries: ScheduleEntry[] = [];

  // Subscribe to main data stores
  $: $jobStore, $customerStore, $truckStore, $scheduleStore;

  // Derive technicians list
  const techUsers = derived(userStore, ($users) =>
    $users.filter(user => user.role === Role.TECH)
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
  );
  $: technicians = $techUsers;

  // Calculate week dates and filter schedule entries whenever weekStartDate changes
  $: {
    try {
      const start = parseISO(weekStartDate);
      // Ensure we start from Monday (isoWeek=true) or Sunday (isoWeek=false) depending on locale needs
      // Using default locale's start of week here
      const weekStart = startOfWeek(start, { weekStartsOn: 1 }); // 1 = Monday
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

      // Filter schedule entries for this week
      const weekDateStrings = weekDates.map(d => format(d, 'yyyy-MM-dd'));
      weekScheduleEntries = get(scheduleStore).filter(entry =>
        weekDateStrings.includes(entry.date)
      );
    } catch (e) {
        console.error("Error parsing week start date:", weekStartDate, e);
        weekDates = [];
        weekScheduleEntries = [];
    }
  }

  // Formatted date range for display
  $: weekDateRange = (() => {
    try {
      const start = parseISO(weekStartDate);
      const end = addDays(start, 6); // Assuming Monday start
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } catch {
      return 'Invalid Date Range';
    }
  })();

  // Function to find the schedule entry for a specific tech and date within the filtered week's entries
  function getEntryForCell(techId: string, date: string): ScheduleEntry | undefined {
    return weekScheduleEntries.find(entry => entry.userId === techId && entry.date === date);
  }

  // Helper functions to get data by ID
  function getJobById(jobId: string): Job | undefined {
    return get(jobStore).find(job => job.id === jobId);
  }

  function getCustomerById(customerId: string): Customer | undefined {
    return get(customerStore).find(customer => customer.id === customerId);
  }

  // Function to get all data needed for a card
  function getCardDataForCell(techId: string, date: string): {
    entry?: ScheduleEntry;
    job?: Job;
    customer?: Customer;
    truck?: Truck | null;
    error?: string;
  } {
    const entry = getEntryForCell(techId, date);
    if (!entry) {
        return {}; // No entry for this cell
    }

    const job = getJobById(entry.jobId);
    if (!job) {
        return { entry, error: `Job ID ${entry.jobId} not found.` };
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
</script>

<!-- Navigation Controls -->
<div class="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
  <div class="w-full sm:w-auto">
    <Button on:click={() => dispatch('prevWeek')} color="secondary" size="sm">
      <ChevronLeft size={16} class="-ml-1 mr-1" /> Previous Week
    </Button>
  </div>
  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 order-first sm:order-none">Weekly Schedule: {weekDateRange}</h3>
  <div class="w-full sm:w-auto">
    <Button on:click={() => dispatch('nextWeek')} color="secondary" size="sm">
      Next Week <ChevronRight size={16} class="ml-1 -mr-1" />
    </Button>
  </div>
</div>

<div class="weekly-schedule-grid border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 shadow-sm overflow-x-auto">
  <div class="grid grid-cols-[150px_repeat(7,_minmax(120px,_1fr))] min-w-[1000px]">
    <!-- Header Row -->
    <div class="tech-header p-2 font-semibold border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky left-0 z-10">Technician</div>
    {#each weekDates as date (format(date, 'yyyy-MM-dd'))}
      <div class="day-header p-2 font-semibold text-center border-b border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div class="text-gray-800 dark:text-gray-200">{format(date, 'EEE')}</div>
        <div class="text-xs font-normal text-gray-600 dark:text-gray-400">{format(date, 'MMM d')}</div>
      </div>
    {/each}

    <!-- Technician Rows -->
    {#each technicians as tech (tech.id)}
      <div class="tech-name p-2 border-r border-t border-gray-200 dark:border-gray-700 flex items-center sticky left-0 z-10 bg-white dark:bg-gray-800">
        <span class="text-gray-800 dark:text-gray-200 truncate">{tech.firstName} {tech.lastName}</span>
      </div>
      {#each weekDates as date (format(date, 'yyyy-MM-dd'))}
        {@const dateString = format(date, 'yyyy-MM-dd')}
        {@const cardData = getCardDataForCell(tech.id, dateString)}
        <div class="schedule-cell p-1 border-l border-t border-gray-200 dark:border-gray-700 min-h-[70px]" title={`${tech.firstName} ${tech.lastName} - ${format(date, 'MMM d, yyyy')}`}>
           {#if cardData.entry && cardData.job && cardData.customer}
              <ScheduledJobCard
                scheduleEntry={cardData.entry}
                job={cardData.job}
                customer={cardData.customer}
                truck={cardData.truck}
              />
           {:else if cardData.error}
               <div class="text-red-600 dark:text-red-400 text-xs flex items-center p-1" title={cardData.error}>
                   <AlertCircle size={14} class="mr-1" /> Error
               </div>
           {:else if !cardData.entry}
             <!-- Empty cell -->
             <div class="w-full h-full"></div>
           {/if}
        </div>
      {/each}
    {:else}
      <div class="col-span-8 p-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">No technicians found.</div>
    {/each}
  </div>
</div>

<style>
 .weekly-schedule-grid {
    /* Ensure proper rendering of sticky elements */
    position: relative;
 }
 .tech-header, .tech-name {
    /* Background needs to overlay grid lines */
    background-color: theme('colors.white');
 }
 :global(html.dark) .tech-header, :global(html.dark) .tech-name {
     background-color: theme('colors.gray.800');
 }

 /* Making alternating row backgrounds more accessible */
 .grid > div:nth-child(16n+9), /* Start of first tech row */
 .grid > div:nth-child(16n+10),
 /* ... up to ... */
 .grid > div:nth-child(16n+16) {
     background-color: var(--color-background-alt, #f9fafb);
 }
 :global(html.dark) .grid > div:nth-child(16n+9),
 :global(html.dark) .grid > div:nth-child(16n+10),
 :global(html.dark) .grid > div:nth-child(16n+16) {
     background-color: var(--color-background-alt-dark, #1f2937);
 }
 /* Ensure sticky tech name column retains background */
 .grid > div.tech-name:nth-child(16n+9) {
     background-color: var(--color-background-alt, #f9fafb);
 }
:global(html.dark) .grid > div.tech-name:nth-child(16n+9) {
     background-color: var(--color-background-alt-dark, #1f2937);
 }

 /* Add focus style for better accessibility */
 .schedule-cell:focus-within {
   outline: 2px solid theme('colors.blue.500');
   outline-offset: -2px;
 }
</style> 