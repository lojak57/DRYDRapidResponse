<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts, jobs } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus, type Job } from '$lib/types/Job';
  import Logo from '$lib/components/common/Logo.svelte';
  import TechJobFocusWidget from '$lib/components/dashboard/TechJobFocusWidget.svelte';
  import TechJobFilter from '$lib/components/dashboard/TechJobFilter.svelte';
  import AdminControlsWidget from '$lib/components/dashboard/AdminControlsWidget.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // Animation variables
  let animated = false;
  
  // Job status filter
  let selectedStatusFilter: string | null = null;
  
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
  
  // Job category configurations for the cards
  const jobCategories = [
    {
      title: "New Jobs",
      count: newJobs?.length || 0,
      icon: "M12 4v16m8-8H4",
      bgColors: "bg-burgundy-gradient-1",
      textColor: "pink",
      headerClass: "card-header-burgundy-1",
      buttonClass: "btn-burgundy-1",
      status: JobStatus.NEW,
      priority: 1
    },
    {
      title: "Scheduled",
      count: scheduledJobs?.length || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      bgColors: "bg-burgundy-gradient-2",
      textColor: "pink",
      headerClass: "card-header-burgundy-2",
      buttonClass: "btn-burgundy-2",
      status: JobStatus.SCHEDULED,
      priority: 2
    },
    {
      title: "In Progress",
      count: inProgressJobs?.length || 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-burgundy-gradient-3",
      textColor: "pink",
      headerClass: "card-header-burgundy-3",
      buttonClass: "btn-burgundy-3",
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
      bgColors: "bg-burgundy-gradient-4",
      textColor: "pink",
      headerClass: "card-header-burgundy-4",
      buttonClass: "btn-burgundy-4",
      status: JobStatus.PENDING_COMPLETION,
      priority: 5,
      shortTitle: "Pending"
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
      bgColors: "bg-burgundy-gradient-5",
      textColor: "pink",
      headerClass: "card-header-burgundy-5",
      buttonClass: "btn-burgundy-5",
      status: JobStatus.INVOICE_APPROVAL,
      priority: 7,
      shortTitle: "Invoices"
    },
    {
      title: "Invoiced",
      count: invoicedJobs?.length || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      bgColors: "bg-burgundy-gradient-5",
      textColor: "pink",
      headerClass: "card-header-burgundy-5",
      buttonClass: "btn-burgundy-5",
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
  .category-card {
    @apply bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 h-full min-h-[140px];
  }
  
  .category-card-header {
    @apply p-4 text-white flex justify-between items-center;
  }
  
  .category-card:hover {
    @apply shadow-lg;
  }
  
  .card-header-burgundy-1 {
    @apply bg-gradient-to-r from-pink-500 to-purple-600;
  }
  
  .card-header-burgundy-2 {
    @apply bg-gradient-to-r from-pink-600 to-purple-700;
  }
  
  .card-header-burgundy-3 {
    @apply bg-gradient-to-r from-pink-700 to-purple-800;
  }
  
  .card-header-burgundy-4 {
    @apply bg-gradient-to-r from-pink-800 to-purple-900;
  }
  
  .card-header-burgundy-5 {
    @apply bg-gradient-to-r from-pink-900 to-purple-950;
  }
  
  .card-header-amber {
    @apply bg-gradient-to-r from-amber-500 to-orange-600;
  }
  
  .card-header-purple {
    @apply bg-gradient-to-r from-purple-500 to-indigo-600;
  }
  
  .card-header-emerald {
    @apply bg-gradient-to-r from-emerald-500 to-teal-600;
  }
  
  .btn-teal {
    @apply inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 min-w-[120px];
  }
  
  .card-enter {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  .card-enter.animated {
    opacity: 1;
    transform: translateY(0);
  }
  
  .bg-teal-gradient {
    @apply bg-gradient-to-r from-teal-600 to-blue-600;
  }
  
  .bg-burgundy-gradient-1 {
    @apply bg-gradient-to-r from-pink-500 to-purple-600;
  }
  
  .bg-burgundy-gradient-2 {
    @apply bg-gradient-to-r from-pink-600 to-purple-700;
  }
  
  .bg-burgundy-gradient-3 {
    @apply bg-gradient-to-r from-pink-700 to-purple-800;
  }
  
  .bg-burgundy-gradient-4 {
    @apply bg-gradient-to-r from-pink-800 to-purple-900;
  }
  
  .bg-burgundy-gradient-5 {
    @apply bg-gradient-to-r from-pink-900 to-purple-950;
  }
  
  .bg-amber-gradient {
    @apply bg-gradient-to-r from-amber-500 to-orange-600;
  }
  
  .bg-purple-gradient {
    @apply bg-gradient-to-r from-purple-500 to-indigo-600;
  }
  
  .bg-emerald-gradient {
    @apply bg-gradient-to-r from-emerald-500 to-teal-600;
  }
</style>

<div class="container mx-auto p-4">
  {#if $currentUser}
    {#if isTechnician}
      <!-- Technician Dashboard -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">My Dashboard</h1>
        <TechJobFocusWidget />
      </div>
      
      <!-- Technician Job List with TechJobFilter -->
      <TechJobFilter />
      
    {:else if isAuthorized}
      <!-- Admin/Office Dashboard -->
      <div class="mb-6">
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
                
                <div class="p-4 flex justify-between items-center">
                  <div>
                    <p class="text-gray-500 text-sm">Click to view all</p>
                  </div>
                  <a 
                    href="/jobs?status={category.status}" 
                    class="btn-teal"
                  >
                    View all {category.shortTitle || category.title}
                  </a>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Admin controls widget for admins only -->
        {#if isAdmin}
          <AdminControlsWidget />
        {/if}
      </div>
      
      <!-- Jobs Section with Status Filter -->
      <div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        <div class="p-4 bg-teal-gradient text-white">
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-xl">Active Jobs</h2>
            <a href="/jobs/new" class="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              + New Job
            </a>
          </div>
        </div>
        
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
    {/if}
  {/if} 