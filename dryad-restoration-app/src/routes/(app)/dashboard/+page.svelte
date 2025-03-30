<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus } from '$lib/types/Job';
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-8">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h1>
    
    <!-- Job Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#if isTechnician}
        <!-- Technician-specific stats -->
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-3xl font-bold text-blue-600 mb-1">{$userJobCounts?.assigned || 0}</div>
            <div class="text-gray-600 font-medium flex items-center">
              <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Jobs
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-3xl font-bold text-amber-600 mb-1">{$userJobCounts?.active || 0}</div>
            <div class="text-gray-600 font-medium flex items-center">
              <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              In Progress
            </div>
          </div>
        </div>
        
        <div class="md:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-lg font-medium text-gray-700 mb-2">You are assigned to {$userJobCounts?.assigned || 0} job{$userJobCounts?.assigned !== 1 ? 's' : ''}</div>
            <div class="text-sm text-gray-500">
              {#if $userJobCounts?.active > 0}
                {$userJobCounts?.active} job{$userJobCounts?.active !== 1 ? 's' : ''} currently in progress
              {:else}
                No active jobs at the moment
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <!-- Admin/Office stats -->
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-3xl font-bold text-blue-600 mb-1">{$jobStatusCounts?.NEW || 0}</div>
            <div class="text-gray-600 font-medium flex items-center">
              <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              New
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-3xl font-bold text-amber-600 mb-1">{$jobStatusCounts?.IN_PROGRESS || 0}</div>
            <div class="text-gray-600 font-medium flex items-center">
              <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-3xl font-bold text-green-600 mb-1">{$jobStatusCounts?.COMPLETED || 0}</div>
            <div class="text-gray-600 font-medium flex items-center">
              <svg class="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
          <div class="flex flex-col items-center">
            <div class="text-3xl font-bold text-dryd-blue mb-1">{$jobStatusCounts?.total || 0}</div>
            <div class="text-gray-600 font-medium flex items-center">
              <svg class="w-4 h-4 mr-1 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Total
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Quotes Section -->
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
              href="/quotes/new" 
              class="inline-flex items-center bg-dryd-blue text-white hover:bg-dryd-blue-dark px-4 py-2 rounded-md shadow-sm font-bold border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              New Quote
            </a>
            <a 
              href="/jobs/new" 
              class="inline-flex items-center bg-dryd-blue text-white hover:bg-dryd-blue-dark px-4 py-2 rounded-md shadow-sm font-bold border border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Job
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
</div> 