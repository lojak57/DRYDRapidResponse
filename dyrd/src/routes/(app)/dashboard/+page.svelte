<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus } from '$lib/types/Job';
  import StatsSummaryWidget from '$lib/components/dashboard/StatsSummaryWidget.svelte';
  import TechJobFocusWidget from '$lib/components/dashboard/TechJobFocusWidget.svelte';
  import AdminControlsWidget from '$lib/components/dashboard/AdminControlsWidget.svelte';
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
  $: isAdmin = $currentUser?.role === Role.ADMIN;
  
  // Filter jobs that are pending completion
  $: pendingCompletionJobs = $dashboardJobs.filter(job => job.status === JobStatus.PENDING_COMPLETION);
</script>

<div class="max-w-6xl mx-auto">
  {#if $currentUser}
    <div class="mb-8">
      {#if isTechnician}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">My Dashboard</h1>
        <!-- Technician-specific Dashboard -->
        <TechJobFocusWidget />
      {:else if isAuthorized}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Company Dashboard</h1>
        <!-- Admin/Office Dashboard -->
        <StatsSummaryWidget />
      {:else}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h1>
      {/if}
    </div>

    <!-- Quotes Section - Only visible to Admin/Office -->
    {#if isAuthorized}
      <div class="mb-6">
        <div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
          <div class="p-4 bg-dryd-gradient text-white">
            <div class="flex justify-between items-center">
              <h2 class="font-bold text-xl flex items-center">
                <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quotes
              </h2>
              
              <div class="flex space-x-2">
                <a 
                  href="/quotes/new" 
                  class="inline-flex items-center bg-dryd-blue text-white hover:bg-dryd-blue-dark px-4 py-2 rounded-md shadow-sm font-bold border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Quote
                </a>
                <a 
                  href="/quotes" 
                  class="inline-flex items-center bg-dryd-blue text-white hover:bg-dryd-blue-dark px-4 py-2 rounded-md shadow-sm font-bold border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  View All Quotes
                </a>
              </div>
            </div>
          </div>

          <div class="p-6 bg-gray-50">
            <div class="mb-4">
              <p class="text-gray-700">Create and manage quotes for potential customers. Track their status from draft to accepted or converted to jobs.</p>
            </div>
            <div class="flex space-x-4">
              <a href="/quotes/new" class="text-dryd-blue hover:text-dryd-blue-dark font-medium">Create a new quote →</a>
              <a href="/quotes" class="text-dryd-blue hover:text-dryd-blue-dark font-medium">Manage existing quotes →</a>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Admin Controls - Only visible to Admin -->
    {#if isAdmin}
      <div class="mb-6">
        <AdminControlsWidget />
      </div>
    {/if}

    <!-- Pending Completion Jobs - Only visible to Admin/Office -->
    {#if isAuthorized && pendingCompletionJobs.length > 0}
      <div class="mb-6">
        <div class="bg-white rounded-lg shadow-lg border border-blue-300 overflow-hidden">
          <div class="p-4 bg-blue-100 text-blue-800 border-b border-blue-300">
            <div class="flex justify-between items-center">
              <h2 class="font-bold text-xl flex items-center">
                <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Jobs Awaiting Final Completion
              </h2>
            </div>
          </div>

          <div class="p-6 bg-white">
            <p class="text-gray-700 mb-4">The following jobs have been marked as ready for completion by technicians and need your review:</p>
            <div class="space-y-3">
              {#each pendingCompletionJobs as job}
                <a href="/jobs/{job.id}" class="block p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-150">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-semibold text-blue-800">{job.title}</h3>
                      <p class="text-sm text-blue-600">#{job.jobNumber}</p>
                    </div>
                    <div class="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Ready for Review
                    </div>
                  </div>
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Jobs Section -->
    <div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
      <div class="p-4 bg-dryd-gradient text-white">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xl flex items-center">
            <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {#if isTechnician}
              My Assigned Jobs
            {:else}
              Active Jobs
            {/if}
          </h2>
          
          {#if isAuthorized}
            <div class="flex space-x-2">
              <a 
                href="/jobs/new" 
                class="inline-flex items-center bg-dryd-blue text-white hover:bg-dryd-blue-dark px-4 py-2 rounded-md shadow-sm font-bold border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Job
              </a>
              <a 
                href="/jobs" 
                class="inline-flex items-center bg-dryd-blue text-white hover:bg-dryd-blue-dark px-4 py-2 rounded-md shadow-sm font-bold border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View All Jobs
              </a>
            </div>
          {/if}
        </div>
      </div>

      <div class="p-6 bg-gray-50">
        {#if $isLoading}
          <div class="flex justify-center items-center h-64">
            <p class="text-gray-500">Loading jobs...</p>
          </div>
        {:else if $error}
          <div class="bg-red-50 p-6 rounded-lg border border-red-200 mb-4">
            <p class="text-red-700">{$error}</p>
          </div>
        {:else if $dashboardJobs.length === 0}
          <div class="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
            {#if isTechnician}
              <p class="text-gray-600">You don't have any jobs assigned to you yet.</p>
            {:else}
              <p class="text-gray-600">No active jobs found.</p>
            {/if}
          </div>
        {:else}
          <JobList jobs={$dashboardJobs} />
        {/if}
      </div>
    </div>
  {:else}
    <!-- Loading or not authenticated state -->
    <div class="flex justify-center items-center h-64">
      <p class="text-gray-500">Loading dashboard...</p>
    </div>
  {/if}
</div> 