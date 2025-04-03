<script lang="ts">
  import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
  import type { Job } from '$lib/types/Job';
  import type { Customer } from '$lib/types/Customer';
  import type { Truck } from '$lib/types/Truck';
  import { Truck as TruckIcon, User, Building } from 'lucide-svelte';
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

  const typeColor = getJobTypeColor(job.type);
</script>

<a href={`/jobs/${job.id}`} class="scheduled-job-card block w-full p-2 border rounded-md shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer text-sm text-gray-800 dark:text-gray-200 {typeColor} hover:bg-opacity-70 dark:hover:bg-opacity-30">
  <div class="font-semibold mb-1 truncate" title={job.title || `Job ${job.jobNumber}`}>
    #{job.jobNumber} - {job.title || 'Untitled Job'}
  </div>
  <div class="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1 truncate" title={`Customer: ${customer.name}`}>
    <Building size={14} class="mr-1 flex-shrink-0" />
    <span class="truncate">{customer.name}</span>
  </div>
  {#if truck}
    <div class="flex items-center text-xs text-gray-600 dark:text-gray-400 truncate" title={`Truck: ${truck.name}`}>
      <TruckIcon size={14} class="mr-1 flex-shrink-0" />
      <span class="truncate">{truck.name}</span>
    </div>
  {:else if scheduleEntry.truckId}
     <div class="flex items-center text-xs text-orange-600 dark:text-orange-400 italic" title="Truck ID assigned, but truck data not found">
      <TruckIcon size={14} class="mr-1 flex-shrink-0" />
      <span>Truck Info Missing</span>
    </div>
  {/if}
  {#if scheduleEntry.notes}
      <div class="mt-1 pt-1 border-t border-gray-300/30 dark:border-gray-600/30 text-xs text-gray-500 dark:text-gray-400 italic truncate" title={scheduleEntry.notes}>
          Note: {scheduleEntry.notes}
      </div>
  {/if}
</a>

<style>
  /* Add any specific styles if needed */
</style> 