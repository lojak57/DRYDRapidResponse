<script lang="ts">
  import { JobStatus, type Job } from '$lib/types/Job';
  import { dashboardJobs, jobStatusCounts, jobs, isLoading, jobsNeedingWorkStart } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import JobList from './JobList.svelte';
  
  // Props
  export let selectedStatusFilter: string | null = null;
  export let showViewAllButton: boolean = true;
  export let filterNeedsStart: boolean = false;
  
  // Function to reset all filters
  function resetFilters() {
    selectedStatusFilter = null;
    filterNeedsStart = false;
  }
  
  // Function to set the status filter
  function setStatusFilter(status: string) {
    // Clear "needs start" filter when setting a status filter
    filterNeedsStart = false;
    selectedStatusFilter = status === selectedStatusFilter ? null : status;
  }
  
  // Function to set the "needs start" filter
  function setNeedsStartFilter() {
    filterNeedsStart = !filterNeedsStart;
    if (filterNeedsStart) {
      // Clear status filter when setting "needs start" filter
      selectedStatusFilter = null;
    }
  }
  
  // Get filtered jobs based on the selected filters
  $: filteredDashboardJobs = filterNeedsStart
    ? $jobsNeedingWorkStart
    : selectedStatusFilter 
      ? $jobs.filter(job => job.status === selectedStatusFilter)
      : $dashboardJobs;
  
  // Track available statuses (statuses that have jobs)
  $: availableStatuses = $jobs 
    ? Object.values(JobStatus)
        .filter(status => status !== JobStatus.CANCELLED)
        .filter(status => $jobs.some(job => job.status === status))
    : [];
  
  // Check if user is authorized
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
</script>

<style>
  .filter-button {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    transition-property: all;
    transition-duration: 200ms;
    min-width: 100px;
  }
  
  .filter-button:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: scale(1.05);
  }
  
  .filter-button.selected {
    color: white;
  }
  
  .filter-button.unselected {
    background-color: white;
    color: #374151;
    border-width: 1px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .filter-section {
    background-color: rgba(8, 145, 178, 0.95);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    color: white;
    background-image: linear-gradient(135deg, rgba(8, 145, 178, 0.95), rgba(14, 116, 144, 0.95));
  }
  
  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
</style>

<div class="filter-section">
  <div class="flex justify-between items-center mb-2">
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <h2 class="text-lg font-semibold">Job Filter</h2>
    </div>
    
    {#if showViewAllButton}
      <a 
        href="/jobs" 
        class="py-1 px-3 bg-white text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
        View All Jobs
      </a>
    {/if}
  </div>
  
  <div class="filter-options">
    <!-- Ready to Start Filter Button -->
    <button 
      class="filter-button {filterNeedsStart ? 'selected bg-amber-gradient' : 'unselected border-amber-300'}"
      on:click={setNeedsStartFilter}
    >
      READY TO START {#if $jobsNeedingWorkStart.length}<span class="ml-1">({$jobsNeedingWorkStart.length})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.NEW ? 'selected bg-burgundy-gradient-1' : 'unselected border-burgundy-300'}"
      on:click={() => setStatusFilter(JobStatus.NEW)}
    >
      NEW {#if $jobStatusCounts[JobStatus.NEW]}<span class="ml-1">({$jobStatusCounts[JobStatus.NEW]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.SCHEDULED ? 'selected bg-burgundy-gradient-2' : 'unselected border-burgundy-300'}"
      on:click={() => setStatusFilter(JobStatus.SCHEDULED)}
    >
      SCHEDULED {#if $jobStatusCounts[JobStatus.SCHEDULED]}<span class="ml-1">({$jobStatusCounts[JobStatus.SCHEDULED]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.IN_PROGRESS ? 'selected bg-burgundy-gradient-3' : 'unselected border-burgundy-300'}"
      on:click={() => setStatusFilter(JobStatus.IN_PROGRESS)}
    >
      IN PROGRESS {#if $jobStatusCounts[JobStatus.IN_PROGRESS]}<span class="ml-1">({$jobStatusCounts[JobStatus.IN_PROGRESS]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.ON_HOLD ? 'selected bg-amber-gradient' : 'unselected border-amber-300'}"
      on:click={() => setStatusFilter(JobStatus.ON_HOLD)}
    >
      ON HOLD {#if $jobStatusCounts[JobStatus.ON_HOLD]}<span class="ml-1">({$jobStatusCounts[JobStatus.ON_HOLD]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.PENDING_COMPLETION ? 'selected bg-burgundy-gradient-4' : 'unselected border-burgundy-300'}"
      on:click={() => setStatusFilter(JobStatus.PENDING_COMPLETION)}
    >
      PENDING COMPLETION {#if $jobStatusCounts[JobStatus.PENDING_COMPLETION]}<span class="ml-1">({$jobStatusCounts[JobStatus.PENDING_COMPLETION]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.COMPLETED ? 'selected bg-purple-gradient' : 'unselected border-purple-300'}"
      on:click={() => setStatusFilter(JobStatus.COMPLETED)}
    >
      COMPLETED {#if $jobStatusCounts[JobStatus.COMPLETED]}<span class="ml-1">({$jobStatusCounts[JobStatus.COMPLETED]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.INVOICE_APPROVAL ? 'selected bg-burgundy-gradient-5' : 'unselected border-burgundy-300'}"
      on:click={() => setStatusFilter(JobStatus.INVOICE_APPROVAL)}
    >
      INVOICE APPROVAL {#if $jobStatusCounts[JobStatus.INVOICE_APPROVAL]}<span class="ml-1">({$jobStatusCounts[JobStatus.INVOICE_APPROVAL]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.INVOICED ? 'selected bg-burgundy-gradient-5' : 'unselected border-burgundy-300'}"
      on:click={() => setStatusFilter(JobStatus.INVOICED)}
    >
      INVOICED {#if $jobStatusCounts[JobStatus.INVOICED]}<span class="ml-1">({$jobStatusCounts[JobStatus.INVOICED]})</span>{/if}
    </button>
    
    <button 
      class="filter-button {selectedStatusFilter === JobStatus.PAID ? 'selected bg-emerald-gradient' : 'unselected border-emerald-300'}"
      on:click={() => setStatusFilter(JobStatus.PAID)}
    >
      PAID {#if $jobStatusCounts[JobStatus.PAID]}<span class="ml-1">({$jobStatusCounts[JobStatus.PAID]})</span>{/if}
    </button>
  </div>
  
  {#if selectedStatusFilter || filterNeedsStart}
    <div class="mt-2 flex justify-end">
      <button 
        class="text-sm text-white hover:underline flex items-center"
        on:click={resetFilters}
      >
        <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear Filter
      </button>
    </div>
  {/if}
</div>

<div>
  {#if $isLoading}
    <div class="bg-white/80 p-8 text-center rounded-lg border border-gray-200 shadow-sm">
      <p class="text-gray-600">Loading jobs...</p>
    </div>
  {:else if $jobs.length === 0}
    <div class="bg-white/80 p-8 text-center rounded-lg border border-gray-200 shadow-sm">
      <p class="text-gray-600">No jobs found in the system.</p>
    </div>
  {:else if filteredDashboardJobs.length === 0}
    <div class="bg-white/80 p-8 text-center rounded-lg border border-gray-200 shadow-sm">
      {#if filterNeedsStart}
        <p class="text-gray-600">No jobs ready to start found.</p>
      {:else}
        <p class="text-gray-600">No jobs with status "{selectedStatusFilter?.replace(/_/g, ' ')}" found.</p>
      {/if}
      <button 
        on:click={resetFilters}
        class="mt-4 text-blue-600 hover:text-blue-800 font-medium"
      >
        Show all jobs
      </button>
    </div>
  {:else}
    <JobList jobs={filteredDashboardJobs} />
  {/if}
</div> 