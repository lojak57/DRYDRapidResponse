<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts, jobs } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus, type Job } from '$lib/types/Job';
  import Logo from '$lib/components/common/Logo.svelte';
  import TechJobFocusWidget from '$lib/components/dashboard/TechJobFocusWidget.svelte';
  import AdminControlsWidget from '$lib/components/dashboard/AdminControlsWidget.svelte';
  import { onMount } from 'svelte';
  
  // Animation variables
  let animated = false;
  
  onMount(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      animated = true;
    }, 100);
  });
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
  $: isAdmin = $currentUser?.role === Role.ADMIN;
  
  // Safely filter jobs by checking for nulls/undefined
  function safeFilter(jobArray: Job[] | undefined | null, statusCheck: JobStatus): Job[] {
    if (!jobArray || !Array.isArray(jobArray)) return [];
    return jobArray.filter(job => job && job.status === statusCheck);
  }
  
  // Filter jobs for each category with added safety checks
  $: newJobs = safeFilter($jobs, JobStatus.NEW);
  $: scheduledJobs = safeFilter($jobs, JobStatus.SCHEDULED);
  $: inProgressJobs = safeFilter($jobs, JobStatus.IN_PROGRESS);
  $: onHoldJobs = safeFilter($jobs, JobStatus.ON_HOLD);
  $: pendingCompletionJobs = safeFilter($jobs, JobStatus.PENDING_COMPLETION);
  $: completedJobs = safeFilter($jobs, JobStatus.COMPLETED);
  $: invoiceApprovalJobs = safeFilter($jobs, JobStatus.INVOICE_APPROVAL);
  $: invoicedJobs = safeFilter($jobs, JobStatus.INVOICED);
  $: paidJobs = safeFilter($jobs, JobStatus.PAID);
  $: cancelledJobs = safeFilter($jobs, JobStatus.CANCELLED);
  
  // Calculate performance metrics safely
  $: totalActiveJobs = (inProgressJobs?.length || 0) + (pendingCompletionJobs?.length || 0) + (scheduledJobs?.length || 0);
  $: totalCompletedJobs = (completedJobs?.length || 0) + (invoiceApprovalJobs?.length || 0) + (invoicedJobs?.length || 0) + (paidJobs?.length || 0);
  
  // Get current date for welcome message
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Job category configurations for the cards
  const jobCategories = [
    {
      title: "New Jobs",
      count: newJobs?.length || 0,
      icon: "M12 4v16m8-8H4",
      bgColors: "bg-teal-gradient-1",
      textColor: "teal",
      headerClass: "card-header-teal-1",
      buttonClass: "btn-teal-1",
      status: JobStatus.NEW,
      priority: 1
    },
    {
      title: "Scheduled",
      count: scheduledJobs?.length || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      bgColors: "bg-teal-gradient-2",
      textColor: "teal",
      headerClass: "card-header-teal-2",
      buttonClass: "btn-teal-2",
      status: JobStatus.SCHEDULED,
      priority: 2
    },
    {
      title: "In Progress",
      count: inProgressJobs?.length || 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-teal-gradient-3",
      textColor: "teal",
      headerClass: "card-header-teal-3",
      buttonClass: "btn-teal-3",
      status: JobStatus.IN_PROGRESS,
      priority: 3
    },
    {
      title: "On Hold",
      count: onHoldJobs?.length || 0,
      icon: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-amber-gradient",
      textColor: "amber",
      headerClass: "card-header-amber",
      buttonClass: "btn-amber",
      status: JobStatus.ON_HOLD,
      priority: 4
    },
    {
      title: "Pending Completion",
      count: pendingCompletionJobs?.length || 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-teal-gradient-4",
      textColor: "teal",
      headerClass: "card-header-teal-4",
      buttonClass: "btn-teal-4",
      status: JobStatus.PENDING_COMPLETION,
      priority: 5
    },
    {
      title: "Completed",
      count: completedJobs?.length || 0,
      icon: "M5 13l4 4L19 7",
      bgColors: "bg-purple-gradient",
      textColor: "purple",
      headerClass: "card-header-purple",
      buttonClass: "btn-purple",
      status: JobStatus.COMPLETED,
      priority: 6
    },
    {
      title: "Invoice Approval",
      count: invoiceApprovalJobs?.length || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      bgColors: "bg-teal-gradient-5",
      textColor: "teal",
      headerClass: "card-header-teal-5",
      buttonClass: "btn-teal-5",
      status: JobStatus.INVOICE_APPROVAL,
      priority: 7
    },
    {
      title: "Invoiced",
      count: invoicedJobs?.length || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      bgColors: "bg-teal-gradient-5",
      textColor: "teal",
      headerClass: "card-header-teal-5",
      buttonClass: "btn-teal-5",
      status: JobStatus.INVOICED,
      priority: 8
    },
    {
      title: "Paid",
      count: paidJobs?.length || 0,
      icon: "M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-emerald-gradient",
      textColor: "emerald",
      headerClass: "card-header-emerald",
      buttonClass: "btn-emerald",
      status: JobStatus.PAID,
      priority: 9
    }
  ];

  // Filter job categories based on user role and what to show with safety checks
  $: visibleCategories = !$jobs ? [] : isTechnician 
    ? jobCategories.filter(cat => ['In Progress', 'Scheduled', 'Pending Completion'].includes(cat.title))
    : isAuthorized 
      ? jobCategories.filter(cat => cat.count > 0 || ['New Jobs', 'In Progress', 'Pending Completion', 'Invoiced'].includes(cat.title))
      : [];
      
  // Sort categories by priority
  $: sortedCategories = visibleCategories?.length ? [...visibleCategories].sort((a, b) => a.priority - b.priority) : [];
  
  // Get badge classes based on count
  function getBadgeClasses(count: number): string {
    if (!count || count === 0) return 'bg-gray-200 text-gray-600';
    if (count > 5) return 'bg-red-500 text-white animate-pulse';
    if (count > 3) return 'bg-orange-400 text-white';
    return 'bg-blue-500 text-white';
  }
</script>

<style>
  .card-enter {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  
  .card-enter.animated {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  
  .count-badge {
    transition: all 0.3s ease;
  }
  
  .count-pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .category-card {
    border-radius: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .category-card-header {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .category-card-content {
    padding: 1rem;
    background-color: white;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .action-link {
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    margin-top: auto;
  }
  
  .action-link:hover {
    transform: translateX(4px);
  }
  
  .action-link svg {
    margin-left: 0.5rem;
  }
</style>

<div class="max-w-6xl mx-auto">
  {#if $isLoading}
    <div class="flex justify-center items-center h-64">
      <p class="text-gray-500">Loading dashboard...</p>
    </div>
  {:else if $error}
    <div class="bg-red-50/90 p-6 rounded-lg border border-red-200 mb-4 card-glass">
      <h2 class="text-red-700 font-bold text-lg mb-2">Error Loading Dashboard</h2>
      <p class="text-red-700">{$error}</p>
      <button 
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
        on:click={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  {:else if $currentUser}
    <!-- Dashboard Header with Prominent Logo -->
    <div class="mb-8 text-center md:text-left">
      <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <div class="mb-4 md:mb-0">
          <Logo size="xxl" linkToDashboard={false} showText={false} logoSrc="/dryd-logo-secondary.PNG" />
        </div>
        <div class="card-glass p-4 rounded-lg card-shadow max-w-md w-full">
          <p class="text-gray-500 text-sm">{formattedDate}</p>
          <h2 class="text-xl font-bold text-gray-800">Welcome, {$currentUser.firstName}!</h2>
          <p class="text-gray-600 mt-1">
            {#if isTechnician}
              You have {inProgressJobs?.length || 0 + scheduledJobs?.length || 0} active jobs.
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {#each sortedCategories as category, i}
            <div class="card-enter {animated ? 'animated' : ''}" style="transition-delay: {i * 75}ms">
              <div class="category-card card-shadow">
                <div class="category-card-header {category.bgColors} text-white">
                  <div>
                    <h3 class="text-lg font-semibold">{category.title}</h3>
                    <p class="text-3xl font-bold mt-1">{category.count}</p>
                  </div>
                  <div class="p-3 bg-white/20 rounded-full {category.count > 0 ? 'animate-bounce' : ''}">
                    <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={category.icon}/>
                    </svg>
                  </div>
                </div>
                
                <div class="category-card-content">
                  {#if category.count > 0}
                    <span class="text-sm text-gray-600 mb-3">
                      {category.count} job{category.count !== 1 ? 's' : ''} in this category
                    </span>
                  {:else}
                    <span class="text-sm text-gray-500 mb-3">No jobs in this category</span>
                  {/if}
                  
                  <a 
                    href="/jobs?status={category.status}" 
                    class="action-link btn-teal text-sm mt-auto self-start"
                  >
                    View all {category.title.toLowerCase()}
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h1>
      {/if}
    </div>

    <!-- Quotes Section - Only visible to Admin/Office -->
    {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
      <div class="mb-6 card-glass rounded-lg card-shadow overflow-hidden">
        <div class="p-5 bg-dryd-gradient text-white">
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-xl flex items-center">
              <div class="bg-white/20 text-white p-2 rounded-lg mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Quotes</span>
            </h2>
            <a href="/quotes" class="btn-teal text-sm px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow hover:scale-105">View All</a>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <p class="text-gray-700 leading-relaxed">Create and manage quotes for potential customers. Track their status from draft to accepted or converted to jobs.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/quotes/new" class="flex items-center p-4 card-header-teal rounded-lg transition-all duration-200 group hover:shadow-md">
              <div class="bg-dryd-gradient text-white p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div class="font-semibold text-blue-800">Create a new quote</div>
                <div class="text-sm text-blue-600">Start a new customer quote</div>
              </div>
              <div class="ml-auto text-blue-500 group-hover:translate-x-1 transition-transform">→</div>
            </a>
            
            <a href="/quotes" class="flex items-center p-4 card-header-teal rounded-lg transition-all duration-200 group hover:shadow-md">
              <div class="bg-dryd-gradient text-white p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div>
                <div class="font-semibold text-blue-800">Manage existing quotes</div>
                <div class="text-sm text-blue-600">View and edit your quotes</div>
              </div>
              <div class="ml-auto text-blue-500 group-hover:translate-x-1 transition-transform">→</div>
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
    {#if isAuthorized && pendingCompletionJobs && pendingCompletionJobs.length > 0}
      <div class="mb-6">
        <div class="card-glass rounded-lg card-shadow overflow-hidden">
          <div class="p-4 card-header-teal">
            <div class="flex justify-between items-center">
              <h2 class="font-bold text-xl flex items-center text-teal-800">
                <div class="bg-teal-gradient text-white p-2 rounded-lg mr-3 shadow-sm">
                  <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Jobs Awaiting Final Completion
              </h2>
            </div>
          </div>

          <div class="p-6">
            <p class="text-gray-700 mb-4">The following jobs have been marked as ready for completion by technicians and need your review:</p>
            <div class="space-y-3">
              {#each pendingCompletionJobs as job}
                {#if job && job.id}
                  <a href="/jobs/{job.id}" class="block p-4 bg-white border border-teal-200 rounded-lg transition-colors duration-150 hover:bg-teal-50/50">
                    <div class="flex justify-between items-center">
                      <div>
                        <h3 class="font-semibold text-teal-800">{job.title}</h3>
                        <p class="text-sm text-teal-600">#{job.jobNumber}</p>
                      </div>
                      <div class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                        Ready for Review
                      </div>
                    </div>
                  </a>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Paid & Closed Jobs Section -->
    {#if isAuthorized && paidJobs && paidJobs.length > 0}
      <div class="mb-6">
        <div class="card-glass rounded-lg card-shadow overflow-hidden">
          <div class="p-4 card-header-emerald">
            <div class="flex justify-between items-center">
              <h2 class="font-bold text-xl flex items-center text-emerald-800">
                <div class="bg-emerald-gradient text-white p-2 rounded-lg mr-3 shadow-sm">
                  <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Paid & Closed Jobs
              </h2>
            </div>
          </div>

          <div class="p-6">
            <p class="text-gray-700 mb-4">These jobs have been completed, invoiced, and payment has been received:</p>
            <div class="space-y-3">
              {#each paidJobs as job}
                {#if job && job.id}
                  <a href="/jobs/{job.id}" class="block p-4 bg-white border border-emerald-200 rounded-lg transition-colors duration-150 hover:bg-emerald-50/50">
                    <div class="flex justify-between items-center">
                      <div>
                        <h3 class="font-semibold text-emerald-800">{job.title}</h3>
                        <p class="text-sm text-emerald-600">#{job.jobNumber}</p>
                      </div>
                      <div class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                        Paid
                      </div>
                    </div>
                    {#if job.payment}
                      <div class="mt-2 text-sm text-emerald-700">
                        <span class="font-medium">Paid:</span> ${job.payment.amount.toFixed(2)} via {job.payment.method} 
                        on {new Date(job.payment.date).toLocaleDateString()}
                      </div>
                    {/if}
                  </a>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Jobs Section -->
    <div class="card-glass rounded-lg card-shadow overflow-hidden mb-6">
      <div class="p-5 bg-slate-gradient text-white">
        <div class="flex justify-between items-center">
          <h2 class="font-bold text-xl flex items-center">
            <div class="bg-white/20 text-white p-2 rounded-lg mr-3 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span>{#if $currentUser && $currentUser.role === Role.TECH}My Assigned Jobs{:else}Active Jobs{/if}</span>
          </h2>
          <a href="/jobs" class="btn-teal text-sm px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow hover:scale-105">View All</a>
        </div>
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
        {:else if !$dashboardJobs || $dashboardJobs.length === 0}
          <div class="bg-gray-50/90 p-8 text-center rounded-lg border border-gray-200">
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