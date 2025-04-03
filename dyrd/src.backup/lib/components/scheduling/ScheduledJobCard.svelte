<script lang="ts">
  import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
  import type { Job } from '$lib/types/Job';
  import type { Customer } from '$lib/types/Customer';
  import type { Truck } from '$lib/types/Truck';
  import { Truck as TruckIcon, User, Building, Info, MapPin } from 'lucide-svelte';
  import { JobType } from '$lib/types/Job';

  export let scheduleEntry: ScheduleEntry;
  export let job: Job;
  export let customer: Customer;
  export let truck: Truck | null | undefined = undefined;

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

  // Function to get job type label
  function getJobTypeLabel(jobType: JobType): string {
    switch (jobType) {
      case JobType.WATER:
        return 'Water';
      case JobType.FIRE:
        return 'Fire';
      case JobType.MOLD:
        return 'Mold';
      case JobType.SMOKE:
        return 'Smoke';
      case JobType.STORM:
        return 'Storm';
      default:
        return 'Other';
    }
  }

  const typeColor = getJobTypeColor(job.type);
  const typeLabel = getJobTypeLabel(job.type);
</script>

<a href={`/jobs/${job.id}`} 
   class="scheduled-job-card block w-full p-2 border-l-4 rounded-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer text-sm text-gray-800 dark:text-gray-200 {typeColor} hover:bg-opacity-70 dark:hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
   aria-label={`Job ${job.jobNumber}: ${job.title || 'Untitled'} - Customer: ${customer.name}`}>
  
  <div class="flex items-center justify-between mb-1">
    <div class="font-semibold truncate" title={job.title || `Job ${job.jobNumber}`}>
      #{job.jobNumber}
    </div>
    <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
      {typeLabel}
    </span>
  </div>
  
  <div class="font-medium mb-1 truncate" title={job.title || 'Untitled Job'}>
    {job.title || 'Untitled Job'}
  </div>
  
  <div class="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1 truncate" title={`Customer: ${customer.name}`}>
    <Building size={12} class="mr-1 flex-shrink-0" />
    <span class="truncate">{customer.name}</span>
  </div>
  
  {#if job.location}
    <div class="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1 truncate" title={`Location: ${job.location.street}, ${job.location.city}, ${job.location.state}`}>
      <MapPin size={12} class="mr-1 flex-shrink-0" />
      <span class="truncate">{job.location.street}, {job.location.city}</span>
    </div>
  {/if}
  
  {#if truck}
    <div class="flex items-center text-xs text-gray-600 dark:text-gray-400 truncate" title={`Truck: ${truck.name}`}>
      <TruckIcon size={12} class="mr-1 flex-shrink-0" />
      <span class="truncate">{truck.name}</span>
    </div>
  {:else if scheduleEntry.truckId}
     <div class="flex items-center text-xs text-orange-600 dark:text-orange-400 italic" title="Truck ID assigned, but truck data not found">
      <TruckIcon size={12} class="mr-1 flex-shrink-0" />
      <span>Truck Info Missing</span>
    </div>
  {/if}
  
  {#if scheduleEntry.notes}
    <div class="mt-1 pt-1 border-t border-gray-300/30 dark:border-gray-600/30 text-xs text-gray-500 dark:text-gray-400 group relative">
      <div class="flex items-start">
        <Info size={12} class="mr-1 flex-shrink-0 mt-0.5" />
        <span class="truncate">{scheduleEntry.notes}</span>
      </div>
      <!-- Tooltip on hover for full notes -->
      <div class="hidden group-hover:block absolute bottom-full left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded shadow-lg z-20 w-48 text-xs mb-1">
        {scheduleEntry.notes}
      </div>
    </div>
  {/if}
</a>

<style>
  /* Make sure card doesn't grow too large */
  .scheduled-job-card {
    max-height: 130px;
    overflow: hidden;
  }
  
  /* Improve focus visibility for accessibility */
  .scheduled-job-card:focus {
    outline: 2px solid theme('colors.blue.500');
    outline-offset: -2px;
  }
</style> 