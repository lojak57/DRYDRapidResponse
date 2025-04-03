<script lang="ts">
  import { users as userStore } from '$lib/stores/userStore';
  import { scheduleByTechnicianAndDate } from '$lib/stores/scheduleStore';
  import { jobs as jobStore } from '$lib/stores/jobStore';
  import { customers as customerStore } from '$lib/stores/customerStore';
  import { trucks as truckStore } from '$lib/stores/truckStore';
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
  import type { Job } from '$lib/types/Job';
  import type { Customer } from '$lib/types/Customer';
  import type { Truck } from '$lib/types/Truck';
  import { onMount } from 'svelte';
  import { derived, get } from 'svelte/store';
  import ScheduledJobCard from './ScheduledJobCard.svelte';
  import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { format, parseISO } from 'date-fns';
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';

  export let displayDate: string; // YYYY-MM-DD format
  
  const dispatch = createEventDispatcher();

  let technicians: User[] = [];
  let scheduleData: { [techId: string]: { [date: string]: ScheduleEntry } } = {};

  // Subscribe to main data stores to ensure data is available for lookups
  $: $jobStore, $customerStore, $truckStore;

  // Derive technicians list once
  const techUsers = derived(userStore, ($users) =>
    $users.filter(user => user.role === Role.TECH)
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
  );

  // Subscribe to derived stores
  $: technicians = $techUsers;
  $: scheduleData = $scheduleByTechnicianAndDate;
  
  // Format date for display
  $: formattedDate = (() => {
    try {
      const date = parseISO(displayDate);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  })();

  // Function to get job by ID
  function getJobById(jobId: string): Job | undefined {
    return $jobStore.find(job => job.id === jobId);
  }

  // Function to get customer by ID
  function getCustomerById(customerId: string): Customer | undefined {
    return $customerStore.find(customer => customer.id === customerId);
  }

  // Function to get truck by ID
  function getTruckById(truckId: string): Truck | undefined {
    return $truckStore.find(truck => truck.id === truckId);
  }

  // --- Data Fetching Function ---
  // Combined lookup logic in one function
  function getCardData(techId: string, date: string): {
    entry?: ScheduleEntry;
    job?: Job;
    customer?: Customer;
    truck?: Truck | null;
    error?: string;
  } {
    const entry = scheduleData[techId]?.[date];
    if (!entry) {
      return {}; // No entry for this tech/date
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
      // Optionally add warning if truck ID exists but truck not found
      // if (!truck) console.warn(`Truck ID ${entry.truckId} scheduled but truck data not found.`);
    }

    return { entry, job, customer, truck };
  }
</script>

<!-- Navigation Controls -->
<div class="flex justify-between items-center mb-2">
  <Button on:click={() => dispatch('prevDay')} color="secondary" size="sm">
    <ChevronLeft size={16} class="-ml-1 mr-1" /> Previous Day
  </Button>
  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Daily Schedule: {formattedDate}</h3>
  <Button on:click={() => dispatch('nextDay')} color="secondary" size="sm">
    Next Day <ChevronRight size={16} class="ml-1 -mr-1" />
  </Button>
</div>

<div class="daily-schedule-container overflow-x-auto">
  <div class="daily-schedule-grid grid grid-cols-[150px_1fr] gap-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 shadow-sm min-w-[600px]">
    <!-- Header Row -->
    <div class="tech-header p-2 font-semibold border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">Technician</div>
    <div class="schedule-header p-2 font-semibold border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center">Schedule for {formattedDate}</div>

    <!-- Technician Rows -->
    {#each technicians as tech (tech.id)}
      {@const cardData = getCardData(tech.id, displayDate)}
      <div class="tech-name p-2 border-r border-gray-200 dark:border-gray-700 flex items-center">
        {tech.firstName} {tech.lastName}
      </div>
      <div class="schedule-slot p-1 border-l border-gray-200 dark:border-gray-700 min-h-[70px] flex items-center justify-center">
        {#if cardData.entry && cardData.job && cardData.customer}
          <ScheduledJobCard
            scheduleEntry={cardData.entry}
            job={cardData.job}
            customer={cardData.customer}
            truck={cardData.truck}
          />
        {:else if cardData.error}
           <div class="text-red-600 dark:text-red-400 text-xs flex items-center p-2" title={cardData.error}>
             <AlertCircle size={16} class="mr-1" /> Error loading details.
           </div>
        {:else if !cardData.entry}
          <span class="text-xs text-gray-400 dark:text-gray-500 italic">No job scheduled</span>
        {/if}
      </div>
    {:else}
      <div class="col-span-2 p-4 text-center text-gray-500 dark:text-gray-400">No technicians found.</div>
    {/each}
  </div>
</div>

<style>
  /* Add responsive container */
  .daily-schedule-container {
    width: 100%;
  }

  /* Add basic alternating row background if desired */
  .daily-schedule-grid > div:nth-child(4n+3),
  .daily-schedule-grid > div:nth-child(4n+4) {
     background-color: var(--color-background-alt, #f9fafb); /* Light mode */
  }
  :global(html.dark) .daily-schedule-grid > div:nth-child(4n+3),
  :global(html.dark) .daily-schedule-grid > div:nth-child(4n+4) {
     background-color: var(--color-background-alt-dark, #1f2937); /* Dark mode */
  }
   /* Ensure borders don't double up */
  .daily-schedule-grid > div {
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }
  :global(html.dark) .daily-schedule-grid > div {
    border-bottom: 1px solid var(--color-border-dark, #4b5563);
  }
  .daily-schedule-grid > div:last-child,
  .daily-schedule-grid > div:nth-last-child(2) {
    border-bottom: none;
  }
  .schedule-slot {
    align-items: start; /* Align card to top */
    padding: 0.25rem; /* Reduce padding slightly */
  }
</style> 