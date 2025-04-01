<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus } from '$lib/types/Job';
  import Logo from '$lib/components/common/Logo.svelte';
  import TechJobFocusWidget from '$lib/components/dashboard/TechJobFocusWidget.svelte';
  import AdminControlsWidget from '$lib/components/dashboard/AdminControlsWidget.svelte';
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
  $: isAdmin = $currentUser?.role === Role.ADMIN;
  
  // Filter jobs that are pending completion
  $: pendingCompletionJobs = $dashboardJobs.filter(job => job.status === JobStatus.PENDING_COMPLETION);
  
  // Filter jobs that are paid and closed
  $: paidJobs = $dashboardJobs.filter(job => job.status === JobStatus.PAID);
  
  // Calculate performance metrics
  $: totalActiveJobs = ($jobStatusCounts?.IN_PROGRESS || 0) + ($jobStatusCounts?.PENDING_COMPLETION || 0);
  $: totalCompletedJobs = ($jobStatusCounts?.COMPLETED || 0) + ($jobStatusCounts?.INVOICE_APPROVAL || 0) +
                         ($jobStatusCounts?.INVOICED || 0) + ($jobStatusCounts?.PAID || 0);
  
  // Get current date for welcome message
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
</script>

<div class="max-w-6xl mx-auto">
  {#if $currentUser}
    <!-- Dashboard Header with Prominent Logo -->
    <div class="mb-8 text-center md:text-left">
      <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <div class="mb-4 md:mb-0">
          <Logo size="xxl" linkToDashboard={false} showText={false} logoSrc="/dryd-logo-secondary.PNG" />
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200 max-w-md w-full">
          <p class="text-gray-500 text-sm">{formattedDate}</p>
          <h2 class="text-xl font-bold text-gray-800">Welcome, {$currentUser.firstName}!</h2>
          <p class="text-gray-600 mt-1">
            {#if isTechnician}
              You have {$userJobCounts?.assigned || 0} assigned jobs.
            {:else}
              There are {totalActiveJobs} active jobs requiring attention.
            {/if}
          </p>
        </div>
      </div>
      
      {#if isTechnician}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">My Dashboard</h1>
        <!-- Technician-specific Dashboard -->
        <TechJobFocusWidget />
      {:else if isAuthorized}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Company Dashboard</h1>
        
        <!-- Key Performance Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-700">New Jobs</p>
                <p class="text-3xl font-bold text-blue-800">{$jobStatusCounts?.NEW || 0}</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <a href="/jobs?status=NEW" class="text-xs text-blue-700 hover:underline inline-flex items-center">
                View all new jobs
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-md border border-green-100 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-green-700">Active Jobs</p>
                <p class="text-3xl font-bold text-green-800">{totalActiveJobs}</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <a href="/jobs?status=IN_PROGRESS" class="text-xs text-green-700 hover:underline inline-flex items-center">
                View all active jobs
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md border border-purple-100 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-purple-700">Completed</p>
                <p class="text-3xl font-bold text-purple-800">{totalCompletedJobs}</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <a href="/jobs?status=COMPLETED" class="text-xs text-purple-700 hover:underline inline-flex items-center">
                View completed jobs
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-md border border-amber-100 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-amber-700">Invoiced</p>
                <p class="text-3xl font-bold text-amber-800">{($jobStatusCounts?.INVOICED || 0) + ($jobStatusCounts?.INVOICE_APPROVAL || 0)}</p>
              </div>
              <div class="bg-amber-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
            </div>
            <div class="mt-2">
              <a href="/jobs?status=INVOICED" class="text-xs text-amber-700 hover:underline inline-flex items-center">
                View invoiced jobs
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      {:else}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h1>
      {/if}
    </div>

    <!-- Quotes Section - Only visible to Admin/Office -->
    {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
      <div class="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div class="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-xl flex items-center">
              <div class="bg-white text-blue-600 p-2 rounded-lg mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Quotes</span>
            </h2>
            <a href="/quotes" class="text-sm bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow hover:scale-105">View All</a>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <p class="text-gray-700 leading-relaxed">Create and manage quotes for potential customers. Track their status from draft to accepted or converted to jobs.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/quotes/new" class="flex items-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 group hover:shadow-md">
              <div class="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div class="font-semibold">Create a new quote</div>
                <div class="text-sm text-blue-600">Start a new customer quote</div>
              </div>
              <div class="ml-auto text-blue-500 group-hover:translate-x-1 transition-transform">→</div>
            </a>
            
            <a href="/quotes" class="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all duration-200 group hover:shadow-md">
              <div class="bg-indigo-100 p-3 rounded-full mr-4 group-hover:bg-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <div class="font-semibold">Manage existing quotes</div>
                <div class="text-sm text-indigo-600">View and edit your quotes</div>
              </div>
              <div class="ml-auto text-indigo-500 group-hover:translate-x-1 transition-transform">→</div>
            </a>
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

    <!-- Paid & Closed Jobs Section -->
    {#if isAuthorized && paidJobs.length > 0}
      <div class="mb-6">
        <div class="bg-white rounded-lg shadow-lg border border-green-300 overflow-hidden">
          <div class="p-4 bg-green-100 text-green-800 border-b border-green-300">
            <div class="flex justify-between items-center">
              <h2 class="font-bold text-xl flex items-center">
                <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Paid & Closed Jobs
              </h2>
            </div>
          </div>

          <div class="p-6 bg-white">
            <p class="text-gray-700 mb-4">These jobs have been completed, invoiced, and payment has been received:</p>
            <div class="space-y-3">
              {#each paidJobs as job}
                <a href="/jobs/{job.id}" class="block p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors duration-150">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-semibold text-green-800">{job.title}</h3>
                      <p class="text-sm text-green-600">#{job.jobNumber}</p>
                    </div>
                    <div class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Paid
                    </div>
                  </div>
                  {#if job.payment}
                    <div class="mt-2 text-sm text-green-700">
                      <span class="font-medium">Paid:</span> ${job.payment.amount.toFixed(2)} via {job.payment.method} 
                      on {new Date(job.payment.date).toLocaleDateString()}
                    </div>
                  {/if}
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Jobs Section -->
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-6">
      <div class="p-5 bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xl flex items-center">
            <div class="bg-white text-gray-800 p-2 rounded-lg mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span>{#if $currentUser && $currentUser.role === Role.TECH}My Assigned Jobs{:else}Active Jobs{/if}</span>
          </h2>
          <a href="/jobs" class="text-sm bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow hover:scale-105">View All</a>
        </div>
      </div>

      <div class="p-6">
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