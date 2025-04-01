<script lang="ts">
  import { onMount } from 'svelte';
  import { jobs, loadJobs, isLoading, error } from '$lib/stores/jobStore';
  import { JobStatus } from '$lib/types/Job';
  import type { Job } from '$lib/types/Job';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let loading = true;
  
  // Get status from URL if available
  $: statusFilter = $page.url.searchParams.get('status') as JobStatus | null;
  
  // Filter jobs based on status parameter
  $: filteredJobs = statusFilter 
    ? $jobs.filter(job => job && job.status === statusFilter)
    : [...$jobs];
  
  // Status mapping for display
  const statusLabels: Record<JobStatus, string> = {
    [JobStatus.NEW]: 'New',
    [JobStatus.SCHEDULED]: 'Scheduled',
    [JobStatus.IN_PROGRESS]: 'In Progress',
    [JobStatus.ON_HOLD]: 'On Hold',
    [JobStatus.PENDING_COMPLETION]: 'Pending Completion',
    [JobStatus.COMPLETED]: 'Completed',
    [JobStatus.INVOICE_APPROVAL]: 'Invoice Approval',
    [JobStatus.INVOICED]: 'Invoiced',
    [JobStatus.PAID]: 'Paid',
    [JobStatus.CANCELLED]: 'Cancelled'
  };
  
  // Status colors for display
  const statusColors: Record<JobStatus, string> = {
    [JobStatus.NEW]: 'blue',
    [JobStatus.SCHEDULED]: 'cyan',
    [JobStatus.IN_PROGRESS]: 'green',
    [JobStatus.ON_HOLD]: 'orange',
    [JobStatus.PENDING_COMPLETION]: 'lime',
    [JobStatus.COMPLETED]: 'purple',
    [JobStatus.INVOICE_APPROVAL]: 'pink',
    [JobStatus.INVOICED]: 'amber',
    [JobStatus.PAID]: 'emerald',
    [JobStatus.CANCELLED]: 'red'
  };

  // Track current status counts
  $: statusCounts = Object.values(JobStatus).reduce((acc, status) => {
    acc[status] = $jobs.filter(job => job && job.status === status).length;
    return acc;
  }, {} as Record<JobStatus, number>);
  
  onMount(async () => {
    console.log('Jobs page loading...');
    await loadJobs();
    loading = false;
    console.log('Jobs loaded:', $jobs?.length || 0, 'jobs');
  });

  // Change status filter
  function setStatusFilter(status: JobStatus | null) {
    if (status) {
      goto(`/jobs?status=${status}`);
    } else {
      goto('/jobs');
    }
  }
</script>

<div class="max-w-6xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Jobs</h1>
  
  <!-- Status Filter Pills -->
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-2 overflow-x-auto">
    <button 
      on:click={() => setStatusFilter(null)}
      class="px-4 py-2 rounded-full text-sm font-medium transition-colors {!statusFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
    >
      All Jobs <span class="ml-1 opacity-75">({$jobs?.length || 0})</span>
    </button>
    
    {#each Object.entries(statusLabels) as [status, label]}
      <button 
        on:click={() => setStatusFilter(status as JobStatus)}
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors {statusFilter === status ? `bg-${statusColors[status as JobStatus]}-500 text-white` : `bg-${statusColors[status as JobStatus]}-100 text-${statusColors[status as JobStatus]}-800 hover:bg-${statusColors[status as JobStatus]}-200`}"
      >
        {label} <span class="ml-1 opacity-75">({statusCounts[status as JobStatus] || 0})</span>
      </button>
    {/each}
  </div>
  
  <!-- Loading State -->
  {#if $isLoading || loading}
    <div class="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p class="text-gray-500">Loading jobs...</p>
      </div>
    </div>
  
  <!-- Error State -->
  {:else if $error}
    <div class="bg-red-50 p-8 text-center rounded-lg border border-red-200 shadow-md">
      <p class="text-red-600 font-medium">{$error}</p>
      <button 
        on:click={() => loadJobs()}
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  
  <!-- No Jobs Found -->
  {:else if !filteredJobs || filteredJobs.length === 0}
    <div class="bg-white p-8 text-center rounded-lg border border-gray-200 shadow-md">
      <p class="text-gray-600">No jobs found {statusFilter ? `with status "${statusLabels[statusFilter]}"` : ''}.</p>
      {#if statusFilter}
        <button 
          on:click={() => setStatusFilter(null)} 
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Show All Jobs
        </button>
      {/if}
    </div>
  
  <!-- Jobs List -->
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each filteredJobs as job}
        {#if job}
          <a href="/jobs/{job.id}" class="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-lg font-semibold">{job.title}</h2>
                <p class="text-sm text-gray-500">#{job.jobNumber}</p>
              </div>
              <div class="bg-{statusColors[job.status]}-100 text-{statusColors[job.status]}-800 px-3 py-1 rounded-full text-sm font-medium">
                {statusLabels[job.status]}
              </div>
            </div>
            
            <div class="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Customer:</p>
                <p class="text-sm">ID: {job.customerId || 'Not specified'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Created:</p>
                <p class="text-sm">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {#if job.description}
              <div class="mt-2">
                <p class="text-sm text-gray-700 line-clamp-2">{job.description}</p>
              </div>
            {/if}
          </a>
        {/if}
      {/each}
    </div>
  {/if}
</div>