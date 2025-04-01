<script lang="ts">
  import { JobStatus } from '$lib/types/Job';
  import { createEventDispatcher } from 'svelte';
  
  // Define workflow stages for the header navigation
  const workflowStages = [
    { status: JobStatus.NEW, label: 'New Jobs' },
    { status: JobStatus.IN_PROGRESS, label: 'In Progress' },
    { status: JobStatus.PENDING_COMPLETION, label: 'Pending' },
    { status: JobStatus.INVOICED, label: 'Invoiced' }
  ];
  
  // Export properties for component usage
  export let selectedStatus: JobStatus | 'ALL' = 'ALL';
  export let countsMap: Record<string, number> = {};
  
  // Create a dispatcher for events
  const dispatch = createEventDispatcher<{
    filterChange: { status: JobStatus | 'ALL' };
  }>();
  
  // Handle clicking on a workflow status step
  function handleFilterClick(status: JobStatus | 'ALL') {
    selectedStatus = status;
    dispatch('filterChange', { status });
  }
</script>

<div class="w-full bg-dryd-gradient text-white overflow-x-auto">
  <div class="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
    <div class="flex items-center space-x-1 md:space-x-3">
      <!-- "All" button -->
      <button 
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors
               {selectedStatus === 'ALL' ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-white/10'}"
        on:click={() => handleFilterClick('ALL')}
      >
        <div class="flex items-center">
          <span>All</span>
          {#if countsMap['ALL']}
            <span class="ml-1.5 px-1.5 py-0.5 text-xs bg-white text-blue-700 rounded-full">{countsMap['ALL']}</span>
          {/if}
        </div>
      </button>

      <!-- Job status filter buttons -->
      {#each workflowStages as stage}
        <button 
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                 {selectedStatus === stage.status ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-white/10'}"
          on:click={() => handleFilterClick(stage.status)}
        >
          <div class="flex items-center">
            <span>{stage.label}</span>
            {#if countsMap[stage.status]}
              <span class="ml-1.5 px-1.5 py-0.5 text-xs bg-white text-blue-700 rounded-full">{countsMap[stage.status]}</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
    
    <div class="relative flex-shrink-0">
      <select 
        class="text-blue-900 bg-white border-0 rounded-md text-sm px-3 py-2 appearance-none pr-8 shadow-sm"
        on:change={(e) => handleFilterClick(e.target.value as JobStatus | 'ALL')}
        value={selectedStatus}
      >
        <option value="ALL">All Jobs</option>
        {#each Object.values(JobStatus) as status}
          <option value={status}>{status.replace(/_/g, ' ')}</option>
        {/each}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
</div> 