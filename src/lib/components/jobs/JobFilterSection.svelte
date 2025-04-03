<!-- Job Filter Section -->
<script lang="ts">
  import { dashboardJobs, isLoading, error, jobs } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus } from '$lib/types/Job';
  import JobList from './JobList.svelte';
  
  // Props
  export let selectedStatusFilter: string | null = null;
  export let showViewAllButton = true;
  
  // Function to reset the filter
  function resetFilter() {
    selectedStatusFilter = null;
  }
  
  // Function to set the filter
  function setStatusFilter(status: string) {
    selectedStatusFilter = status === selectedStatusFilter ? null : status;
  }
  
  // Get filtered dashboard jobs
  $: filteredDashboardJobs = selectedStatusFilter 
    ? $dashboardJobs.filter(job => job.status === selectedStatusFilter)
    : $dashboardJobs;
  
  // Track available statuses (statuses that have jobs)
  $: availableStatuses = $jobs 
    ? Object.values(JobStatus)
        .filter(status => status !== JobStatus.CANCELLED)
        .filter(status => $jobs.some(job => job.status === status))
    : [];
  
  // Check if user is authorized
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
</script>

<div class="card-glass rounded-lg card-shadow overflow-hidden mb-6">
  <div class="p-5 bg-dryd-gradient text-white">
    <div class="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
      <div class="flex items-center">
        <div class="bg-white/20 text-white p-2 rounded-lg mr-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span class="font-bold text-xl">Job Filter</span>
      </div>
      <div class="flex items-center space-x-2">
        {#if isAuthorized}
          {#if selectedStatusFilter}
            <button 
              on:click={resetFilter}
              class="bg-white/10 border-white text-white text-sm px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:bg-white/20"
            >
              Show All
            </button>
          {/if}
        {/if}
        {#if showViewAllButton}
          <a href="/jobs" class="btn-light-blue text-sm px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow hover:scale-105">View All Jobs</a>
        {/if}
      </div>
    </div>
    
    <!-- Job Status Filter - Only visible to Admin/Office -->
    {#if isAuthorized}
      <div class="mt-4 flex overflow-x-auto pb-2 scrollbar-hide">
        <div class="flex space-x-2">
          {#each availableStatuses as status}
            <button 
              class="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors duration-150
              {selectedStatusFilter === status 
                ? 'bg-teal-gradient border-white text-white' 
                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40'}"
              on:click={() => setStatusFilter(status)}
            >
              {status.replace(/_/g, ' ')}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="p-6">
    {#if $isLoading}
      <div class="flex justify-center items-center h-64">
        <p class="text-gray-500">Loading jobs...</p>
      </div>
    {:else if $error}
      <div class="bg-red-50/90 p-6 rounded-lg border border-red-200 mb-4">
        <p class="text-red-700">{$error}</p>
      </div>
    {:else if !filteredDashboardJobs || filteredDashboardJobs.length === 0}
      <div class="bg-gray-50/90 p-8 text-center rounded-lg border border-gray-200">
        {#if selectedStatusFilter}
          <p class="text-gray-600">No jobs found with status "{selectedStatusFilter.replace(/_/g, ' ')}".</p>
          <button 
            on:click={resetFilter}
            class="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Show all jobs
          </button>
        {:else if isTechnician}
          <p class="text-gray-600">You don't have any jobs assigned to you yet.</p>
        {:else}
          <p class="text-gray-600">No active jobs found.</p>
        {/if}
      </div>
    {:else}
      <JobList jobs={filteredDashboardJobs} />
    {/if}
  </div>
</div> 