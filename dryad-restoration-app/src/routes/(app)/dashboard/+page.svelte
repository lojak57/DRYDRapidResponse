<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts, jobs } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus } from '$lib/types/Job';
  import type { Job } from '$lib/types/Job';
  import Logo from '$lib/components/common/Logo.svelte';
  import TechJobFocusWidget from '$lib/components/dashboard/TechJobFocusWidget.svelte';
  import AdminControlsWidget from '$lib/components/dashboard/AdminControlsWidget.svelte';
  import CategoryCard from '$lib/components/dashboard/CategoryCard.svelte';
  import { onMount } from 'svelte';
  
  // Animation variables
  let animated = false;
  
  onMount(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      animated = true;
    }, 100);
    
    // Log loaded jobs
    console.log('Dashboard mounted, jobs length:', $jobs?.length);
    if ($jobs?.length) {
      // Log specific job status values to debug
      const statusCounts = {};
      $jobs.forEach(job => {
        statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
      });
      console.log('Job status counts:', statusCounts);
      
      // Log the expected JobStatus enum values
      console.log('JobStatus enum values:', Object.values(JobStatus));
      
      // Check the first few jobs with their full status info
      console.log('Sample jobs with status details:', $jobs.slice(0, 3).map(j => ({
        id: j.id,
        title: j.title,
        status: j.status,
        statusMatches: Object.values(JobStatus).includes(j.status)
      })));
    }
  });
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
  $: isAdmin = $currentUser?.role === Role.ADMIN;
  
  // Safely filter jobs by checking for nulls/undefined
  function safeFilter(jobArray: Job[] | null | undefined, statusCheck: JobStatus): Job[] {
    if (!jobArray || !Array.isArray(jobArray)) return [];
    
    // Debug job status values 
    if (statusCheck === JobStatus.NEW && !jobArray.some(job => job.status === statusCheck)) {
      console.log('No jobs matching status:', statusCheck);
      console.log('Available job statuses:', [...new Set(jobArray.map(j => j.status))]);
    }
    
    // The issue might be that the job type field in the JSON is "jobType" instead of "type"
    // And similarly, "siteAddress" instead of "location"
    const result = jobArray.filter(job => {
      if (!job) return false;
      return job.status === statusCheck;
    });
    
    console.log(`Found ${result.length} jobs with status ${statusCheck}`);
    return result;
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
      textColor: "blue",
      status: JobStatus.NEW,
      priority: 1
    },
    {
      title: "Scheduled",
      count: scheduledJobs?.length || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      textColor: "cyan",
      status: JobStatus.SCHEDULED,
      priority: 2
    },
    {
      title: "In Progress",
      count: inProgressJobs?.length || 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      textColor: "green",
      status: JobStatus.IN_PROGRESS,
      priority: 3
    },
    {
      title: "On Hold",
      count: onHoldJobs?.length || 0,
      icon: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z",
      textColor: "orange",
      status: JobStatus.ON_HOLD,
      priority: 4
    },
    {
      title: "Pending Completion",
      count: pendingCompletionJobs?.length || 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      textColor: "lime",
      status: JobStatus.PENDING_COMPLETION,
      priority: 5
    },
    {
      title: "Completed",
      count: completedJobs?.length || 0,
      icon: "M5 13l4 4L19 7",
      textColor: "purple",
      status: JobStatus.COMPLETED,
      priority: 6
    },
    {
      title: "Invoice Approval",
      count: invoiceApprovalJobs?.length || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      textColor: "pink",
      status: JobStatus.INVOICE_APPROVAL,
      priority: 7
    },
    {
      title: "Invoiced",
      count: invoicedJobs?.length || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      textColor: "amber",
      status: JobStatus.INVOICED,
      priority: 8
    },
    {
      title: "Paid",
      count: paidJobs?.length || 0,
      icon: "M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      textColor: "emerald",
      status: JobStatus.PAID,
      priority: 9
    }
  ];

  function getCountForStatus(status: JobStatus): number {
    switch (status) {
      case JobStatus.NEW: return newJobs?.length || 0;
      case JobStatus.SCHEDULED: return scheduledJobs?.length || 0;
      case JobStatus.IN_PROGRESS: return inProgressJobs?.length || 0;
      case JobStatus.ON_HOLD: return onHoldJobs?.length || 0;
      case JobStatus.PENDING_COMPLETION: return pendingCompletionJobs?.length || 0;
      case JobStatus.COMPLETED: return completedJobs?.length || 0;
      case JobStatus.INVOICE_APPROVAL: return invoiceApprovalJobs?.length || 0;
      case JobStatus.INVOICED: return invoicedJobs?.length || 0;
      case JobStatus.PAID: return paidJobs?.length || 0;
      case JobStatus.CANCELLED: return cancelledJobs?.length || 0;
      default: return 0;
    }
  }

  // Filter job categories based on user role and what to show with safety checks
  $: visibleCategories = !$jobs ? [] : isTechnician 
    ? jobCategories.filter(cat => ['In Progress', 'Scheduled', 'Pending Completion'].includes(cat.title))
    : isAuthorized 
      ? jobCategories.map(cat => {
          const freshCount = getCountForStatus(cat.status);
          console.log(`Category ${cat.title}, status ${cat.status}: count = ${freshCount}`);
          
          return {
            ...cat,
            count: freshCount
          };
        }).filter(cat => cat.count > 0 || ['New Jobs', 'In Progress', 'Pending Completion', 'Invoiced'].includes(cat.title))
      : [];
      
  // Sort categories by priority
  $: sortedCategories = visibleCategories?.length ? [...visibleCategories].sort((a, b) => a.priority - b.priority) : [];

  // Debug output of what's actually being displayed
  $: {
    if (sortedCategories.length > 0) {
      console.log('Sorted categories with counts that will be displayed:', 
        sortedCategories.map(c => ({ title: c.title, count: c.count }))
      );
    }
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
            <CategoryCard 
              title={category.title} 
              count={category.count} 
              icon={category.icon} 
              status={category.status} 
              textColor={category.textColor}
              animated={animated}
              transitionDelay={i * 75}
            />
          {/each}
        </div>
      {:else}
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h1>
      {/if}
    </div>

    <!-- Quotes Section - Only visible to Admin/Office -->
    {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
      <div class="mb-6 card-glass rounded-lg card-shadow overflow-hidden">
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
            <a href="/quotes/new" class="flex items-center p-4 bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 rounded-lg transition-all duration-200 group hover:shadow-md">
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
            
            <a href="/quotes" class="flex items-center p-4 bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 rounded-lg transition-all duration-200 group hover:shadow-md">
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
    {#if isAuthorized && pendingCompletionJobs && pendingCompletionJobs.length > 0}
      <div class="mb-6">
        <div class="card-glass rounded-lg card-shadow overflow-hidden">
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

          <div class="p-6">
            <p class="text-gray-700 mb-4">The following jobs have been marked as ready for completion by technicians and need your review:</p>
            <div class="space-y-3">
              {#each pendingCompletionJobs as job}
                {#if job && job.id}
                  <a href="/jobs/{job.id}" class="block p-4 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200 rounded-lg transition-colors duration-150">
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

          <div class="p-6">
            <p class="text-gray-700 mb-4">These jobs have been completed, invoiced, and payment has been received:</p>
            <div class="space-y-3">
              {#each paidJobs as job}
                {#if job && job.id}
                  <a href="/jobs/{job.id}" class="block p-4 bg-green-50/80 hover:bg-green-100/90 border border-green-200 rounded-lg transition-colors duration-150">
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
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Jobs Section -->
    <div class="card-glass rounded-lg card-shadow overflow-hidden mb-6">
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