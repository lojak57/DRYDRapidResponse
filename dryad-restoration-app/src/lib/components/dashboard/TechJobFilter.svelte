<script lang="ts">
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { derived, writable } from 'svelte/store';
  import { currentUser } from '$lib/stores/authStore';
  import { techJobCategorization } from '$lib/stores/jobStore';
  import type { Job } from '$lib/types/Job';
  
  // Custom UI component imports
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { formatDate } from '$lib/utils/formatters';

  // Constants for filter types instead of enum for Svelte compatibility
  const TECH_FILTER = {
    UNSCHEDULED: 'unscheduled',
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed'
  } as const;

  // Type for filter
  type TechFilterType = keyof typeof TECH_FILTER;

  // Create a writable store for the selected filter
  const selectedFilter = writable<TechFilterType>('UNSCHEDULED');

  // Set the filter
  function setFilter(filter: TechFilterType) {
    selectedFilter.set(filter);
  }

  // Reset filter to default
  function resetFilter() {
    selectedFilter.set('UNSCHEDULED');
  }

  // Derive the filtered jobs list based on the selected filter
  const filteredJobs = derived(
    [selectedFilter, techJobCategorization],
    ([$selectedFilter, $techJobCategorization]) => {
      if (!$techJobCategorization) return [];

      switch ($selectedFilter) {
        case 'UNSCHEDULED':
          return $techJobCategorization.unscheduledJobs || [];
        case 'SCHEDULED':
          return $techJobCategorization.scheduledJobs || [];
        case 'COMPLETED':
          return $techJobCategorization.completedJobs || [];
        default:
          return $techJobCategorization.allAssignedJobs || [];
      }
    }
  );

  // Navigation to job details
  function navigateToJob(id: string) {
    goto(`/jobs/${id}`);
  }

  // Get the count of jobs for each category
  const unscheduledCount = derived(
    techJobCategorization,
    $techJobCategorization => $techJobCategorization?.unscheduledJobs?.length || 0
  );

  const scheduledCount = derived(
    techJobCategorization,
    $techJobCategorization => $techJobCategorization?.scheduledJobs?.length || 0
  );

  const completedCount = derived(
    techJobCategorization,
    $techJobCategorization => $techJobCategorization?.completedJobs?.length || 0
  );
</script>

<div class="mt-4">
  <div class="grid grid-cols-3 gap-2 mb-4">
    <Button 
      color={$selectedFilter === 'UNSCHEDULED' ? 'primary' : 'default'}
      on:click={() => setFilter('UNSCHEDULED')}
      fullWidth={true}
    >
      <span>Unscheduled</span>
      <Badge color="blue" className="ml-2">{$unscheduledCount}</Badge>
    </Button>
    
    <Button 
      color={$selectedFilter === 'SCHEDULED' ? 'primary' : 'default'}
      on:click={() => setFilter('SCHEDULED')}
      fullWidth={true}
    >
      <span>Scheduled</span>
      <Badge color="blue" className="ml-2">{$scheduledCount}</Badge>
    </Button>
    
    <Button 
      color={$selectedFilter === 'COMPLETED' ? 'primary' : 'default'}
      on:click={() => setFilter('COMPLETED')}
      fullWidth={true}
    >
      <span>Completed</span>
      <Badge color="blue" className="ml-2">{$completedCount}</Badge>
    </Button>
  </div>

  <Card>
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">
        {#if $selectedFilter === 'UNSCHEDULED'}
          Assigned Jobs (Unscheduled)
        {:else if $selectedFilter === 'SCHEDULED'}
          Assigned Jobs (Scheduled)
        {:else if $selectedFilter === 'COMPLETED'}
          Assigned Jobs (Completed)
        {:else}
          All Assigned Jobs
        {/if}
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        {#if $selectedFilter === 'UNSCHEDULED'}
          Jobs assigned to you that need to be scheduled
        {:else if $selectedFilter === 'SCHEDULED'}
          Jobs currently scheduled or in progress
        {:else if $selectedFilter === 'COMPLETED'}
          Jobs where you've completed your tasks
        {:else}
          All jobs assigned to you
        {/if}
      </p>
      
      {#if $filteredJobs.length === 0}
        <div class="text-center py-6 text-gray-500">
          No jobs in this category
        </div>
      {:else}
        <div class="space-y-4">
          {#each $filteredJobs as job}
            <div 
              class="border rounded-md p-3 hover:bg-gray-100 transition-colors cursor-pointer"
              on:click={() => navigateToJob(job.id)}
              on:keydown={(e) => e.key === 'Enter' && navigateToJob(job.id)}
              tabindex="0"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold">{job.title}</h4>
                  <p class="text-sm text-gray-600">Job #{job.jobNumber}</p>
                </div>
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {job.status.replace(/_/g, ' ')}
                </span>
              </div>
              {#if job.scheduledStartDate}
                <div class="mt-2 text-sm">
                  <span class="font-medium">Scheduled:</span> {formatDate(job.scheduledStartDate)}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </Card>
</div> 